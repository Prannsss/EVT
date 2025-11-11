import { Request, Response } from 'express';
import { pool } from '../config/db.js';
import {
  getAllEventBookings,
  getEventBookingById,
  getEventBookingsByUserId,
  createEventBooking,
  updateEventBooking,
  checkEventBookingConflict,
} from '../models/event-booking.model.js';
import { findUserById } from '../models/user.model.js';
import { checkEventBookingAvailability } from '../services/availability.service.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const getEventBookings = async (req: Request, res: Response) => {
  try {
    let bookings;

    if (req.user!.role === 'admin') {
      bookings = await getAllEventBookings();
    } else {
      bookings = await getEventBookingsByUserId(req.user!.id);
    }

    res.json(successResponse(bookings));
  } catch (error: any) {
    console.error('Get event bookings error:', error);
    res.status(500).json(errorResponse(error.message));
  }
};

export const getEventBooking = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const booking = await getEventBookingById(id);

    if (!booking) {
      return res.status(404).json(errorResponse('Event booking not found', 404));
    }

    // Users can only view their own bookings
    if (req.user!.role !== 'admin' && booking.user_id !== req.user!.id) {
      return res.status(403).json(errorResponse('Access denied', 403));
    }

    res.json(successResponse(booking));
  } catch (error: any) {
    console.error('Get event booking error:', error);
    res.status(500).json(errorResponse(error.message));
  }
};

export const addEventBooking = async (req: Request, res: Response) => {
  try {
    const {
      event_type,
      booking_date,
      event_details,
      total_price,
    } = req.body;

    // Get uploaded file path
    const file = req.file as Express.Multer.File | undefined;
    const proof_of_payment_url = file ? `/uploads/${file.filename}` : null;

    if (!event_type || !booking_date || !total_price) {
      return res.status(400).json(errorResponse('Missing required fields', 400));
    }

    if (!proof_of_payment_url) {
      return res.status(400).json(errorResponse('Proof of payment is required', 400));
    }

    // Check for conflicts using the comprehensive availability service
    const availabilityResult = await checkEventBookingAvailability(
      booking_date,
      event_type as 'whole_day' | 'morning' | 'evening'
    );
    
    if (!availabilityResult.available) {
      return res.status(409).json(
        errorResponse(
          availabilityResult.reason || 'This date and time slot is already booked', 
          409
        )
      );
    }

    const bookingId = await createEventBooking({
      user_id: req.user!.id,
      event_type,
      booking_date,
      event_details,
      total_price: parseFloat(total_price),
      proof_of_payment_url,
    });

    res.status(201).json(successResponse({ id: bookingId }, 'Event booking created successfully'));
  } catch (error: any) {
    console.error('Add event booking error:', error);
    res.status(500).json(errorResponse(error.message));
  }
};

export const modifyEventBooking = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { status, event_details } = req.body;

    // Get uploaded file path if exists
    const file = req.file as Express.Multer.File | undefined;
    const proof_of_payment_url = file ? `/uploads/${file.filename}` : undefined;

    const booking = await getEventBookingById(id);
    if (!booking) {
      return res.status(404).json(errorResponse('Event booking not found', 404));
    }

    // Only admin can change status
    if (status && req.user!.role !== 'admin') {
      return res.status(403).json(errorResponse('Only admin can change booking status', 403));
    }

    if (req.user!.role !== 'admin' && booking.user_id !== req.user!.id) {
      return res.status(403).json(errorResponse('Access denied', 403));
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (proof_of_payment_url) updateData.proof_of_payment_url = proof_of_payment_url;
    if (event_details !== undefined) updateData.event_details = event_details;

    const success = await updateEventBooking(id, updateData);

    if (!success) {
      return res.status(400).json(errorResponse('Update failed', 400));
    }

    res.json(successResponse(null, 'Event booking updated successfully'));
  } catch (error: any) {
    console.error('Update event booking error:', error);
    res.status(500).json(errorResponse(error.message));
  }
};

