// src/App.js
import React, { useState } from "react";
import SearchBar from "./components/SearchBar";
import UploadFile from "./components/UploadFile";
import SearchResults from "./components/SearchResults";
import { search } from "./api";

export default function App() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");
  const [page, setPage] = useState(1);

  async function handleSearch(q, filters = {}) {
    if (!q || !q.trim()) {
      setError("⚠ Please enter a search term.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await search(q, { page: 1, limit: 50, ...filters });
      setResults(data.results || []);
      setPage(1);
    } catch (err) {
      console.error(err);
      setError("❌ " + (err.message || "Search failed"));
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  function onUploaded(fileDoc) {
    console.log("Uploaded file", fileDoc);
  }

  const itemsPerPage = 5;
  const start = (page - 1) * itemsPerPage;
  const paginatedResults = results.slice(start, start + itemsPerPage);
  const totalPages = Math.max(1, Math.ceil(results.length / itemsPerPage));

  return (
    <div style={{ padding: "40px 20px", fontFamily: "Inter, sans-serif", maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ textAlign: "center" }}>🔍 Search Dashboard</h1>
      <p style={{ textAlign: "center", color: "#666" }}>
        Upload → Extract → Normalize → Tokenize → Build → Search
      </p>

      <div style={{ marginTop: 20 }}>
        <UploadFile onUploaded={onUploaded} setUploadStatus={setUploadStatus} />
        {uploadStatus && (
          <p
            style={{
              textAlign: "center",
              color: uploadStatus.startsWith("✅")
                ? "green"
                : uploadStatus.startsWith("❌")
                ? "red"
                : "#333",
            }}
          >
            {uploadStatus}
          </p>
        )}
      </div>

      <div style={{ marginTop: 30 }}>
        <SearchBar onSearch={handleSearch} loading={loading} />
      </div>

      {loading && <p style={{ textAlign: "center" }}>🔎 Searching...</p>}
      {!loading && error && <p style={{ textAlign: "center", color: "red" }}>{error}</p>}

      <SearchResults
        results={paginatedResults}
        page={page}
        setPage={setPage}
        totalPages={totalPages}
      />
    </div>
  );
}
