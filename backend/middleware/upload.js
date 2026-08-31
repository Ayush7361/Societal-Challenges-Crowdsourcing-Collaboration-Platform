const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ImageFile = require('../models/ImageFile');

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${Date.now()}${ext}`);
  },
});

function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png|webp|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Images only (jpg, jpeg, png, webp, gif)!'));
  }
}

const collectFiles = (req) => {
  const files = [];
  if (req.file) files.push(req.file);
  if (Array.isArray(req.files)) {
    files.push(...req.files);
  } else if (req.files && typeof req.files === 'object') {
    Object.values(req.files).forEach((group) => {
      if (Array.isArray(group)) files.push(...group);
    });
  }
  return files;
};

const persistUpload = async (file) => {
  if (!file?.filename || !file.path) return;
  const data = fs.readFileSync(file.path);
  await ImageFile.findOneAndUpdate(
    { filename: file.filename },
    { filename: file.filename, contentType: file.mimetype || 'image/jpeg', data },
    { upsert: true, setDefaultsOnInsert: true }
  );
};

/** Save multer disk files into Mongo so images survive ephemeral hosts (e.g. Render). */
const persistUploadedFiles = async (req, res, next) => {
  try {
    await Promise.all(collectFiles(req).map(persistUpload));
    next();
  } catch (err) {
    console.error('Persist upload error:', err);
    next(err);
  }
};

/** Serve an uploaded image from disk, then MongoDB if the file is gone. */
const serveUploadedImage = async (req, res) => {
  try {
    const filename = path.basename(req.params.filename || '');
    if (!filename) {
      return res.status(400).json({ message: 'Missing filename' });
    }

    const diskPath = path.join(uploadDir, filename);
    if (fs.existsSync(diskPath)) {
      return res.sendFile(diskPath);
    }

    const stored = await ImageFile.findOne({ filename });
    if (!stored) {
      return res.status(404).json({ message: 'Image not found' });
    }

    res.set('Content-Type', stored.contentType || 'image/jpeg');
    res.set('Cache-Control', 'public, max-age=86400');
    return res.send(stored.data);
  } catch (err) {
    console.error('Serve upload error:', err);
    return res.status(500).json({ message: 'Failed to load image' });
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

upload.persistUploadedFiles = persistUploadedFiles;
upload.serveUploadedImage = serveUploadedImage;

module.exports = upload;
