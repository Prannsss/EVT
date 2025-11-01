import { pool } from '../config/db.js';
import { Booking, BookingCreate, BookingUpdate } from '../types/booking.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const getAllBookings = async (): Promise<Booking[]> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM bookings ORDER BY created_at DESC'
  );
  return rows as Booking[];
};

export const getBookingById = async (id: number): Promise<Booking | null> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM bookings WHERE id = ?',
    [id]
  );
  return rows.length > 0 ? (rows[0] as Booking) : null;
};

export const getBookingsByUserId = async (userId: number): Promise<Booking[]> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM bookings WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  );
  return rows as Booking[];
};

export const createBooking = async (data: BookingCreate): Promise<number> => {
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO bookings (
      user_id, accommodation_id, check_in_date, check_out_date, 
      adults, kids, pwd, overnight_stay, overnight_swimming, 
      total_price, proof_of_payment_url
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.user_id,
      data.accommodation_id,
      data.check_in_date,
      data.check_out_date || null,
      data.adults,
      data.kids,
      data.pwd,
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
