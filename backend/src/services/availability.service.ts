/**
 * Availability Service
 * Handles booking conflicts between regular bookings and event bookings
 * with priority given to event bookings
 */

import { pool } from '../config/db.js';
import { RowDataPacket } from 'mysql2';

export interface AvailabilityResult {
  available: boolean;
  reason?: string;
  conflictingBooking?: {
    type: 'event' | 'regular';
    id: number;
    date: string;
    eventType?: string;
  };
  availableTimeSlots?: string[];
}

export interface TimeSlot {
  start: string;
  end: string;
  label: string;
}

export const TIME_SLOTS = {
  MORNING: { start: '09:00', end: '12:00', label: 'Morning (9:00 AM - 12:00 PM)' },
  AFTERNOON: { start: '13:00', end: '17:00', label: 'Afternoon (1:00 PM - 5:00 PM)' },
  WHOLE_DAY: { start: '09:00', end: '17:00', label: 'Whole Day (9:00 AM - 5:00 PM)' },
};

/**
 * Check if a date has any event bookings and determine available time slots
 */
export const checkEventConflictsForDate = async (
  date: string,
  excludeEventBookingId?: number
): Promise<{
  hasWholeDay: boolean;
  hasMorning: boolean;
  hasEvening: boolean;
  availableSlots: string[];
  conflictingEvents: any[];
}> => {
  let query = `
    SELECT id, event_type, booking_date 
    FROM event_bookings 
    WHERE booking_date = ? 
    AND status IN ('pending', 'approved')
  `;
  
  const params: any[] = [date];
  
  if (excludeEventBookingId) {
    query += ' AND id != ?';
    params.push(excludeEventBookingId);
  }
  
  const [rows] = await pool.query<RowDataPacket[]>(query, params);
  const events = rows as any[];
  
  const hasWholeDay = events.some(e => e.event_type === 'whole_day');
  const hasMorning = events.some(e => e.event_type === 'morning');
  const hasEvening = events.some(e => e.event_type === 'evening');
  
  // Determine available slots
  const availableSlots: string[] = [];
  
  if (hasWholeDay) {
    // No slots available if whole day is booked
  } else if (hasMorning && hasEvening) {
    // Both morning and evening booked = whole day unavailable
  } else if (hasMorning) {
    availableSlots.push('afternoon');
  } else if (hasEvening) {
    availableSlots.push('morning');
  } else {
    // No events, all slots available
    availableSlots.push('morning', 'afternoon', 'whole_day');
  }
  
  return {
    hasWholeDay,
    hasMorning,
    hasEvening,
    availableSlots,
    conflictingEvents: events,
  };
};

/**
 * Check if a regular booking can be made on a specific date
 * Takes into account event bookings which have priority
 */
export const checkRegularBookingAvailability = async (
  accommodationId: number,
  checkInDate: string,
  checkOutDate: string | null,
  excludeBookingId?: number
): Promise<AvailabilityResult> => {
  // First check for event conflicts (event bookings have priority)
  const eventConflicts = await checkEventConflictsForDate(checkInDate);
  
  if (eventConflicts.hasWholeDay) {
    return {
      available: false,
      reason: 'This date is reserved for a whole-day event. Please select another date.',
      conflictingBooking: {
        type: 'event',
        id: eventConflicts.conflictingEvents[0].id,
        date: checkInDate,
        eventType: 'whole_day',
      },
    };
  }
  
  if (eventConflicts.hasMorning && eventConflicts.hasEvening) {
    return {
      available: false,
      reason: 'This date has both morning and evening events booked. Please select another date.',
      availableTimeSlots: [],
    };
  }
  
  // If there are partial event bookings, check which slots are available
  if (eventConflicts.hasMorning || eventConflicts.hasEvening) {
    return {
      available: true,
      reason: eventConflicts.hasMorning 
        ? 'Only afternoon slot (1:00 PM - 5:00 PM) is available due to a morning event.'
        : 'Only morning slot (9:00 AM - 12:00 PM) is available due to an evening event.',
      availableTimeSlots: eventConflicts.availableSlots,
    };
  }
  
  // Check for regular booking conflicts
  let query = `
    SELECT COUNT(*) as count, GROUP_CONCAT(id) as booking_ids
    FROM bookings 
    WHERE accommodation_id = ? 
    AND status IN ('pending', 'approved')
    AND (
      (check_in_date <= ? AND (check_out_date >= ? OR check_out_date IS NULL))
      OR (? <= check_in_date AND (check_out_date IS NULL OR check_in_date <= ?))
    )
  `;
  
  const params: any[] = [
    accommodationId, 
    checkInDate, 
    checkInDate, 
    checkInDate, 
    checkOutDate || checkInDate
  ];
  
  if (excludeBookingId) {
    query += ' AND id != ?';
    params.push(excludeBookingId);
  }
  
  const [rows] = await pool.query<RowDataPacket[]>(query, params);
  const count = rows[0]?.count || 0;
  
  if (count > 0) {
    return {
      available: false,
      reason: 'This accommodation is already booked for the selected dates.',
      conflictingBooking: {
        type: 'regular',
        id: parseInt(rows[0]?.booking_ids?.split(',')[0] || '0'),
        date: checkInDate,
      },
    };
  }
  
  return {
    available: true,
    availableTimeSlots: ['morning', 'afternoon', 'whole_day'],
  };
};

