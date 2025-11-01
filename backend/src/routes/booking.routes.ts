import { Router } from 'express';
import {
  getBookings,
  getBooking,
  addBooking,
  modifyBooking,
  cancelBooking,
} from '../controllers/booking.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', authenticate, getBookings);
router.get('/:id', authenticate, getBooking);
router.post('/', authenticate, addBooking);
router.put('/:id', authenticate, modifyBooking);
router.patch('/:id/cancel', authenticate, cancelBooking);

export default router;
