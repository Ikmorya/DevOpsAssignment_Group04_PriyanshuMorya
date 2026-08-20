const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    length: 6,
    index: true,
  },
  files: [
    {
      storageKey: { type: String, required: true }, // relative path in uploads/
      filename:   { type: String, required: true },
      mimetype:   { type: String, default: 'application/octet-stream' },
      size:       { type: Number, default: 0 },
      fileType:   { type: String, enum: ['code', 'normal'], default: 'normal' },
    },
  ],
  uploaderId:     { type: mongoose.Schema.Types.ObjectId, default: null },
  createdAt:      { type: Date, default: Date.now },
  expiresAt:      { type: Date, required: true },  // TTL index field
  downloadCount:  { type: Number, default: 0 },
  burnAfterRead:  { type: Boolean, default: false },
});

// TTL index: MongoDB auto-deletes documents when expiresAt is reached
fileSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('File', fileSchema);
