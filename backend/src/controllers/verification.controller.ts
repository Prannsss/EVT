import { Request, Response } from 'express';
import {
  generateVerificationCode,
  createVerificationCode,
  verifyCode,
  deleteVerificationCode,
} from '../models/verification.model.js';
import { sendVerificationEmail } from '../services/email.service.js';
import { findUserByEmail, updateUserEmailVerified } from '../models/user.model.js';

// Send verification code
export const sendVerificationCode = async (req: Request, res: Response) => {
  try {
    const { email, name } = req.body;

    if (!email || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email and name are required',
      });
    }

    // Generate 6-digit code
    const code = generateVerificationCode();

    // Save to database (expires in 15 minutes)
    await createVerificationCode(email, code, 15);

    // Send email
    const emailSent = await sendVerificationEmail(email, name, code);

    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Verification code sent successfully',
    });
  } catch (error) {
    console.error('Error sending verification code:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send verification code',
    });
  }
};

// Verify code
export const verifyEmailCode = async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: 'Email and code are required',
      });
    }

    // Verify the code
    const isValid = await verifyCode(email, code);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification code',
      });
    }

    // Update user's email_verified status
    const user = await findUserByEmail(email);
    if (user) {
      await updateUserEmailVerified(user.id, true);
    }

    // Delete the used code
    await deleteVerificationCode(email, code);

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      verified: true,
    });
  } catch (error) {
    console.error('Error verifying code:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify code',
    });
  }
};

// Resend verification code
export const resendVerificationCode = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    // Check if user exists
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.email_verified) {
      return res.status(400).json({
        success: false,
        message: 'Email already verified',
      });
    }

    // Generate new code
    const code = generateVerificationCode();

    // Save to database
    await createVerificationCode(email, code, 15);

    // Send email
    const emailSent = await sendVerificationEmail(email, user.name, code);

    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Verification code resent successfully',
    });
  } catch (error) {
    console.error('Error resending verification code:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to resend verification code',
    });
  }
};
