import { Router } from 'express';
import {
  generateReport,
  getReportClients,
  updateClientGuestNames,
} from '../controllers/report.controller.js';
import { authenticateToken, requireAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

// All report routes require admin authentication
router.get('/generate', authenticateToken, requireAdmin, generateReport);
router.get('/clients', authenticateToken, requireAdmin, getReportClients);
router.put('/clients/:clientId/guests', authenticateToken, requireAdmin, updateClientGuestNames);

export default router;
