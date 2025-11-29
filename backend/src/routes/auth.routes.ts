import { Router } from 'express';
import { register, login, getProfile, getClients, forgotPassword, verifyResetOTP, resetPassword, inviteAdmin, createAdmin, getAdmins, deleteAdmin } from '../controllers/auth.controller.js';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-otp', verifyResetOTP);
router.post('/reset-password', resetPassword);
router.post('/admin/invite', authenticate, requireAdmin, inviteAdmin);
router.post('/admin/create', authenticate, requireAdmin, createAdmin);
router.get('/admin/list', authenticate, requireAdmin, getAdmins);
router.delete('/admin/:id', authenticate, requireAdmin, deleteAdmin);
router.get('/profile', authenticate, getProfile);
router.get('/clients', authenticate, getClients);

export default router;
