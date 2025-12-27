import { Request, Response } from 'express';
import {
  checkRegularBookingAvailability,
  checkEventBookingAvailability,
  getUnavailableDates,
  getDateBookingSummary,
  checkEventConflictsForDate,
  getAvailableSlotsForAccommodation,
  getAvailableAccommodations,
  TimeSlotType,
} from '../services/availability.service.js';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * Check availability for a regular accommodation booking
 * GET /api/availability/check-regular
 */
export const checkRegularAvailability = async (req: Request, res: Response) => {
  try {
    const { accommodation_id, check_in_date, time_slot } = req.query;

    if (!accommodation_id || !check_in_date) {
      return res.status(400).json(
        errorResponse('accommodation_id and check_in_date are required', 400)
      );
    }

    // Validate time_slot if provided
    const validSlots: TimeSlotType[] = ['morning', 'night', 'whole_day'];
    const slot = (time_slot as TimeSlotType) || 'morning';
    
    if (time_slot && !validSlots.includes(slot)) {
      return res.status(400).json(
        errorResponse('time_slot must be morning, night, or whole_day', 400)
      );
    }

    const result = await checkRegularBookingAvailability(
      parseInt(accommodation_id as string),
      check_in_date as string,
      slot
    );

    res.json(successResponse(result));
  } catch (error: any) {
    console.error('Check regular availability error:', error);
    res.status(500).json(errorResponse(error.message));
  }
};

/**
 * Get available time slots for an accommodation on a date
 * GET /api/availability/slots
 */
export const getAvailableSlots = async (req: Request, res: Response) => {
  try {
    const { accommodation_id, date, exclude_booking_id } = req.query;

    if (!accommodation_id || !date) {
      return res.status(400).json(
        errorResponse('accommodation_id and date are required', 400)
      );
    }

    const slots = await getAvailableSlotsForAccommodation(
      parseInt(accommodation_id as string),
      date as string,
      exclude_booking_id ? parseInt(exclude_booking_id as string) : undefined
    );

    res.json(successResponse({ availableSlots: slots }));
  } catch (error: any) {
    console.error('Get available slots error:', error);
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

/**
 * Get available accommodations for a specific date and time slot
 * GET /api/availability/available-accommodations
 */
export const getAvailableAccommodationsController = async (req: Request, res: Response) => {
  try {
    const { date, time_slot, accommodation_type } = req.query;

    console.log('Availability request:', { date, time_slot, accommodation_type });

    if (!date || !time_slot || !accommodation_type) {
      return res.status(400).json(
        errorResponse('date, time_slot, and accommodation_type are required', 400)
      );
    }

    const validSlots: TimeSlotType[] = ['morning', 'night', 'whole_day'];
    const slot = time_slot as TimeSlotType;
    
    if (!validSlots.includes(slot)) {
      return res.status(400).json(
        errorResponse('time_slot must be morning, night, or whole_day', 400)
      );
    }

    if (accommodation_type !== 'cottage' && accommodation_type !== 'room') {
      return res.status(400).json(
        errorResponse('accommodation_type must be cottage or room', 400)
      );
    }

    const availableIds = await getAvailableAccommodations(
      date as string,
      slot,
      accommodation_type as 'cottage' | 'room'
    );

    console.log('Returning available IDs:', availableIds);

    res.json(successResponse({ availableAccommodationIds: availableIds }));
  } catch (error: any) {
    console.error('Get available accommodations error:', error);
    res.status(500).json(errorResponse(error.message));
  }
};
