import React, { useState } from "react";
import { client } from "../utils/contentfulAPI";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styles from "./ContentfulImporter.module.css";
import { Loading } from "../icons/loading";
import { BLOCKS, INLINES } from "@contentful/rich-text-types";
import { parseDocument, DomUtils } from "htmlparser2";
// import * as DomUtils from "domutils";

const ContentfulImporter = ({
  csvData,
  selectedContentType,
  setSelectedContentType,
}) => {
  // const [selectedContentType, setSelectedContentType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  const [progress, setProgress] = useState(0); // Percentage Progress (0-100)
  // eslint-disable-next-line
  const [totalEntries, setTotalEntries] = useState(0);
  // eslint-disable-next-line
  const [completedEntries, setCompletedEntries] = useState(0);

  const spaceId = process.env.REACT_APP_CONTENTFUL_SPACE_ID;
  const environmentId = process.env.REACT_APP_CONTENTFUL_ENVIRONMENT_ID;

  const contentTypeMappings = {
    informationHelpshift: [
      { contentfulField: "internalName", csvHeader: "EN FAQ Title" },
      { contentfulField: "title", csvHeader: "EN FAQ Title" },
      { contentfulField: "helpshiftDetails", csvHeader: "EN FAQ Content" },
      { contentfulField: "associationId", csvHeader: "Association ID" },
    ],
    componentCard: [
      { contentfulField: "internalName", csvHeader: "Association ID" },
      { contentfulField: "title", csvHeader: "EN Section Name" },
    ],
  };

  const handleReload = () => {
    window.location.reload(); // Reloads the page
  };

  // Function to parse raw HTML and convert it to Contentful Rich Text
  const convertHtmlToRichText = async (htmlString, environment) => {
    if (!htmlString || htmlString.trim() === "") {
      return {
        nodeType: "document",
        data: {},
        content: [],
      };
    }

    const dom = parseDocument(htmlString);
    let imagePlaceholders = []; // To store images as placeholders

    const parseNodes = async (nodes) => {
      const blockElements = [];
      let currentInlineNodes = [];

      for (const node of nodes) {
        if (node.type === "text") {
          const textValue = node.data.trim();
          if (textValue) {
            currentInlineNodes.push({
              nodeType: "text",
              value: textValue,
              marks: [],
              data: {},
            });
          }
          continue;
        }

        switch (node.name) {
          case "p":
          case "div": {
            if (currentInlineNodes.length > 0) {
              blockElements.push({
                nodeType: BLOCKS.PARAGRAPH,
                data: {},
                content: currentInlineNodes,
              });
              currentInlineNodes = [];
            }

            const parsedChildren = await parseNodes(node.children || []);
            if (parsedChildren.length > 0) {
              blockElements.push(...parsedChildren);
            }
            break;
          }

          case "a": {
            const containsImage = node.children.some(
              (child) => child.name === "img"
            );
            if (containsImage) {
              const imgNode = node.children.find(
                (child) => child.name === "img"
              );
              if (imgNode && imgNode.attribs?.src) {
                const placeholder = `{{image-${imagePlaceholders.length}}}`;
                imagePlaceholders.push({
                  placeholder,
                  url: imgNode.attribs.src,
                });

                blockElements.push({
                  nodeType: "text",
                  value: placeholder, // Temporary placeholder
                  marks: [],
                  data: {},
                });
              }
            } else {
              currentInlineNodes.push({
                nodeType: INLINES.HYPERLINK,
                data: { uri: node.attribs?.href || "#" },
                content: [
                  {
                    nodeType: "text",
                    value: DomUtils.textContent(node).trim() || "Link",
                    marks: [],
                    data: {},
                  },
                ],
              });
            }
            break;
          }

          case "img": {
            if (node.attribs?.src) {
              const placeholder = `{{image-${imagePlaceholders.length}}}`;
              imagePlaceholders.push({ placeholder, url: node.attribs.src });

              blockElements.push({
                nodeType: "text",
                value: placeholder, // Temporary placeholder
                marks: [],
                data: {},
              });
            }
            break;
          }

          default: {
            const textContent = DomUtils.textContent(node).trim();
            if (textContent) {
              currentInlineNodes.push({
                nodeType: "text",
                value: textContent,
                marks: [],
                data: {},
              });
            }
          }
        }
      }

      if (currentInlineNodes.length > 0) {
        blockElements.push({
          nodeType: BLOCKS.PARAGRAPH,
          data: {},
          content: currentInlineNodes,
        });
      }

      return blockElements;
    };

    return {
      nodeType: "document",
      data: {},
      content: await parseNodes(dom.children || []),
      imagePlaceholders, // Return placeholders to be replaced later
    };
  };

  const createOrGetAsset = async (imageUrl) => {
    try {
      const space = await client.getSpace(
        process.env.REACT_APP_CONTENTFUL_SPACE_ID
      );
      const environment = await space.getEnvironment(
        process.env.REACT_APP_CONTENTFUL_ENVIRONMENT_ID
      );

      // Check if asset already exists
      const assets = await environment.getAssets();
      let existingAsset = assets.items.find(
        (asset) => asset.fields?.file?.["en-US"]?.url === imageUrl
      );

      if (existingAsset) {
        console.log(`✅ Asset already exists with ID: ${existingAsset.sys.id}`);
        return existingAsset.sys.id; // **Return only the asset ID**
      }

      // Create new asset
      let asset = await environment.createAsset({
        fields: {
          title: { "en-US": "Imported Image" },
          file: {
            "en-US": {
              contentType: "image/jpeg",
              fileName: imageUrl.split("/").pop(),
              upload: imageUrl, // External URL import
            },
          },
        },
      });

      await asset.processForAllLocales();
      asset = await environment.getAsset(asset.sys.id); // Fetch latest version

      const publishedAsset = await asset.publish();
      console.log(`🚀 Published asset with ID: ${publishedAsset.sys.id}`);

      return publishedAsset.sys.id; // **Return only the ID**
    } catch (error) {
      console.error("❌ Error creating or retrieving asset:", error);
      throw new Error("Failed to create or retrieve asset.");
    }
  };

  const replacePlaceholdersWithAssets = async (richText, environment) => {
    const { content, imagePlaceholders } = richText;

    console.log("content--- processing--", content);
    for (const { placeholder, url } of imagePlaceholders) {
      // Get or create the asset
      const assetId = await createOrGetAsset(url); //--> LOOK INTO THIS

      console.log("--url--", url);
      // Replace placeholders in the content array
      for (let i = 0; i < content.length; i++) {
        if (content[i].nodeType === "paragraph") {
          // Replace text placeholders inside paragraphs
          content[i].content = content[i].content.map((child) => {
            if (child.nodeType === "text" && child.value === placeholder) {
              return {
                nodeType: BLOCKS.EMBEDDED_ASSET,
                data: {
                  target: {
                    sys: {
                      id: assetId !== null ? assetId : "",
                      linkType: "Asset",
                      type: "Link",
                    },
                  },
                },
                content: [],
              };
            }
            return child;
          });
        } else if (
          content[i].nodeType === "text" &&
          content[i].value === placeholder
        ) {
          // If the placeholder is a standalone node, replace it with an embedded asset block
          content[i] = {
            nodeType: BLOCKS.EMBEDDED_ASSET,
            data: {
              target: {
                sys: {
                  id: assetId !== null ? assetId : "",
                  linkType: "Asset",
                  type: "Link",
                },
              },
            },
            content: [],
          };
        }
      }
    }

    return { nodeType: "document", data: {}, content };
  };

  const handleSubmit = async () => {
    if (!selectedContentType) {
      toast.error("❌ Please select a content type.");
      return;
    }

    setIsSubmitting(true);
    setProgress(0); // Reset progress
    setTotalEntries(csvData.length);
    setCompletedEntries(0);

    try {
      const environment = await client
        .getSpace(spaceId)
        .then((space) => space.getEnvironment(environmentId));

      const mappings = contentTypeMappings[selectedContentType];

      for (const row of csvData) {
        const fields = {};

        for (const { contentfulField, csvHeader } of mappings) {
          const value = row[csvHeader]?.trim();
          if (!value) continue; // Skip empty values

          // ✅ Handle Rich Text Fields
          if (contentfulField === "helpshiftDetails") {
            const richTextContent = await convertHtmlToRichText(
              value,
              environment
            );
            const finalRichText = await replacePlaceholdersWithAssets(
              richTextContent,
              environment
            );
            fields[contentfulField] = { "en-US": finalRichText };
          } else {
            fields[contentfulField] = {
              "en-US": typeof value === "string" ? value.trim() : value,
            };
          }
        }

        console.log(
          "🚀 Creating Entry with Fields:",
          JSON.stringify(fields, null, 2)
        );

        // ✅ Step 1: Create the entry in Contentful
        let entry = await environment.createEntry(selectedContentType, {
          fields,
        });
        console.log("✅ Entry Created Successfully:", entry);

        // ✅ Step 2: Fetch the latest entry version
        entry = await environment.getEntry(entry.sys.id);
        console.log("🔄 Latest Entry Version:", entry.sys.version);

        setCompletedEntries((prev) => {
          const newCompleted = prev + 1;
          setProgress(Math.round((newCompleted / csvData.length) * 100));
          return newCompleted;
        });

        // ✅ Step 3: Publish using the latest version
        const publishedEntry = await entry.publish();
        console.log("✅ Entry Published Successfully:", publishedEntry);
      }

      toast.success(
        "🎉 All entries have been imported and published successfully!"
      );
    } catch (error) {
      console.error("❌ Error creating entries:", error);
      toast.error(`🚨 Error: ${error.message || "Unknown error"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`${styles.container} ${
        selectedContentType ? styles.show : ""
      }`}
    >
      {/* <h3 className={styles.title}>
        Are you creating <strong>FAQ</strong> entries or{" "}
        <strong>Articles/Products?</strong>
      </h3> */}
      {/* <select
      className={styles.select}
      // className={styles.dropdown}
      value={selectedContentType}
      onChange={(e) => setSelectedContentType(e.target.value)}
    >
      <option value="">-- Select the content type you are creating--</option>
      <option value="informationHelpshift">FAQ</option>
      <option value="componentCard">Product/Article</option>
    </select> */}

      {selectedContentType && (
        <div className={styles.contentTypeContainer}>
          <div>
            {selectedContentType === "informationHelpshift" && (
              <h3 className={styles.title}>
                Looks like you're trying to create new entries for{" "}
                <strong>FAQs</strong>
              </h3>
            )}

            {selectedContentType === "componentCard" && (
              <h3 className={styles.title}>
                Looks like you're trying to create new entries for{" "}
                <strong>Articles & Products</strong>
              </h3>
            )}
          </div>

          <label className={styles.label}>Selected Content Type:</label>
          <select
            value={selectedContentType}
            onChange={(e) => setSelectedContentType(e.target.value)}
            className={styles.dropdown}
          >
            <option value="informationHelpshift">Information Helpshift</option>
            <option value="componentCard">Component Card</option>
          </select>
        </div>
      )}
      <h3 style={{ color: "red" }}>Does this look correct?</h3>
      <div className={styles.checkboxContainer}>
        <input
          type="checkbox"
          id="confirmImport"
          checked={isChecked}
          onChange={() => setIsChecked(!isChecked)}
          className={styles.checkbox}
        />
        <label htmlFor="confirmImport" className={styles.checkboxLabel}>
          I confirm that the data is correct and ready for import.
        </label>
      </div>
      {csvData.length > 0 && progress !== 100 && (
        <button
          className={`${styles.button} ${isSubmitting ? styles.hide : ""}`}
          onClick={handleSubmit}
          // disabled={isSubmitting}
          disabled={!isChecked || isSubmitting}
        >
          {"Import to Contentful"}
        </button>
      )}

      <div>
        {isSubmitting && progress < 100 && (
          // <div
          //   style={{
          //     width: "100%",
          //     backgroundColor: "#e0e0e0",
          //     borderRadius: "5px",
          //     marginTop: "30px",
          //   }}
          // >
          //   <div
          //     style={{
          //       width: `${progress}%`,
          //       backgroundColor: progress < 100 ? "#4caf50" : "#2196F3",
          //       height: "10px",
          //       borderRadius: "5px",
          //       transition: "width 0.4s ease-in-out",
          //     }}
          //   ></div>
          // </div>
          <div className={styles.loading}>
            <Loading progress={progress} />
          </div>
        )}

        {progress === 100 && (
          <>
            <div className={styles.loading}>
              <Loading progress={progress} />
              {/* <Completed /> */}
              <button
                className={`${styles.reload}  ${
                  progress === 100 ? styles.show : ""
                }`}
                onClick={handleReload}
              >
                Upload More Files
              </button>
            </div>
          </>
        )}
        {/* {progress === 100 ? (
           <div className={styles.loading}>
           <Loading progress={progress} />
         </div>
        ) : null} */}
        {/* {isSubmitting && (
          <p style={{ textAlign: "center", marginTop: "5px" }}>
            {progress}% Completed
          </p>
        )} */}
      </div>
    </div>
  );
};

export default ContentfulImporter;
