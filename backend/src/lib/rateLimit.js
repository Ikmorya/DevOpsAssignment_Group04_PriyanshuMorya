const rateLimit = require('express-rate-limit');

/**
 * Strict limiter for the code-retrieval endpoint.
 * 5 attempts per IP per minute — prevents brute-forcing the 4-character space.
 */
const retrieveLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many attempts. Please wait before trying again.',
    retryAfter: 60,
  },
  keyGenerator: (req) => req.ip,
});

/**
 * Relaxed limiter for the upload endpoint.
 * 10 uploads per IP per minute.
 */
const uploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many uploads from this IP. Please slow down.',
  },
});

/**
 * Relaxed limiter for the download endpoint.
 * Once they know the code, they should be able to download multiple files.
 */
const downloadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many downloads. Please slow down.',
  },
});

module.exports = { retrieveLimiter, uploadLimiter, downloadLimiter };
