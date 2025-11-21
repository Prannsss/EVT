import { Router } from 'express';
import {
  getWalkInLogs,
  getWalkInLog,
  createWalkInLogEntry,
  updateWalkInLogEntry,
  deleteWalkInLogEntry,
  checkOutWalkInLogEntry,
} from '../controllers/walk-in.controller.js';
import { authenticateToken, requireAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

// All walk-in routes require admin authentication
router.get('/', authenticateToken, requireAdmin, getWalkInLogs);
router.get('/:id', authenticateToken, requireAdmin, getWalkInLog);
router.post('/', authenticateToken, requireAdmin, createWalkInLogEntry);
router.post('/:id/checkout', authenticateToken, requireAdmin, checkOutWalkInLogEntry);
router.put('/:id', authenticateToken, requireAdmin, updateWalkInLogEntry);
router.delete('/:id', authenticateToken, requireAdmin, deleteWalkInLogEntry);

export default router;
