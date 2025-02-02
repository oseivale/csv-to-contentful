import { createClient } from "contentful-management";
import { richTextFromMarkdown } from "@contentful/rich-text-from-markdown";
import MarkdownIt from "markdown-it";
import { BLOCKS, INLINES, MARKS } from "@contentful/rich-text-types";
import { documentToHtmlString } from "@contentful/rich-text-html-renderer";
import { htmlToText } from "html-to-text";

export const client = createClient({
  accessToken: process.env.REACT_APP_CONTENTFUL_ACCESS_TOKEN,
});

export const getEnvironment = async () => {
  const space = await client.getSpace(
    process.env.REACT_APP_CONTENTFUL_SPACE_ID
  );
  return space.getEnvironment(process.env.REACT_APP_CONTENTFUL_ENVIRONMENT_ID);
};

export const createEntry = async (contentTypeId, fields) => {
  const environment = await getEnvironment();
  const entry = await environment.createEntry(contentTypeId, { fields });
  await entry.publish();
  return entry;
};

export const stringToRichText = (text) => {
  return {
    nodeType: "document",
    data: {},
    content: [
      {
        nodeType: "paragraph",
        data: {},
        content: [
          {
            nodeType: "text",
            value: text,
            marks: [],
            data: {},
          },
        ],
      },
    ],
  };
};





/**
 * Converts HTML content into Contentful Rich Text format.
 */
const convertHtmlToRichText = (htmlString) => {
  if (!htmlString || htmlString.trim() === "") {
    return {
      nodeType: "document",
      data: {},
      content: [],
    };
  }

  // Convert HTML to plain text
  const plainText = htmlToText(htmlString, {
    wordwrap: false, // Keep formatting
  });

  // Structure as Contentful Rich Text format
  return {
    nodeType: "document",
    data: {},
    content: [
      {
        nodeType: BLOCKS.PARAGRAPH,
        data: {},
        content: [
          {
            nodeType: "text",
            value: plainText,
            marks: [], // No formatting applied
            data: {},
          },
        ],
      },
    ],
  };
};