export const cancelEventBooking = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const booking = await getEventBookingById(id);

    if (!booking) {
      return res.status(404).json(errorResponse('Event booking not found', 404));
    }

    if (req.user!.role !== 'admin' && booking.user_id !== req.user!.id) {
      return res.status(403).json(errorResponse('Access denied', 403));
    }

    const success = await updateEventBooking(id, { status: 'cancelled' });

    if (!success) {
      return res.status(400).json(errorResponse('Cancellation failed', 400));
    }

    res.json(successResponse(null, 'Event booking cancelled successfully'));
  } catch (error: any) {
    console.error('Cancel event booking error:', error);
    res.status(500).json(errorResponse(error.message));
  }
};

export const approveEventBooking = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    // Only admin can approve
    if (req.user!.role !== 'admin') {
      return res.status(403).json(errorResponse('Only admin can approve bookings', 403));
    }

    const booking = await getEventBookingById(id);
    if (!booking) {
      return res.status(404).json(errorResponse('Event booking not found', 404));
    }

    if (booking.status !== 'pending') {
      return res.status(400).json(errorResponse('Only pending bookings can be approved', 400));
    }

    // Check for conflicts using the comprehensive availability service
    const availabilityResult = await checkEventBookingAvailability(
      booking.booking_date.toString().split('T')[0],
      booking.event_type as 'whole_day' | 'morning' | 'evening'
    );
    
    if (!availabilityResult.available) {
      return res.status(409).json(
        errorResponse(
          availabilityResult.reason || 'This date and time slot is already booked', 
          409
        )
      );
    }

    const success = await updateEventBooking(id, { status: 'approved' });

    if (!success) {
      return res.status(400).json(errorResponse('Approval failed', 400));
    }

    res.json(successResponse(null, 'Event booking approved successfully'));
  } catch (error: any) {
    console.error('Approve event booking error:', error);
    res.status(500).json(errorResponse(error.message));
  }
};

export const rejectEventBooking = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    // Only admin can reject
    if (req.user!.role !== 'admin') {
      return res.status(403).json(errorResponse('Only admin can reject bookings', 403));
    }

    const booking = await getEventBookingById(id);
    if (!booking) {
      return res.status(404).json(errorResponse('Event booking not found', 404));
    }

    const success = await updateEventBooking(id, { status: 'rejected' });

    if (!success) {
      return res.status(400).json(errorResponse('Rejection failed', 400));
    }

    res.json(successResponse(null, 'Event booking rejected successfully'));
  } catch (error: any) {
    console.error('Reject event booking error:', error);
    res.status(500).json(errorResponse(error.message));
  }
};

export const checkOutEventBooking = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    // Only admin can check out
    if (req.user!.role !== 'admin') {
      return res.status(403).json(errorResponse('Only admin can check out bookings', 403));
    }

    const booking = await getEventBookingById(id);
    if (!booking) {
      return res.status(404).json(errorResponse('Event booking not found', 404));
    }

    if (booking.status !== 'approved') {
      return res.status(400).json(errorResponse('Only approved bookings can be checked out', 400));
    }

    // Update status to completed and set checked_out_at timestamp
    const [result] = await pool.query(
      'UPDATE event_bookings SET status = ?, checked_out_at = NOW() WHERE id = ?',
      ['completed', id]
    );

    res.json(successResponse(null, 'Event booking checked out successfully'));
  } catch (error: any) {
    console.error('Check out event booking error:', error);
    res.status(500).json(errorResponse(error.message));
  }
};

// Delete event booking (admin only)
export const deleteEventBookingById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (req.user!.role !== 'admin') {
      return res.status(403).json(errorResponse('Only admin can delete bookings', 403));
    }

    const booking = await getEventBookingById(id);
    if (!booking) {
      return res.status(404).json(errorResponse('Event booking not found', 404));
    }

    // Only allow deletion of cancelled/rejected bookings
    if (booking.status !== 'cancelled' && booking.status !== 'rejected') {
      return res.status(400).json(errorResponse('Only cancelled or rejected bookings can be deleted', 400));
    }

    const [result] = await pool.query('DELETE FROM event_bookings WHERE id = ?', [id]);

    res.json(successResponse(null, 'Event booking deleted successfully'));
  } catch (error: any) {
    console.error('Delete event booking error:', error);
    res.status(500).json(errorResponse(error.message));
  }
};
