import { Request, Response } from 'express';
import { pool } from '../config/db.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const getPaymentSettings = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM payment_settings ORDER BY id DESC LIMIT 1'
    );
    const settings = (rows as any[])[0] || { qr_code_url: null };
    res.json(successResponse(settings));
  } catch (error: any) {
    console.error('Get payment settings error:', error);
    res.status(500).json(errorResponse(error.message));
  }
};

export const updateQRCode = async (req: Request, res: Response) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    
    if (!files?.qrCode || files.qrCode.length === 0) {
      return res.status(400).json(errorResponse('QR code image is required', 400));
    }

    const qrCodeUrl = `/uploads/${files.qrCode[0].filename}`;

    // Check if a record exists
    const [existing] = await pool.query('SELECT id FROM payment_settings LIMIT 1');
    const existingRecord = (existing as any[])[0];

    if (existingRecord) {
      // Update existing record
      await pool.query(
        'UPDATE payment_settings SET qr_code_url = ?, updated_at = NOW() WHERE id = ?',
        [qrCodeUrl, existingRecord.id]
      );
    } else {
      // Insert new record
      await pool.query(
        'INSERT INTO payment_settings (qr_code_url) VALUES (?)',
        [qrCodeUrl]
      );
    }

    res.json(successResponse({ qr_code_url: qrCodeUrl }, 'QR code updated successfully'));
  } catch (error: any) {
    console.error('Update QR code error:', error);
    res.status(500).json(errorResponse(error.message));
  }
};
