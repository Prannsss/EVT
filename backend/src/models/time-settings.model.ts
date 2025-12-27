import { pool } from '../config/db.js';
import { TimeSlotSetting, TimeSlotSettingUpdate } from '../types/time-settings.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const getAllTimeSlotSettings = async (): Promise<TimeSlotSetting[]> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM time_slot_settings ORDER BY slot_type, accommodation_type'
  );
  return rows as TimeSlotSetting[];
};

export const getTimeSlotSettingById = async (id: number): Promise<TimeSlotSetting | null> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM time_slot_settings WHERE id = ?',
    [id]
  );
  return rows.length > 0 ? (rows[0] as TimeSlotSetting) : null;
};

export const getTimeSlotSettingByType = async (
  slotType: string,
  accommodationType: string
): Promise<TimeSlotSetting | null> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM time_slot_settings WHERE slot_type = ? AND accommodation_type = ?',
    [slotType, accommodationType]
  );
  return rows.length > 0 ? (rows[0] as TimeSlotSetting) : null;
};

export const getEnabledTimeSlotSettings = async (): Promise<TimeSlotSetting[]> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM time_slot_settings WHERE is_enabled = 1 ORDER BY slot_type, accommodation_type'
  );
  return rows as TimeSlotSetting[];
};

export const updateTimeSlotSetting = async (id: number, data: TimeSlotSettingUpdate): Promise<boolean> => {
  const fields: string[] = [];
  const values: any[] = [];

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) {
      fields.push(`${key} = ?`);
      // Convert boolean to 0/1 for MySQL
      if (key === 'is_overnight' || key === 'is_enabled') {
        values.push(value ? 1 : 0);
      } else {
        values.push(value);
      }
    }
  });

  if (fields.length === 0) return false;

  values.push(id);
  const [result] = await pool.query<ResultSetHeader>(
    `UPDATE time_slot_settings SET ${fields.join(', ')} WHERE id = ?`,
    values
  );
  return result.affectedRows > 0;
};

export const updateTimeSlotSettingByType = async (
  slotType: string,
  accommodationType: string,
  data: TimeSlotSettingUpdate
): Promise<boolean> => {
  const fields: string[] = [];
  const values: any[] = [];

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) {
      fields.push(`${key} = ?`);
      // Convert boolean to 0/1 for MySQL
      if (key === 'is_overnight' || key === 'is_enabled') {
        values.push(value ? 1 : 0);
      } else {
        values.push(value);
      }
    }
  });

  if (fields.length === 0) return false;

  values.push(slotType, accommodationType);
  const [result] = await pool.query<ResultSetHeader>(
    `UPDATE time_slot_settings SET ${fields.join(', ')} WHERE slot_type = ? AND accommodation_type = ?`,
    values
  );
  return result.affectedRows > 0;
};

// Bulk update all time slot settings at once
export const updateAllTimeSlotSettings = async (settings: {
  morning?: { start_time: string; end_time: string };
  night_cottage?: { start_time: string; end_time: string };
  night_room?: { start_time: string; end_time: string };
  whole_day?: { start_time: string; end_time: string };
}): Promise<boolean> => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    if (settings.morning) {
      await connection.query(
        `UPDATE time_slot_settings SET start_time = ?, end_time = ? WHERE slot_type = 'morning' AND accommodation_type = 'all'`,
        [settings.morning.start_time, settings.morning.end_time]
      );
    }

    if (settings.night_cottage) {
      await connection.query(
        `UPDATE time_slot_settings SET start_time = ?, end_time = ? WHERE slot_type = 'night' AND accommodation_type = 'cottage'`,
        [settings.night_cottage.start_time, settings.night_cottage.end_time]
      );
    }

    if (settings.night_room) {
      await connection.query(
        `UPDATE time_slot_settings SET start_time = ?, end_time = ? WHERE slot_type = 'night' AND accommodation_type = 'room'`,
        [settings.night_room.start_time, settings.night_room.end_time]
      );
    }

    if (settings.whole_day) {
      await connection.query(
        `UPDATE time_slot_settings SET start_time = ?, end_time = ? WHERE slot_type = 'whole_day' AND accommodation_type = 'room'`,
        [settings.whole_day.start_time, settings.whole_day.end_time]
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
