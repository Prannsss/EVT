import { Router } from 'express';
import { getPricing, updatePricingSettings } from '../controllers/pricing.controller.js';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

// Public route - anyone can view pricing
router.get('/', getPricing);

// Admin only - update pricing
router.put('/', authenticate, requireAdmin, updatePricingSettings);

export default router;
