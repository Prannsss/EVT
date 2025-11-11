import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import {
  getEventBookings,
  getEventBooking,
  addEventBooking,
  modifyEventBooking,
  cancelEventBooking,
  approveEventBooking,
  rejectEventBooking,
  checkOutEventBooking,
  deleteEventBookingById,
} from '../controllers/event-booking.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

// Configure multer for proof of payment uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'event-payment-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only image and PDF files are allowed'));
    }
  },
});

router.get('/', authenticate, getEventBookings);
router.get('/:id', authenticate, getEventBooking);
router.post('/', authenticate, upload.single('proof_of_payment'), addEventBooking);
router.put('/:id', authenticate, upload.single('proof_of_payment'), modifyEventBooking);
router.patch('/:id/cancel', authenticate, cancelEventBooking);
router.patch('/:id/approve', authenticate, approveEventBooking);
router.patch('/:id/reject', authenticate, rejectEventBooking);
router.patch('/:id/checkout', authenticate, checkOutEventBooking);
router.delete('/:id', authenticate, deleteEventBookingById);

export default router;
