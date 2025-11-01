import { Request, Response } from 'express';
import { getEmailLogs } from '../models/email-log.model.js';

export const getEmailLogsController = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const logs = await getEmailLogs(limit);

    return res.status(200).json({
      success: true,
      data: logs,
      message: 'Email logs retrieved successfully',
    });
  } catch (error) {
    console.error('Error getting email logs:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve email logs',
    });
  }
};
