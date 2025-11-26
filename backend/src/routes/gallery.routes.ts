import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import {
  getGalleryImages,
  getGalleryImage,
  uploadGalleryImage,
  removeGalleryImage,
} from '../controllers/gallery.controller.js';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 30 * 1024 * 1024 }, // 30MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

router.get('/', getGalleryImages);
router.get('/:id', getGalleryImage);
router.post('/', authenticate, requireAdmin, upload.array('images', 30), uploadGalleryImage);
router.put('/:id', authenticate, requireAdmin, upload.array('images', 30), uploadGalleryImage);
router.delete('/:id', authenticate, requireAdmin, removeGalleryImage);

export default router;
