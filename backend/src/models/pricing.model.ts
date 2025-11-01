import { pool } from '../config/db.js';
import { PricingSetting, PricingUpdate } from '../types/pricing.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const getAllPricing = async (): Promise<PricingSetting[]> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM pricing_settings ORDER BY category, type'
  );
  return rows as PricingSetting[];
};

export const getPricingByCategory = async (category: string): Promise<PricingSetting[]> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM pricing_settings WHERE category = ? ORDER BY type',
    [category]
  );
  return rows as PricingSetting[];
};

export const updatePricing = async (updates: PricingUpdate[]): Promise<boolean> => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    for (const update of updates) {
      await connection.query<ResultSetHeader>(
        'UPDATE pricing_settings SET price = ? WHERE category = ? AND type = ?',
        [update.price, update.category, update.type]
      );
    }

    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const updateSinglePricing = async (
  category: string,
  type: string,
  price: number
): Promise<boolean> => {
  const [result] = await pool.query<ResultSetHeader>(
    'UPDATE pricing_settings SET price = ? WHERE category = ? AND type = ?',
    [price, category, type]
  );
  return result.affectedRows > 0;
};
