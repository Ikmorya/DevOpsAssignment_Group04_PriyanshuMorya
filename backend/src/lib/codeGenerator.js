const crypto = require('crypto');
const File = require('../models/File');

const MAX_RETRIES = 10;
// Alphabet: uppercase A-Z + digits 0-9, excluding visually ambiguous chars (0, O, I, 1)
const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 4;

/**
 * Generates a cryptographically secure random 4-character alphanumeric code
 * using a curated charset (no ambiguous chars like 0/O, 1/I).
 * Checks for collision in MongoDB and retries up to MAX_RETRIES times.
 * @returns {Promise<string>} A unique 4-character code e.g. "A3KX"
 */
async function generateUniqueCode() {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    let code = '';
    for (let j = 0; j < CODE_LENGTH; j++) {
      // CSPRNG — NOT Math.random()
      const idx = crypto.randomInt(0, CHARSET.length);
      code += CHARSET[idx];
    }

    const exists = await File.exists({ code });
    if (!exists) return code;
  }
  throw new Error('Failed to generate a unique code after maximum retries — try again.');
}

module.exports = { generateUniqueCode };
