import React, { useState } from "react";
import CSVUploader from "./components/CSVUploader";
import ContentfulImporter from "./components/ContentfulImporter";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  const [csvData, setCsvData] = useState([]);
  const [selectedContentType, setSelectedContentType] = useState("");

  return (
    <div>
      <h1 style={{ textAlign: 'center'}}>CSV to Contentful Import Tool</h1>
      <CSVUploader setSelectedContentType={setSelectedContentType} selectedContentType={selectedContentType} onCsvParsed={setCsvData} />
      {csvData.length > 0 && <ContentfulImporter setSelectedContentType={setSelectedContentType} selectedContentType={selectedContentType} csvData={csvData} />}
      <ToastContainer />
    </div>
  );
};

export default App;