import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import {
  checkRegularAvailability,
  checkEventAvailability,
  getUnavailableDatesList,
  getDateSummary,
  getEventConflicts,
} from '../controllers/availability.controller.js';

const router = Router();

// Public endpoints (no authentication required for checking availability)
router.get('/check-regular', checkRegularAvailability);
router.get('/check-event', checkEventAvailability);
router.get('/unavailable-dates', getUnavailableDatesList);
router.get('/date-summary/:date', getDateSummary);
router.get('/event-conflicts/:date', getEventConflicts);

export default router;
