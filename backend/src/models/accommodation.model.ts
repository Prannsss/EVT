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
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO accommodations (name, type, capacity, description, price, inclusions, image_url, panoramic_url)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.name,
      data.type,
      data.capacity,
      data.description || null,
      data.price,
      data.inclusions || null,
      data.image_url || null,
      data.panoramic_url || null,
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