/**
 * Check if an event booking can be made
 */
export const checkEventBookingAvailability = async (
  bookingDate: string,
  eventType: 'whole_day' | 'morning' | 'evening',
  excludeEventBookingId?: number
): Promise<AvailabilityResult> => {
  // Check for other event bookings on the same date
  const eventConflicts = await checkEventConflictsForDate(bookingDate, excludeEventBookingId);
  
  if (eventType === 'whole_day') {
    // Whole day booking cannot coexist with any other booking
    if (eventConflicts.conflictingEvents.length > 0) {
      const conflict = eventConflicts.conflictingEvents[0];
      return {
        available: false,
        reason: `This date already has a ${conflict.event_type.replace('_', ' ')} event booking.`,
        conflictingBooking: {
          type: 'event',
          id: conflict.id,
          date: bookingDate,
          eventType: conflict.event_type,
        },
      };
    }
  } else if (eventType === 'morning') {
    if (eventConflicts.hasWholeDay || eventConflicts.hasMorning) {
      return {
        available: false,
        reason: 'Morning slot is already booked.',
        conflictingBooking: {
          type: 'event',
          id: eventConflicts.conflictingEvents[0].id,
          date: bookingDate,
          eventType: eventConflicts.hasWholeDay ? 'whole_day' : 'morning',
        },
      };
    }
  } else if (eventType === 'evening') {
    if (eventConflicts.hasWholeDay || eventConflicts.hasEvening) {
      return {
        available: false,
        reason: 'Evening slot is already booked.',
        conflictingBooking: {
          type: 'event',
          id: eventConflicts.conflictingEvents[0].id,
          date: bookingDate,
          eventType: eventConflicts.hasWholeDay ? 'whole_day' : 'evening',
        },
      };
    }
  }
  
  // Check if there are any approved regular bookings on this date
  const [regularBookings] = await pool.query<RowDataPacket[]>(
    `SELECT id, accommodation_id, check_in_date, check_out_date
     FROM bookings
     WHERE status IN ('pending', 'approved')
     AND (
       check_in_date = ? 
       OR (check_in_date <= ? AND (check_out_date >= ? OR check_out_date IS NULL))
     )`,
    [bookingDate, bookingDate, bookingDate]
  );
  
  if (regularBookings.length > 0) {
    return {
      available: false,
      reason: 'There are existing accommodation bookings for this date. Event bookings take priority, but existing bookings must be cancelled first.',
      conflictingBooking: {
        type: 'regular',
        id: regularBookings[0].id,
        date: bookingDate,
      },
    };
  }
  
  return {
    available: true,
  };
};

/**
 * Get all unavailable dates for a specific accommodation
 * Returns dates that are completely unavailable due to event bookings
 */
