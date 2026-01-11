import { pool } from '../config/db.js';
import { Accommodation, AccommodationCreate, AccommodationUpdate } from '../types/accommodation.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const getAllAccommodations = async (): Promise<Accommodation[]> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM accommodations ORDER BY created_at DESC'
  );
  return rows as Accommodation[];
};

export const getAccommodationById = async (id: number): Promise<Accommodation | null> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM accommodations WHERE id = ?',
    [id]
  );
  return rows.length > 0 ? (rows[0] as Accommodation) : null;
};

export const createAccommodation = async (data: AccommodationCreate): Promise<number> => {
  // Set default time slot support based on accommodation type
  // Rooms support whole_day by default, cottages do not
  const supportsWholeDayDefault = data.type === 'room' ? 1 : 0;
  
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO accommodations (name, type, capacity, description, price, add_price, inclusions, image_url, panoramic_url, supports_morning, supports_night, supports_whole_day)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.name,
      data.type,
      data.capacity,
      data.description || null,
      data.price,
      data.add_price || null,
      data.inclusions || null,
      data.image_url || null,
      data.panoramic_url || null,
      data.supports_morning !== undefined ? (data.supports_morning ? 1 : 0) : 1,
      data.supports_night !== undefined ? (data.supports_night ? 1 : 0) : 1,
      data.supports_whole_day !== undefined ? (data.supports_whole_day ? 1 : 0) : supportsWholeDayDefault,
    ]
  );
  return result.insertId;
};

export const updateAccommodation = async (id: number, data: AccommodationUpdate): Promise<boolean> => {
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
    `UPDATE accommodations SET ${fields.join(', ')} WHERE id = ?`,
    values
  );
  return result.affectedRows > 0;
};

export const deleteAccommodation = async (id: number): Promise<boolean> => {
  const [result] = await pool.query<ResultSetHeader>(
    'DELETE FROM accommodations WHERE id = ?',
    [id]
  );
  return result.affectedRows > 0;
};

export const updateAccommodationStatus = async (
  id: number, 
  status: 'vacant' | 'pending' | 'booked(morning)' | 'booked(night)' | 'booked(whole_day)'
): Promise<boolean> => {
  const [result] = await pool.query<ResultSetHeader>(
    'UPDATE accommodations SET status = ? WHERE id = ?',
    [status, id]
  );
  return result.affectedRows > 0;
};
