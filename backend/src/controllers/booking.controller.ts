import { Request, Response } from 'express';
import { pool } from '../config/db.js';
import {
  getAllBookings,
  getBookingById,
  getBookingsByUserId,
  createBooking,
  updateBooking,
  checkAccommodationAvailability,
} from '../models/booking.model.js';
import { getAccommodationById } from '../models/accommodation.model.js';
import { findUserById } from '../models/user.model.js';
import { sendBookingConfirmation, sendBookingStatusUpdate } from '../services/email.service.js';
import { checkRegularBookingAvailability } from '../services/availability.service.js';
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
      booking_time,
      check_out_date,
      adults,
      kids,
      pwd,
      overnight_stay,
      overnight_swimming,
      total_price,
    } = req.body;

    // Get uploaded file path
    const file = req.file as Express.Multer.File | undefined;
    const proof_of_payment_url = file ? `/uploads/${file.filename}` : null;

    if (!accommodation_id || !check_in_date || !adults || !total_price) {
      return res.status(400).json(errorResponse('Missing required fields', 400));
    }

    if (!proof_of_payment_url) {
      return res.status(400).json(errorResponse('Proof of payment is required', 400));
    }

    // Verify accommodation exists
    const accommodation = await getAccommodationById(accommodation_id);
    if (!accommodation) {
      return res.status(404).json(errorResponse('Accommodation not found', 404));
    }

    // Check availability considering event bookings (which have priority)
    const availabilityResult = await checkRegularBookingAvailability(
      accommodation_id,
      check_in_date,
      check_out_date || null
    );

    if (!availabilityResult.available) {
      return res.status(409).json(
        errorResponse(
          availabilityResult.reason || 'This accommodation is not available for the selected dates', 
          409
        )
      );
    }

    // If only partial availability (due to event bookings), inform user
    if (availabilityResult.availableTimeSlots && 
        availabilityResult.availableTimeSlots.length > 0 && 
        availabilityResult.availableTimeSlots.length < 3) {
      // Return info about available slots if needed
      console.log('Partial availability:', availabilityResult);
    }

    const bookingId = await createBooking({
      user_id: req.user!.id,
      accommodation_id,
      check_in_date,
      booking_time: booking_time || '09:00:00',
      check_out_date,
      adults: parseInt(adults) || 0,
      kids: parseInt(kids) || 0,
      pwd: parseInt(pwd) || 0,
      overnight_stay: overnight_stay === 'true' || overnight_stay === true,
      overnight_swimming: overnight_swimming === 'true' || overnight_swimming === true,
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
        adults: parseInt(adults) || 0,
        kids: parseInt(kids) || 0,
        pwd: parseInt(pwd) || 0,
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
    const { status } = req.body;

    // Get uploaded file path if exists
    const file = req.file as Express.Multer.File | undefined;
    const proof_of_payment_url = file ? `/uploads/${file.filename}` : undefined;

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

    const updateData: any = {};
    if (status) updateData.status = status;
    if (proof_of_payment_url) updateData.proof_of_payment_url = proof_of_payment_url;

    const success = await updateBooking(id, updateData);

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

// Approve booking (admin only)
export const approveBooking = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (req.user!.role !== 'admin') {
      return res.status(403).json(errorResponse('Only admin can approve bookings', 403));
    }

    const booking = await getBookingById(id);
    if (!booking) {
      return res.status(404).json(errorResponse('Booking not found', 404));
    }

    if (booking.status === 'approved') {
      return res.status(400).json(errorResponse('Booking is already approved', 400));
    }

    // Check if accommodation is still available for the dates
    const isAvailable = await checkAccommodationAvailability(
      booking.accommodation_id,
      booking.check_in_date,
      booking.check_out_date || null,
      id // Exclude current booking from availability check
    );

    if (!isAvailable) {
      return res.status(409).json(
        errorResponse('This accommodation is already booked for the selected dates by another booking', 409)
      );
    }

    const success = await updateBooking(id, { status: 'approved' });

    if (!success) {
      return res.status(400).json(errorResponse('Approval failed', 400));
    }

    // Send status update email
    const user = await findUserById(booking.user_id);
    if (user) {
      await sendBookingStatusUpdate(user.email, user.name, id, 'approved');
    }

    res.json(successResponse(null, 'Booking approved successfully'));
  } catch (error: any) {
    console.error('Approve booking error:', error);
    res.status(500).json(errorResponse(error.message));
  }
};

// Reject booking (admin only)
export const rejectBooking = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (req.user!.role !== 'admin') {
      return res.status(403).json(errorResponse('Only admin can reject bookings', 403));
    }

    const booking = await getBookingById(id);
    if (!booking) {
      return res.status(404).json(errorResponse('Booking not found', 404));
    }

    const success = await updateBooking(id, { status: 'cancelled' });

    if (!success) {
      return res.status(400).json(errorResponse('Rejection failed', 400));
    }

    // Send status update email
    const user = await findUserById(booking.user_id);
    if (user) {
      await sendBookingStatusUpdate(user.email, user.name, id, 'rejected');
    }

    res.json(successResponse(null, 'Booking rejected successfully'));
  } catch (error: any) {
    console.error('Reject booking error:', error);
    res.status(500).json(errorResponse(error.message));
  }
};

// Check out booking (admin only)
export const checkOutBooking = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (req.user!.role !== 'admin') {
      return res.status(403).json(errorResponse('Only admin can check out bookings', 403));
    }

    const booking = await getBookingById(id);
    if (!booking) {
      return res.status(404).json(errorResponse('Booking not found', 404));
    }

    if (booking.status !== 'approved') {
      return res.status(400).json(errorResponse('Only approved bookings can be checked out', 400));
    }

    // Update status to completed and set checked_out_at timestamp
    const [result] = await pool.query(
      'UPDATE bookings SET status = ?, checked_out_at = NOW() WHERE id = ?',
      ['completed', id]
    );

    // Send status update email
    const user = await findUserById(booking.user_id);
    if (user) {
      await sendBookingStatusUpdate(user.email, user.name, id, 'completed');
    }

    res.json(successResponse(null, 'Guest checked out successfully'));
  } catch (error: any) {
    console.error('Check out booking error:', error);
    res.status(500).json(errorResponse(error.message));
  }
};

// Delete booking (admin only)
export const deleteBookingById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (req.user!.role !== 'admin') {
      return res.status(403).json(errorResponse('Only admin can delete bookings', 403));
    }

    const booking = await getBookingById(id);
    if (!booking) {
      return res.status(404).json(errorResponse('Booking not found', 404));
    }

    // Only allow deletion of cancelled/rejected bookings
    if (booking.status !== 'cancelled' && booking.status !== 'rejected') {
      return res.status(400).json(errorResponse('Only cancelled or rejected bookings can be deleted', 400));
    }

    const [result] = await pool.query('DELETE FROM bookings WHERE id = ?', [id]);

    res.json(successResponse(null, 'Booking deleted successfully'));
  } catch (error: any) {
    console.error('Delete booking error:', error);
    res.status(500).json(errorResponse(error.message));
  }
};
