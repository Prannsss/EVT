import { Request, Response } from 'express';
import {
  checkRegularBookingAvailability,
  checkEventBookingAvailability,
  getUnavailableDates,
  getDateBookingSummary,
  checkEventConflictsForDate,
} from '../services/availability.service.js';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * Check availability for a regular accommodation booking
 * GET /api/availability/check-regular
 */
export const checkRegularAvailability = async (req: Request, res: Response) => {
  try {
    const { accommodation_id, check_in_date, check_out_date } = req.query;

    if (!accommodation_id || !check_in_date) {
      return res.status(400).json(
        errorResponse('accommodation_id and check_in_date are required', 400)
      );
    }

    const result = await checkRegularBookingAvailability(
      parseInt(accommodation_id as string),
      check_in_date as string,
      check_out_date as string || null
    );

    res.json(successResponse(result));
  } catch (error: any) {
    console.error('Check regular availability error:', error);
    res.status(500).json(errorResponse(error.message));
  }
};

/**
 * Check availability for an event booking
 * GET /api/availability/check-event
 */
export const checkEventAvailability = async (req: Request, res: Response) => {
  try {
    const { booking_date, event_type } = req.query;

    if (!booking_date || !event_type) {
      return res.status(400).json(
        errorResponse('booking_date and event_type are required', 400)
      );
    }

    if (!['whole_day', 'morning', 'evening'].includes(event_type as string)) {
      return res.status(400).json(
        errorResponse('event_type must be whole_day, morning, or evening', 400)
      );
    }

    const result = await checkEventBookingAvailability(
      booking_date as string,
      event_type as 'whole_day' | 'morning' | 'evening'
    );

    res.json(successResponse(result));
  } catch (error: any) {
    console.error('Check event availability error:', error);
    res.status(500).json(errorResponse(error.message));
  }
};

/**
 * Get all unavailable dates within a date range
 * GET /api/availability/unavailable-dates
 */
export const getUnavailableDatesList = async (req: Request, res: Response) => {
  try {
    const { accommodation_id, start_date, end_date } = req.query;

    const result = await getUnavailableDates(
      accommodation_id ? parseInt(accommodation_id as string) : undefined,
      start_date as string | undefined,
      end_date as string | undefined
    );

    res.json(successResponse(result));
  } catch (error: any) {
    console.error('Get unavailable dates error:', error);
    res.status(500).json(errorResponse(error.message));
  }
};

/**
 * Get booking summary for a specific date
 * GET /api/availability/date-summary/:date
 */
export const getDateSummary = async (req: Request, res: Response) => {
  try {
    const { date } = req.params;

    if (!date) {
      return res.status(400).json(errorResponse('date parameter is required', 400));
    }

    const summary = await getDateBookingSummary(date);

    res.json(successResponse(summary));
  } catch (error: any) {
    console.error('Get date summary error:', error);
    res.status(500).json(errorResponse(error.message));
  }
};

/**
 * Get event conflicts for a specific date
 * GET /api/availability/event-conflicts/:date
 */
export const getEventConflicts = async (req: Request, res: Response) => {
  try {
    const { date } = req.params;

    if (!date) {
      return res.status(400).json(errorResponse('date parameter is required', 400));
    }

    const conflicts = await checkEventConflictsForDate(date);

    res.json(successResponse(conflicts));
  } catch (error: any) {
    console.error('Get event conflicts error:', error);
    res.status(500).json(errorResponse(error.message));
  }
};
