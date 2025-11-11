// middleware/upload.js
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const dir = process.env.UPLOAD_DIR || 'uploads';
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, dir),
  filename: (_, file, cb) => {
    const ext = path.extname(file.originalname || '');
    cb(null, `${Date.now()}-${Math.round(Math.random()*1e9)}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { files: 8, fileSize: 5 * 1024 * 1024 }
});

module.exports = upload;
