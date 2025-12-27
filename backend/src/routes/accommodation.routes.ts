import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import {
  getAccommodations,
  getAccommodation,
  addAccommodation,
  modifyAccommodation,
  removeAccommodation,
  updateAccommodationAvailability,
} from '../controllers/accommodation.controller.js';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

// Configure multer for accommodation image uploads
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
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
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

router.get('/', getAccommodations);
router.get('/:id', getAccommodation);
router.post('/', authenticate, requireAdmin, upload.fields([
  { name: 'mainImages', maxCount: 10 },
  { name: 'panoramicImage', maxCount: 1 }
]), addAccommodation);
router.put('/:id', authenticate, requireAdmin, upload.fields([
  { name: 'mainImages', maxCount: 10 },
  { name: 'panoramicImage', maxCount: 1 }
]), modifyAccommodation);
router.put('/:id/availability', authenticate, requireAdmin, updateAccommodationAvailability);
router.delete('/:id', authenticate, requireAdmin, removeAccommodation);

export default router;