export const getUnavailableDates = async (
  accommodationId?: number,
  startDate?: string,
  endDate?: string
): Promise<{
  dates: string[];
  partiallyAvailable: Array<{
    date: string;
    availableSlots: string[];
    reason: string;
  }>;
}> => {
  const unavailableDates: string[] = [];
  const partiallyAvailable: Array<{
    date: string;
    availableSlots: string[];
    reason: string;
  }> = [];
  
  // Get all whole-day event bookings
  let eventQuery = `
    SELECT booking_date, event_type
    FROM event_bookings
    WHERE status IN ('pending', 'approved')
  `;
  
  const eventParams: any[] = [];
  
  if (startDate && endDate) {
    eventQuery += ' AND booking_date BETWEEN ? AND ?';
    eventParams.push(startDate, endDate);
  }
  
  const [eventRows] = await pool.query<RowDataPacket[]>(eventQuery, eventParams);
  const events = eventRows as any[];
  
  // Group events by date
  const eventsByDate = new Map<string, any[]>();
  events.forEach(event => {
    const dateStr = event.booking_date.toISOString().split('T')[0];
    if (!eventsByDate.has(dateStr)) {
      eventsByDate.set(dateStr, []);
    }
    eventsByDate.get(dateStr)!.push(event);
  });
  
  // Determine availability for each date
  eventsByDate.forEach((dateEvents, date) => {
    const hasWholeDay = dateEvents.some(e => e.event_type === 'whole_day');
    const hasMorning = dateEvents.some(e => e.event_type === 'morning');
    const hasEvening = dateEvents.some(e => e.event_type === 'evening');
    
    if (hasWholeDay || (hasMorning && hasEvening)) {
      unavailableDates.push(date);
    } else if (hasMorning) {
      partiallyAvailable.push({
        date,
        availableSlots: ['afternoon'],
        reason: 'Morning slot booked for event',
      });
    } else if (hasEvening) {
      partiallyAvailable.push({
        date,
        availableSlots: ['morning'],
        reason: 'Evening slot booked for event',
      });
    }
  });
  
  // If accommodation is specified, also check regular bookings
  if (accommodationId) {
    let bookingQuery = `
      SELECT DISTINCT DATE(check_in_date) as booking_date
      FROM bookings
      WHERE accommodation_id = ?
      AND status IN ('pending', 'approved')
    `;
    
    const bookingParams: any[] = [accommodationId];
    
    if (startDate && endDate) {
      bookingQuery += ' AND check_in_date BETWEEN ? AND ?';
      bookingParams.push(startDate, endDate);
    }
    
    const [bookingRows] = await pool.query<RowDataPacket[]>(bookingQuery, bookingParams);
    const bookings = bookingRows as any[];
    
    bookings.forEach(booking => {
      const dateStr = booking.booking_date.toISOString().split('T')[0];
      // Only add if not already marked as unavailable due to event
      if (!unavailableDates.includes(dateStr) && 
          !partiallyAvailable.some(p => p.date === dateStr)) {
        unavailableDates.push(dateStr);
      }
    });
  }
  
  return {
    dates: unavailableDates,
    partiallyAvailable,
  };
};

/**
 * Get booking summary for a specific date
 * Shows what's booked and what's available
 */
export const getDateBookingSummary = async (date: string): Promise<{
  eventBookings: any[];
  regularBookings: any[];
  isFullyBooked: boolean;
  availableSlots: string[];
  availableAccommodations: number[];
}> => {
  // Get event bookings
  const [eventRows] = await pool.query<RowDataPacket[]>(
    `SELECT * FROM event_bookings 
     WHERE booking_date = ? 
     AND status IN ('pending', 'approved')`,
    [date]
  );
  
  // Get regular bookings
  const [bookingRows] = await pool.query<RowDataPacket[]>(
    `SELECT b.*, a.name as accommodation_name
     FROM bookings b
     LEFT JOIN accommodations a ON b.accommodation_id = a.id
     WHERE b.check_in_date = ? 
     AND b.status IN ('pending', 'approved')`,
    [date]
  );
  
  const eventBookings = eventRows as any[];
  const regularBookings = bookingRows as any[];
  
  const eventConflicts = await checkEventConflictsForDate(date);
  
  // Get all accommodations
  const [allAccommodations] = await pool.query<RowDataPacket[]>(
    'SELECT id FROM accommodations'
  );
  
  const bookedAccommodationIds = regularBookings.map(b => b.accommodation_id);
  const availableAccommodations = (allAccommodations as any[])
    .map(a => a.id)
    .filter(id => !bookedAccommodationIds.includes(id));
  
  return {
    eventBookings,
    regularBookings,
    isFullyBooked: eventConflicts.hasWholeDay || (eventConflicts.hasMorning && eventConflicts.hasEvening),
    availableSlots: eventConflicts.availableSlots,
    availableAccommodations,
  };
};
