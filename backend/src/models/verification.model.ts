import { pool } from '../config/db.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

interface VerificationCode extends RowDataPacket {
  id: number;
  email: string;
  code: string;
  expires_at: Date;
  created_at: Date;
}

export const createVerificationCode = async (
  email: string,
  code: string,
  expiresInMinutes: number = 15
): Promise<number> => {
  const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);
  
  const [result] = await pool.execute<ResultSetHeader>(
    'INSERT INTO email_verification_codes (email, code, expires_at) VALUES (?, ?, ?)',
    [email, code, expiresAt]
  );
  
  return result.insertId;
};

export const verifyCode = async (
  email: string,
  code: string
): Promise<boolean> => {
  const [rows] = await pool.execute<VerificationCode[]>(
    `SELECT * FROM email_verification_codes 
     WHERE email = ? AND code = ? AND expires_at > NOW() 
     ORDER BY created_at DESC LIMIT 1`,
    [email, code]
  );
  
  return rows.length > 0;
};

export const deleteVerificationCode = async (
  email: string,
  code: string
): Promise<void> => {
  await pool.execute(
    'DELETE FROM email_verification_codes WHERE email = ? AND code = ?',
    [email, code]
  );
};

export const deleteExpiredCodes = async (): Promise<void> => {
  await pool.execute(
    'DELETE FROM email_verification_codes WHERE expires_at < NOW()'
  );
};

export const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const getAllVerificationRequests = async (): Promise<any[]> => {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT 
      evc.id,
      evc.email,
      evc.code,
      evc.expires_at,
      evc.created_at,
      u.id as user_id,
      u.name as user_name
    FROM email_verification_codes evc
    LEFT JOIN users u ON evc.email = u.email
    ORDER BY evc.created_at DESC`
  );
  
  return rows;
};
