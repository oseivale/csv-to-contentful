import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import styles from "./CSVUploader.module.css";
import { Confirm } from "../icons/confirm";
import { Info } from "../icons/info";

const CSVUploader = ({ onCsvParsed, setSelectedContentType }) => {
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [fileName, setFileName] = useState("");

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setFileName(file.name);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        setCsvHeaders(result.meta.fields);
        onCsvParsed(result.data);
      },
      error: (error) => {
        console.error("Error parsing CSV:", error);
        alert("Error parsing CSV file. Please check and try again.");
      },
    });
  };

  // Auto-select content type based on detected CSV headers
  useEffect(() => {
    if (csvHeaders.includes("EN FAQ Title")) {
      setSelectedContentType("informationHelpshift");
      // onContentTypeSelected("informationHelpshift");
    } else if (csvHeaders.includes("EN Section Name")) {
      setSelectedContentType("componentCard");
      // onContentTypeSelected("componentCard");
    } else {
      setSelectedContentType(""); // Reset if no match found
    }
  }, [csvHeaders, setSelectedContentType]);

  console.log("csvHeaders", csvHeaders);

  return (
    <div className={styles.container}>
      <div className={styles.infoWrapper}>
        <Info />
        <div>
          <h4>
            This tool allows you to import data from a .csv file into
            Contentful.
          </h4>
          <h5> Below are the steps:</h5>
          <ol className={styles.instructions}>
            <li>
              Upload your .csv file - the file must have the correct headers.
            </li>
            <sub><strong>CSV headers for FAQs:</strong> Original FAQ Title,	EN FAQ Title,	Original FAQ Content,	EN FAQ Content</sub><br/>
            <sub><strong>CSV headers for a Product/Article:</strong> Original Section Name, EN Section Name</sub>
            <li>
              Once uploaded, the headers will be read and based on the headers
              the contentful content type will be populated below.
            </li>
            <li>
              If everything looks correct, confirm your settings and click
              "Import".
            </li>
          </ol>
        </div>
      </div>
      <h3>Upload CSV File</h3>
      <div className={styles.inputWrapper}>
        <input type="file" accept=".csv" onChange={handleFileUpload} />{" "}
        {fileName && <Confirm color={"green"} />}
      </div>

      {fileName && (
        <p>
          <strong>Uploaded:</strong> {fileName}
        </p>
      )}
      {csvHeaders.length > 0 && (
        <p>
          <strong>CSV Headers Detected:</strong> {csvHeaders.join(", ")}
        </p>
      )}
    </div>
  );
};

export default CSVUploader;
