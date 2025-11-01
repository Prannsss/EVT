import { Router } from 'express';
import { getEmailLogsController } from '../controllers/email-log.controller.js';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

// GET /api/email-logs - Get email logs (admin only)
router.get('/', authenticate, requireAdmin, getEmailLogsController);

export default router;
