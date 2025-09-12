import multer from 'multer';
import path from 'path';

const memoryStorage = multer.memoryStorage();

export const upload = multer({
  storage: memoryStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  },
});
