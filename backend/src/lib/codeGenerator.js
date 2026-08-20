const crypto = require('crypto');
const File = require('../models/File');

const MAX_RETRIES = 10;

/**
 * Generates a cryptographically secure random 6-digit code (000000–999999),
 * checks for collision in MongoDB, and retries up to MAX_RETRIES times.
 * @returns {Promise<string>} A unique 6-digit string (with leading zeros preserved)
 */
async function generateUniqueCode() {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    // CSPRNG — NOT Math.random()
    const num = crypto.randomInt(0, 1_000_000);
    const code = String(num).padStart(6, '0');

    const exists = await File.exists({ code });
    if (!exists) return code;
  }
  throw new Error('Failed to generate a unique code after maximum retries — try again.');
}

module.exports = { generateUniqueCode };
