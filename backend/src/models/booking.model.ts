import { pool } from '../config/db.js';
import { Booking, BookingCreate, BookingUpdate } from '../types/booking.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const getAllBookings = async (): Promise<any[]> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT 
      b.*,
      u.name as user_name,
      u.email as user_email,
      u.contact_number as user_contact,
      a.name as accommodation_name,
      a.type as accommodation_type
    FROM bookings b
    LEFT JOIN users u ON b.user_id = u.id
    LEFT JOIN accommodations a ON b.accommodation_id = a.id
    ORDER BY b.created_at DESC`
  );
  return rows as any[];
};

export const getBookingById = async (id: number): Promise<any | null> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT 
      b.*,
      u.name as user_name,
      u.email as user_email,
      u.contact_number as user_contact,
      a.name as accommodation_name,
      a.type as accommodation_type,
      a.capacity as accommodation_capacity
    FROM bookings b
    LEFT JOIN users u ON b.user_id = u.id
    LEFT JOIN accommodations a ON b.accommodation_id = a.id
    WHERE b.id = ?`,
    [id]
  );
  return rows.length > 0 ? rows[0] : null;
};

export const getBookingsByUserId = async (userId: number): Promise<any[]> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT 
      b.*,
      u.name as user_name,
      u.email as user_email,
      u.contact_number as user_contact,
      a.name as accommodation_name,
      a.type as accommodation_type
    FROM bookings b
    LEFT JOIN users u ON b.user_id = u.id
    LEFT JOIN accommodations a ON b.accommodation_id = a.id
    WHERE b.user_id = ? 
    ORDER BY b.created_at DESC`,
    [userId]
  );
  return rows as any[];
};

export const createBooking = async (data: BookingCreate): Promise<number> => {
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO bookings (
      user_id, accommodation_id, check_in_date, time_slot, booking_time, check_out_date, 
      adults, kids, pwd, senior, 
      adult_swimming, kid_swimming, pwd_swimming, senior_swimming,
      overnight_stay, overnight_swimming, 
      total_price, proof_of_payment_url
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.user_id,
      data.accommodation_id,
      data.check_in_date,
      data.time_slot || 'morning',
      data.booking_time,
      data.check_out_date || null,
      data.adults,
      data.kids,
      data.pwd,
      data.senior || 0,
      data.adult_swimming || 0,
      data.kid_swimming || 0,
      data.pwd_swimming || 0,
      data.senior_swimming || 0,
      data.overnight_stay,
      data.overnight_swimming,
      data.total_price,
      data.proof_of_payment_url || null,
    ]
  );
  return result.insertId;
};

export const updateBooking = async (id: number, data: BookingUpdate): Promise<boolean> => {
  const fields: string[] = [];
  const values: any[] = [];

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  });

  if (fields.length === 0) return false;

  values.push(id);
  const [result] = await pool.query<ResultSetHeader>(
    `UPDATE bookings SET ${fields.join(', ')} WHERE id = ?`,
    values
  );
  return result.affectedRows > 0;
};

export const deleteBooking = async (id: number): Promise<boolean> => {
  const [result] = await pool.query<ResultSetHeader>(
    'DELETE FROM bookings WHERE id = ?',
    [id]
  );
  return result.affectedRows > 0;
};

// Check if accommodation is available for the given date range
export const checkAccommodationAvailability = async (
  accommodationId: number,
  checkInDate: string,
  checkOutDate: string | null,
  excludeBookingId?: number
): Promise<boolean> => {
  // Calculate effective end date for the new booking
  const checkIn = new Date(checkInDate);
  const checkOut = checkOutDate ? new Date(checkOutDate) : new Date(checkInDate);
  
  // If checkOut <= checkIn, it's a single day booking, so effective end is next day
  if (checkOut.getTime() <= checkIn.getTime()) {
    checkOut.setUTCDate(checkOut.getUTCDate() + 1);
  }
  
  const newEffectiveEnd = checkOut.toISOString().split('T')[0];
  
  let query = `
    SELECT COUNT(*) as count 
    FROM bookings 
    WHERE accommodation_id = ? 
    AND status = 'approved'
    AND (
      -- Check for date range overlaps using exclusive end dates
      check_in_date < ? 
      AND (
        CASE 
          WHEN check_out_date > check_in_date THEN check_out_date 
          ELSE DATE_ADD(check_in_date, INTERVAL 1 DAY) 
        END
      ) > ?
    )
  `;
  
  const params: any[] = [accommodationId, newEffectiveEnd, checkInDate];
  
  if (excludeBookingId) {
    query += ' AND id != ?';
    params.push(excludeBookingId);
  }
  
  const [rows] = await pool.query<RowDataPacket[]>(query, params);
  const count = rows[0]?.count || 0;
  
  return count === 0; // Returns true if available (no conflicting bookings)
};

// Get all approved bookings for a specific accommodation
export const getApprovedBookingsByAccommodation = async (
  accommodationId: number
): Promise<any[]> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT check_in_date, check_out_date 
     FROM bookings 
     WHERE accommodation_id = ? AND status = 'approved'
     ORDER BY check_in_date`,
    [accommodationId]
  );
  return rows as any[];
};
