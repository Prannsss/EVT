import { Request, Response } from 'express';
import {
  getAllPricing,
  getPricingByCategory,
  updatePricing,
} from '../models/pricing.model.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { PricingUpdate } from '../types/pricing.js';

export const getPricing = async (req: Request, res: Response) => {
  try {
    const { category } = req.query;

    if (category && typeof category === 'string') {
      const pricing = await getPricingByCategory(category);
      return res.json(successResponse(pricing));
    }

    const allPricing = await getAllPricing();
    res.json(successResponse(allPricing));
  } catch (error: any) {
    console.error('Get pricing error:', error);
    res.status(500).json(errorResponse(error.message));
  }
};

export const updatePricingSettings = async (req: Request, res: Response) => {
  try {
    const { updates } = req.body;

    if (!updates || !Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json(errorResponse('Updates array is required', 400));
    }

    // Validate all updates
    for (const update of updates as PricingUpdate[]) {
      if (!update.category || !update.type || update.price === undefined) {
        return res.status(400).json(
          errorResponse('Each update must have category, type, and price', 400)
        );
      }

      const price = Number(update.price);
      if (isNaN(price) || price < 0) {
        return res.status(400).json(
          errorResponse('Price must be a valid positive number', 400)
        );
      }

      // Normalize price to 2 decimal places
      update.price = parseFloat(price.toFixed(2));
    }

    await updatePricing(updates);

    res.json(successResponse(null, 'Pricing updated successfully'));
  } catch (error: any) {
    console.error('Update pricing error:', error);
    res.status(500).json(errorResponse(error.message));
  }
};
