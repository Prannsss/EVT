import { Router } from 'express';
import {
  sendVerificationCode,
  verifyEmailCode,
  resendVerificationCode,
} from '../controllers/verification.controller.js';

const router = Router();

// POST /api/verification/send - Send verification code
router.post('/send', sendVerificationCode);

// POST /api/verification/verify - Verify code
router.post('/verify', verifyEmailCode);

// POST /api/verification/resend - Resend verification code
router.post('/resend', resendVerificationCode);

// Admin routes removed - verification now automatic after email code verification
// No longer need manual approval/rejection by admin

export default router;
