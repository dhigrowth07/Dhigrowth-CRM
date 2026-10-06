import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Uploads directory path
export const UPLOADS_DIR = path.resolve(__dirname, '../../uploads');

// Ensure uploads directory exists on boot
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// 1. Configure Multer Disk Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueName = `${Date.now()}_${cleanBase}${ext}`;
    cb(null, uniqueName);
  },
});

// 2. File Filter (PDFs, Images, Documents, Videos, Audio)
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    // Images
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml',
    // Documents
    'application/pdf',
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    // Audio / Video
    'audio/mpeg',
    'audio/mp4',
    'audio/ogg',
    'audio/wav',
    'audio/aac',
    'video/mp4',
    'video/webm',
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type "${file.mimetype}" is not supported. Allowed formats: Images, PDFs, CSV, Audio, MP4.`), false);
  }
};

// 3. Multer Instance (25MB size limit)
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25 MB
  },
});

export const uploadSingle = (fieldName = 'file') => upload.single(fieldName);
export const uploadArray = (fieldName = 'files', maxCount = 5) => upload.array(fieldName, maxCount);

/**
 * Backward compatibility helper: saves a Base64 encoded string directly to the uploads folder
 *
 * @param {Object} options
 * @param {string} options.data - Base64 string (with or without data:image/png;base64, prefix)
 * @param {string} [options.filename='upload_file'] - Desired file name
 * @returns {{filename: string, filePath: string, relativeUrl: string, sizeBytes: number}}
 */
export function saveBase64Media({ data, filename = 'upload_media' }) {
  if (!data) {
    throw new Error('No base64 data provided');
  }

  let buffer;
  let ext = '.png';

  const matches = data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (matches && matches.length === 3) {
    const mime = matches[1];
    if (mime.includes('jpeg') || mime.includes('jpg')) ext = '.jpg';
    else if (mime.includes('webp')) ext = '.webp';
    else if (mime.includes('gif')) ext = '.gif';
    else if (mime.includes('svg')) ext = '.svg';
    else if (mime.includes('pdf')) ext = '.pdf';
    else ext = '.png';
    buffer = Buffer.from(matches[2], 'base64');
  } else {
    buffer = Buffer.from(data, 'base64');
  }

  const cleanBase = filename.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
  const safeName = `${Date.now()}_${cleanBase}${ext}`;
  const filePath = path.join(UPLOADS_DIR, safeName);

  fs.writeFileSync(filePath, buffer);

  return {
    filename: safeName,
    filePath,
    relativeUrl: `/uploads/${safeName}`,
    sizeBytes: buffer.length,
  };
}

export default {
  UPLOADS_DIR,
  upload,
  uploadSingle,
  uploadArray,
  saveBase64Media,
};
