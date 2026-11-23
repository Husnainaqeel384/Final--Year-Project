import multer from 'multer';

/** Held in memory so the contents can be inspected before anything is written to disk. */
export const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024, files: 1 },
}).single('file');

export const spreadsheetUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
}).single('file');

// Photos are shrunk in the browser first; this allows for a large original if that step is skipped.
export const receiptUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
}).single('file');
