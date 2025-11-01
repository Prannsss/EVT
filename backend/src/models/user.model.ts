import { pool } from '../config/db.js';
import { User, UserCreate } from '../types/user.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const findUserByEmail = async (email: string): Promise<User | null> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM users WHERE email = ?',
    [email]
  );
  return rows.length > 0 ? (rows[0] as User) : null;
};

export const findUserById = async (id: number): Promise<User | null> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM users WHERE id = ?',
    [id]
  );
  return rows.length > 0 ? (rows[0] as User) : null;
};

export const createUser = async (user: UserCreate): Promise<number> => {
  const [result] = await pool.query<ResultSetHeader>(
    'INSERT INTO users (name, email, contact_number, password, role) VALUES (?, ?, ?, ?, ?)',
    [user.name, user.email, user.contact_number || null, user.password, user.role || 'user']
  );
  return result.insertId;
};

export const getAllUsers = async (): Promise<User[]> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT id, name, email, role, created_at, updated_at FROM users'
  );
  return rows as User[];
};

export const getAllClients = async (): Promise<any[]> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT 
      u.id,
      u.name,
      u.email,
      u.contact_number,
      u.created_at,
      COUNT(b.id) as total_bookings
    FROM users u
    LEFT JOIN bookings b ON u.id = b.user_id
    WHERE u.role = 'user'
    GROUP BY u.id, u.name, u.email, u.contact_number, u.created_at
    ORDER BY u.created_at DESC`
  );
  return rows as any[];
};

export const updateUserEmailVerified = async (
  id: number,
  verified: boolean
): Promise<void> => {
  await pool.query(
    'UPDATE users SET email_verified = ? WHERE id = ?',
    [verified, id]
  );
};
