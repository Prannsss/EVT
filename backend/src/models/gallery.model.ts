import { pool } from '../config/db.js';
import { Gallery, GalleryCreate } from '../types/gallery.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const getAllGalleryImages = async (): Promise<Gallery[]> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM gallery ORDER BY uploaded_at DESC'
  );
  return rows as Gallery[];
};

export const getGalleryImageById = async (id: number): Promise<Gallery | null> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM gallery WHERE id = ?',
    [id]
  );
  return rows.length > 0 ? (rows[0] as Gallery) : null;
};

export const createGalleryImage = async (data: GalleryCreate): Promise<number> => {
  const [result] = await pool.query<ResultSetHeader>(
    'INSERT INTO gallery (title, image_url, description) VALUES (?, ?, ?)',
    [data.title || null, data.image_url, data.description || null]
  );
  return result.insertId;
};

export const deleteGalleryImage = async (id: number): Promise<boolean> => {
  const [result] = await pool.query<ResultSetHeader>(
    'DELETE FROM gallery WHERE id = ?',
    [id]
  );
  return result.affectedRows > 0;
};
