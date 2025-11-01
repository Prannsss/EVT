import { Request, Response } from 'express';
import {
  getAllBookings,
  getBookingById,
  getBookingsByUserId,
  createBooking,
  updateBooking,
} from '../models/booking.model.js';
import { getAccommodationById } from '../models/accommodation.model.js';
import { findUserById } from '../models/user.model.js';
import { sendBookingConfirmation, sendBookingStatusUpdate } from '../services/email.service.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const getBookings = async (req: Request, res: Response) => {
  try {
    let bookings;

    if (req.user!.role === 'admin') {
      bookings = await getAllBookings();
    } else {
      bookings = await getBookingsByUserId(req.user!.id);
    }

    res.json(successResponse(bookings));
  } catch (error: any) {
    console.error('Get bookings error:', error);
    res.status(500).json(errorResponse(error.message));
  }
};

export const getBooking = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const booking = await getBookingById(id);

    if (!booking) {
      return res.status(404).json(errorResponse('Booking not found', 404));
    }

    // Users can only view their own bookings
    if (req.user!.role !== 'admin' && booking.user_id !== req.user!.id) {
      return res.status(403).json(errorResponse('Access denied', 403));
    }

    res.json(successResponse(booking));
  } catch (error: any) {
    console.error('Get booking error:', error);
    res.status(500).json(errorResponse(error.message));
  }
};

export const addBooking = async (req: Request, res: Response) => {
  try {
    const {
      accommodation_id,
      check_in_date,
      check_out_date,
      adults,
      kids,
      pwd,
      overnight_stay,
      overnight_swimming,
      total_price,
      proof_of_payment_url,
    } = req.body;

    if (!accommodation_id || !check_in_date || !adults || !total_price) {
      return res.status(400).json(errorResponse('Missing required fields', 400));
    }

    // Verify accommodation exists
    const accommodation = await getAccommodationById(accommodation_id);
    if (!accommodation) {
      return res.status(404).json(errorResponse('Accommodation not found', 404));
    }

    const bookingId = await createBooking({
      user_id: req.user!.id,
      accommodation_id,
      check_in_date,
      check_out_date,
      adults: adults || 0,
      kids: kids || 0,
      pwd: pwd || 0,
      overnight_stay: overnight_stay || false,
      overnight_swimming: overnight_swimming || false,
      total_price: parseFloat(total_price),
      proof_of_payment_url,
    });

    // Send confirmation email
    const user = await findUserById(req.user!.id);
    if (user) {
      await sendBookingConfirmation({
        clientName: user.name,
        clientEmail: user.email,
        accommodationName: accommodation.name,
        checkInDate: check_in_date,
        checkOutDate: check_out_date,
        adults: adults || 0,
        kids: kids || 0,
        pwd: pwd || 0,
        totalAmount: parseFloat(total_price),
        bookingId,
      });
    }

    res.status(201).json(successResponse({ id: bookingId }, 'Booking created successfully'));
  } catch (error: any) {
    console.error('Add booking error:', error);
    res.status(500).json(errorResponse(error.message));
  }
};

export const modifyBooking = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { status, proof_of_payment_url } = req.body;

    const booking = await getBookingById(id);
    if (!booking) {
      return res.status(404).json(errorResponse('Booking not found', 404));
    }

    // Only admin can change status, users can update payment proof
    if (status && req.user!.role !== 'admin') {
      return res.status(403).json(errorResponse('Only admin can change booking status', 403));
    }

    if (req.user!.role !== 'admin' && booking.user_id !== req.user!.id) {
      return res.status(403).json(errorResponse('Access denied', 403));
    }

    const success = await updateBooking(id, { status, proof_of_payment_url });

    if (!success) {
      return res.status(400).json(errorResponse('Update failed', 400));
    }

    // Send status update email if status changed
    if (status) {
      const user = await findUserById(booking.user_id);
      if (user) {
        await sendBookingStatusUpdate(user.email, user.name, id, status);
      }
    }

    res.json(successResponse(null, 'Booking updated successfully'));
  } catch (error: any) {
    console.error('Update booking error:', error);
    res.status(500).json(errorResponse(error.message));
  }
};

export const cancelBooking = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const booking = await getBookingById(id);

    if (!booking) {
      return res.status(404).json(errorResponse('Booking not found', 404));
    }

    if (req.user!.role !== 'admin' && booking.user_id !== req.user!.id) {
      return res.status(403).json(errorResponse('Access denied', 403));
    }

    const success = await updateBooking(id, { status: 'cancelled' });

    if (!success) {
      return res.status(400).json(errorResponse('Cancellation failed', 400));
    }

    res.json(successResponse(null, 'Booking cancelled successfully'));
  } catch (error: any) {
    console.error('Cancel booking error:', error);
    res.status(500).json(errorResponse(error.message));
  }
};
