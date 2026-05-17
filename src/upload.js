const express = require("express");
const multer = require("multer");
const fs = require("fs");
const File = require("./models/FileModel");
const logger = require("./utils/logger");

const router = express.Router();
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
});

const ALLOWED_TYPES = [
  "application/pdf",
  "text/plain",
  "text/csv",
  "application/json",
  "application/xml",
  "text/xml",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

// ✅ Upload endpoint
router.post("/upload", (req, res) => {
  upload.single("file")(req, res, async (err) => {
    console.log("🔥 Received upload:", req.file ? req.file.originalname : "No file received");
    try {
      if (err instanceof multer.MulterError) {
        logger.warn("File too large", { filename: req.file?.originalname });
        return res.status(400).json({ error: "File too large!" });
      } else if (err) {
        logger.error("Multer upload failed", { error: err.message });
        return res.status(500).json({ error: "Upload failed." });
      }

      if (!req.file) {
        logger.warn("No file uploaded");
        return res.status(400).json({ error: "No file uploaded!" });
      }

      if (!ALLOWED_TYPES.includes(req.file.mimetype)) {
        fs.unlinkSync(req.file.path);
        logger.warn("Invalid file type rejected", { type: req.file.mimetype });
        return res.status(400).json({ error: "Invalid file type!" });
      }

      const newFile = new File({
        filename: req.file.filename,
        filepath: req.file.path,
        size: `${(req.file.size / 1024).toFixed(2)} KB`,
        format: req.file.mimetype,
      });

      await newFile.save();
      logger.info("File uploaded successfully", { filename: req.file.filename });

      res.status(200).json({
        message: "File uploaded successfully!",
        file: newFile,
      });
    } catch (error) {
      logger.error("Upload error", { message: error.message, stack: error.stack });
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
});

module.exports = router;
