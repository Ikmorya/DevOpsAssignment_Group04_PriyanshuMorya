const express = require('express');
const path    = require('path');
const File    = require('../models/File');
const { resolveStoragePath, deleteFile } = require('../lib/storage');
const { retrieveLimiter } = require('../lib/rateLimit');

const router = express.Router();

// GET /api/retrieve/:code — returns file metadata (rate-limited)
router.get('/:code', retrieveLimiter, async (req, res) => {
  const { code } = req.params;

  if (!/^\d{6}$/.test(code)) {
    return res.status(400).json({ error: 'Code must be exactly 6 digits.' });
  }

  const record = await File.findOne({ code });
  if (!record) {
    return res.status(404).json({ error: 'Code not found or has expired.' });
  }

  // Increment download count
  record.downloadCount += 1;
  await record.save();

  return res.json({
    code:          record.code,
    files:         record.files.map((f) => ({
      filename: f.filename,
      mimetype: f.mimetype,
      size:     f.size,
      fileType: f.fileType,
      // storageKey is NEVER exposed; client uses /api/retrieve/:code/download/:index
    })),
    expiresAt:     record.expiresAt,
    downloadCount: record.downloadCount,
    burnAfterRead: record.burnAfterRead,
  });
});

// GET /api/retrieve/:code/download/:index — streams the actual file bytes
router.get('/:code/download/:index', retrieveLimiter, async (req, res) => {
  const { code, index } = req.params;

  if (!/^\d{6}$/.test(code)) {
    return res.status(400).json({ error: 'Invalid code.' });
  }

  const record = await File.findOne({ code });
  if (!record) {
    return res.status(404).json({ error: 'Code not found or has expired.' });
  }

  const idx = parseInt(index, 10);
  if (isNaN(idx) || idx < 0 || idx >= record.files.length) {
    return res.status(400).json({ error: 'Invalid file index.' });
  }

  const fileEntry  = record.files[idx];
  const filePath   = resolveStoragePath(fileEntry.storageKey);

  // After streaming, handle burnAfterRead
  res.on('finish', async () => {
    if (record.burnAfterRead) {
      deleteFile(fileEntry.storageKey);
      // Remove the file entry from the array
      record.files.splice(idx, 1);
      if (record.files.length === 0) {
        await File.deleteOne({ _id: record._id });
      } else {
        await record.save();
      }
    }
  });

  res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileEntry.filename)}"`);
  res.setHeader('Content-Type', fileEntry.mimetype || 'application/octet-stream');
  res.sendFile(filePath, { root: '/' }, (err) => {
    if (err && !res.headersSent) {
      res.status(500).json({ error: 'Failed to send file.' });
    }
  });
});

module.exports = router;
