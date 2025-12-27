import { Router } from 'express';
import {
  getTimeSettings,
  getTimeSettingsRaw,
  getTimeSetting,
  modifyTimeSetting,
  updateAllSettings,
} from '../controllers/time-settings.controller.js';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

// Public routes - anyone can view time settings
router.get('/', getTimeSettings);
router.get('/raw', getTimeSettingsRaw);
router.get('/:id', getTimeSetting);

// Admin only routes
router.put('/:id', authenticate, requireAdmin, modifyTimeSetting);
router.put('/', authenticate, requireAdmin, updateAllSettings);

export default router;
