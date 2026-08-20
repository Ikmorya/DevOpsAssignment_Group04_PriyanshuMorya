const path = require('path');
const fs   = require('fs');
const { v4: uuidv4 } = require('uuid');

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

/**
 * Moves a multer temp file to permanent storage.
 * Returns the relative storageKey used to retrieve the file later.
 * @param {{ path: string, originalname: string }} multerFile
 * @returns {{ storageKey: string }}
 */
function storeFile(multerFile) {
  const ext = path.extname(multerFile.originalname);
  const key = `${uuidv4()}${ext}`;
  const dest = path.join(UPLOAD_DIR, key);
  fs.renameSync(multerFile.path, dest);
  return { storageKey: key };
}

/**
 * Returns the absolute path to a stored file given its storageKey.
 * @param {string} storageKey
 * @returns {string}
 */
function resolveStoragePath(storageKey) {
  return path.join(UPLOAD_DIR, storageKey);
}

/**
 * Deletes a stored file. Silent if already missing.
 * @param {string} storageKey
 */
function deleteFile(storageKey) {
  const filePath = resolveStoragePath(storageKey);
  try {
    fs.unlinkSync(filePath);
  } catch (_) { /* already gone */ }
}

module.exports = { storeFile, resolveStoragePath, deleteFile };
