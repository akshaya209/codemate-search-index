const express = require("express");
const fs = require("fs").promises;
const path = require("path");
const pdf = require("pdf-parse");
const mammoth = require("mammoth");
const { parse: csvParse } = require("csv-parse/sync");
const xml2js = require("xml2js");
const File = require("./models/FileModel");

const router = express.Router();

function wordCount(text) {
  return text ? text.trim().split(/\s+/).length : 0;
}

async function extractFromFile(filePath, mimeType) {
  const ext = path.extname(filePath).toLowerCase();

  try {
    if (mimeType === "application/pdf" || ext === ".pdf") {
      const buffer = await fs.readFile(filePath);
      const data = await pdf(buffer);
      return data.text;
    }

    if (mimeType === "text/plain" || ext === ".txt") {
      return await fs.readFile(filePath, "utf8");
    }

    if (mimeType === "text/csv" || ext === ".csv") {
      const raw = await fs.readFile(filePath, "utf8");
      const records = csvParse(raw, { skip_empty_lines: true });
      return records.map((r) => r.join(" ")).join("\n");
    }

    if (mimeType === "application/json" || ext === ".json") {
      const raw = await fs.readFile(filePath, "utf8");
      return JSON.stringify(JSON.parse(raw), null, 2);
    }

    if (mimeType === "application/xml" || mimeType === "text/xml" || ext === ".xml") {
      const raw = await fs.readFile(filePath, "utf8");
      const parsed = await new xml2js.Parser().parseStringPromise(raw);
      return JSON.stringify(parsed, null, 2);
    }

    if (
      mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;
    }

    return "Unsupported file type";
  } catch (err) {
    console.error("Extraction error:", err);
    return "Error extracting file";
  }
}

router.post("/extract/:ingestionId", async (req, res) => {
  console.log("🧩 Extract API called with:", req.params.ingestionId);
  try {
    const { ingestionId } = req.params;
    const fileDoc = await File.findOne({ ingestionId });

    if (!fileDoc) return res.status(404).json({ error: "File not found" });

    const text = await extractFromFile(fileDoc.filepath, fileDoc.format);
    fileDoc.extractedText = text;
    fileDoc.extractionMeta = {
      wordCount: wordCount(text),
      extractedAt: new Date(),
    };
    await fileDoc.save();

    res.status(200).json({
      message: "Extraction completed successfully",
      snippet: text.substring(0, 300),
      meta: fileDoc.extractionMeta,
    });
  } catch (error) {
    console.error("Extraction failed:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
