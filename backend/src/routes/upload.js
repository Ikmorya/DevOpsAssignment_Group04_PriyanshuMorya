const express  = require('express');
const multer   = require('multer');
const path     = require('path');
const os       = require('os');
const File     = require('../models/File');
const { generateUniqueCode } = require('../lib/codeGenerator');
const { storeFile }          = require('../lib/storage');
const { uploadLimiter }      = require('../lib/rateLimit');

const router = express.Router();

// ── Allowed extensions (basic allow-list) ─────────────────────────────────────
const ALLOWED_EXTS = new Set([
  // documents
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.md', '.csv',
  // images
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico',
  // archives
  '.zip', '.tar', '.gz', '.rar', '.7z',
  // code
  '.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.c', '.cpp', '.cs', '.go',
  '.rb', '.php', '.sh', '.bash', '.html', '.css', '.json', '.xml', '.yaml',
  '.yml', '.toml', '.rs', '.swift', '.kt', '.sql',
  // misc
  '.mp4', '.mp3', '.wav', '.webm',
]);

const CODE_EXT = new Set([
  '.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.c', '.cpp', '.cs', '.go',
  '.rb', '.php', '.sh', '.bash', '.html', '.css', '.json', '.xml', '.yaml',
  '.yml', '.toml', '.rs', '.swift', '.kt', '.sql', '.txt', '.md',
]);

const MAX_SIZE_MB  = parseInt(process.env.MAX_FILE_SIZE_MB || '50', 10);
const EXPIRY_HOURS = parseInt(process.env.CODE_EXPIRY_HOURS  || '24', 10);

// Store to OS temp dir; storage.js moves to final location
const upload = multer({
  dest: os.tmpdir(),
  limits: { fileSize: MAX_SIZE_MB * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ALLOWED_EXTS.has(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`File type "${ext}" is not allowed.`));
    }
  },
});

// POST /api/upload
router.post('/', uploadLimiter, upload.array('files', 20), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files provided.' });
    }

    const burnAfterRead = req.body.burnAfterRead === 'true';
    const expiresAt     = new Date(Date.now() + EXPIRY_HOURS * 60 * 60 * 1000);
    const code          = await generateUniqueCode();

    // Move files to permanent storage
    const storedFiles = req.files.map((f) => {
      const ext      = path.extname(f.originalname).toLowerCase();
      const { storageKey } = storeFile(f);
      return {
        storageKey,
        filename: f.originalname,
        mimetype: f.mimetype,
        size:     f.size,
        fileType: CODE_EXT.has(ext) ? 'code' : 'normal',
      };
    });

    const record = await File.create({
      code,
      files: storedFiles,
      expiresAt,
      burnAfterRead,
    });

    return res.status(201).json({
      code,
      expiresAt,
      fileCount: storedFiles.length,
      id: record._id,
    });
  } catch (err) {
    console.error('[upload]', err.message);
    // Clean up any temp files that weren't moved
    (req.files || []).forEach((f) => {
      try { require('fs').unlinkSync(f.path); } catch (_) {}
    });
    return res.status(500).json({ error: err.message || 'Upload failed.' });
  }
});

module.exports = router;
