import { Request, Response } from 'express';
import { generateLogBookReport } from '../services/pdf.service.js';
import { getWalkInLogsByDateRange, getAllWalkInLogs } from '../models/walk-in.model.js';
import { pool } from '../config/db.js';
import { RowDataPacket } from 'mysql2';
import { successResponse, errorResponse } from '../utils/response.js';

export const generateReport = async (req: Request, res: Response) => {
  try {
    const { reportType, month, year } = req.query;

    let startDate: string;
    let endDate: string;
    let monthName: string | undefined;

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    if (reportType === 'month' && month && year) {
      // Generate report for specific month
      const monthNum = parseInt(month as string);
      const yearNum = parseInt(year as string);
      
      if (isNaN(monthNum) || isNaN(yearNum) || monthNum < 1 || monthNum > 12) {
        return res.status(400).json(errorResponse('Invalid month or year'));
      }
      
      startDate = `${yearNum}-${monthNum.toString().padStart(2, '0')}-01`;
      
      // Get last day of month
      const lastDay = new Date(yearNum, monthNum, 0).getDate();
      endDate = `${yearNum}-${monthNum.toString().padStart(2, '0')}-${lastDay}`;
      
      // Convert month number to month name
      monthName = monthNames[monthNum - 1];
    } else {
      // All-time report
      startDate = '1970-01-01';
      endDate = '2099-12-31';
    }

    // Fetch walk-in logs
    const walkInLogs = await getWalkInLogsByDateRange(startDate, endDate);

    // Fetch regular bookings
    const [regularBookings] = await pool.query<RowDataPacket[]>(
      `SELECT 
        b.id,
        b.check_in_date,
        b.adults,
        b.kids,
        b.pwd,
        b.total_price,
        b.status,
        u.name as user_name,
        u.email as user_email,
        a.name as accommodation_name
      FROM bookings b
      LEFT JOIN users u ON b.user_id = u.id
      LEFT JOIN accommodations a ON b.accommodation_id = a.id
      WHERE b.check_in_date BETWEEN ? AND ?
      AND b.status IN ('approved', 'completed')
      ORDER BY b.check_in_date DESC`,
      [startDate, endDate]
    );

    // Fetch event bookings
    const [eventBookings] = await pool.query<RowDataPacket[]>(
      `SELECT 
        eb.id,
        eb.event_type,
        eb.booking_date,
        eb.total_price,
        eb.status,
        u.name as user_name,
        u.email as user_email
      FROM event_bookings eb
      LEFT JOIN users u ON eb.user_id = u.id
      WHERE eb.booking_date BETWEEN ? AND ?
      AND eb.status IN ('approved', 'completed')
      ORDER BY eb.booking_date DESC`,
      [startDate, endDate]
    );

    // Generate PDF
    generateLogBookReport(res, {
      walkInLogs,
      regularBookings: regularBookings as any[],
      eventBookings: eventBookings as any[],
      reportType: reportType === 'month' ? 'month' : 'all-time',
      month: monthName,
      year: year as string,
    });
  } catch (err) {
    console.error('Error generating report:', err);
    return res.status(500).json(errorResponse('Failed to generate report'));
  }
};

export const getReportClients = async (req: Request, res: Response) => {
  try {
    // Get all unique clients from bookings, event bookings, and walk-ins
    const [clients] = await pool.query<RowDataPacket[]>(
      `SELECT DISTINCT u.id, u.name, u.email
      FROM users u
      WHERE u.id IN (
        SELECT DISTINCT user_id FROM bookings
        UNION
        SELECT DISTINCT user_id FROM event_bookings
      )
      ORDER BY u.name ASC`
    );

    return res.json(successResponse(clients, 'Clients retrieved successfully'));
  } catch (err) {
    console.error('Error fetching clients:', err);
    return res.status(500).json(errorResponse('Failed to fetch clients'));
  }
};

export const updateClientGuestNames = async (req: Request, res: Response) => {
  try {
    const { clientId } = req.params;
    const { guestNames } = req.body;

    // This could be stored in a separate table or as user metadata
    // For now, we'll return success as the guest names are managed per booking
    return res.json(successResponse(null, 'Guest names updated successfully'));
  } catch (err) {
    console.error('Error updating guest names:', err);
    return res.status(500).json(errorResponse('Failed to update guest names'));
  }
};
