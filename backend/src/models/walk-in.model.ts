import { pool } from '../config/db.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { WalkInLog, CreateWalkInLogData, UpdateWalkInLogData } from '../types/walk-in.js';

export const getAllWalkInLogs = async (): Promise<WalkInLog[]> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT 
      wil.*, 
      a.name as accommodation_name,
      u.name as created_by_name
    FROM walk_in_logs wil
    LEFT JOIN accommodations a ON wil.accommodation_id = a.id
    LEFT JOIN users u ON wil.created_by = u.id
    ORDER BY wil.created_at DESC`
  );
  return rows as WalkInLog[];
};

export const getWalkInLogById = async (id: number): Promise<WalkInLog | null> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT 
      wil.*, 
      a.name as accommodation_name,
      u.name as created_by_name
    FROM walk_in_logs wil
    LEFT JOIN accommodations a ON wil.accommodation_id = a.id
    LEFT JOIN users u ON wil.created_by = u.id
    WHERE wil.id = ?`,
    [id]
  );
  return rows.length > 0 ? (rows[0] as WalkInLog) : null;
};

export const getWalkInLogsByDateRange = async (
  startDate: string,
  endDate: string
): Promise<WalkInLog[]> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT 
      wil.*, 
      a.name as accommodation_name,
      u.name as created_by_name
    FROM walk_in_logs wil
    LEFT JOIN accommodations a ON wil.accommodation_id = a.id
    LEFT JOIN users u ON wil.created_by = u.id
    WHERE wil.check_in_date BETWEEN ? AND ?
    ORDER BY wil.check_in_date DESC`,
    [startDate, endDate]
  );
  return rows as WalkInLog[];
};

export const createWalkInLog = async (data: CreateWalkInLogData): Promise<number> => {
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO walk_in_logs 
    (client_name, guest_names, address, accommodation_id, check_in_date, 
     adults, kids, pwd, amount_paid, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.client_name,
      data.guest_names || null,
      data.address || null,
      data.accommodation_id || null,
      data.check_in_date,
      data.adults || 0,
      data.kids || 0,
      data.pwd || 0,
      data.amount_paid || 0,
      data.created_by || null,
    ]
  );
  return result.insertId;
};

export const updateWalkInLog = async (
  id: number,
  data: UpdateWalkInLogData
): Promise<boolean> => {
  const fields: string[] = [];
  const values: any[] = [];

  if (data.client_name !== undefined) {
    fields.push('client_name = ?');
    values.push(data.client_name);
  }
  if (data.guest_names !== undefined) {
    fields.push('guest_names = ?');
    values.push(data.guest_names);
  }
  if (data.address !== undefined) {
    fields.push('address = ?');
    values.push(data.address);
  }
  if (data.accommodation_id !== undefined) {
    fields.push('accommodation_id = ?');
    values.push(data.accommodation_id);
  }
  if (data.check_in_date !== undefined) {
    fields.push('check_in_date = ?');
    values.push(data.check_in_date);
  }
  if (data.adults !== undefined) {
    fields.push('adults = ?');
    values.push(data.adults);
  }
  if (data.kids !== undefined) {
    fields.push('kids = ?');
    values.push(data.kids);
  }
  if (data.pwd !== undefined) {
    fields.push('pwd = ?');
    values.push(data.pwd);
  }
  if (data.amount_paid !== undefined) {
    fields.push('amount_paid = ?');
    values.push(data.amount_paid);
  }

  if (fields.length === 0) {
    return false;
  }

  values.push(id);
  const [result] = await pool.query<ResultSetHeader>(
    `UPDATE walk_in_logs SET ${fields.join(', ')} WHERE id = ?`,
    values
  );
  return result.affectedRows > 0;
};

export const deleteWalkInLog = async (id: number): Promise<boolean> => {
  const [result] = await pool.query<ResultSetHeader>(
    'DELETE FROM walk_in_logs WHERE id = ?',
    [id]
  );
  return result.affectedRows > 0;
};

export const checkOutWalkInLog = async (id: number): Promise<boolean> => {
  const [result] = await pool.query<ResultSetHeader>(
    'UPDATE walk_in_logs SET checked_out = TRUE, checked_out_at = NOW() WHERE id = ?',
    [id]
  );
  return result.affectedRows > 0;
};
