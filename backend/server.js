require('dotenv').config();

const express  = require('express');
const cors     = require('cors');
const mongoose = require('mongoose');
const path     = require('path');

const uploadRoute   = require('./src/routes/upload');
const retrieveRoute = require('./src/routes/retrieve');

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Trust proxy headers (for accurate IP-based rate limiting behind nginx/etc.)
app.set('trust proxy', 1);

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/upload',   uploadRoute);
app.use('/api/retrieve', retrieveRoute);

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok', ts: new Date() }));

// ── MongoDB + Start ───────────────────────────────────────────────────────────
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/filesharingnetwork';

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log(`✅  MongoDB connected → ${MONGODB_URI}`);
    app.listen(PORT, () => {
      console.log(`🚀  Backend running  → http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌  MongoDB connection failed:', err.message);
    process.exit(1);
  });
