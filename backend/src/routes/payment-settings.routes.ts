import { Router } from 'express';
import { getPaymentSettings, updateQRCode } from '../controllers/payment-settings.controller.js';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware.js';
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

const router = Router();

// Public route - anyone can view payment settings
router.get('/', getPaymentSettings);

// Admin only - update QR code
router.put('/qr-code', authenticate, requireAdmin, upload.fields([{ name: 'qrCode', maxCount: 1 }]), updateQRCode);

export default router;
