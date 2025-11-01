import { pool } from '../config/db.js';
import { ResultSetHeader } from 'mysql2';

type EmailType = 'verification' | 'booking_confirmation' | 'status_update' | 'other';

export const logEmail = async (
  recipient: string,
  subject: string,
  message: string,
  emailType: EmailType = 'other',
  status: 'sent' | 'failed' = 'sent'
): Promise<number> => {
  try {
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO email_logs (recipient, subject, message, email_type, status) 
       VALUES (?, ?, ?, ?, ?)`,
      [recipient, subject, message, emailType, status]
    );
    return result.insertId;
  } catch (error) {
    console.error('Failed to log email:', error);
    throw error;
  }
};

export const getEmailLogs = async (limit: number = 100) => {
  try {
    const [rows] = await pool.execute(
      `SELECT * FROM email_logs ORDER BY sent_at DESC LIMIT ?`,
      [limit]
    );
    return rows;
  } catch (error) {
    console.error('Failed to get email logs:', error);
    throw error;
  }
};
