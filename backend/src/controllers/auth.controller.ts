import { Request, Response } from 'express';
import { findUserByEmail, createUser, getAllClients } from '../models/user.model.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateToken } from '../utils/jwt.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { generateVerificationCode, createVerificationCode } from '../models/verification.model.js';

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, contact_number, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json(errorResponse('Name, email, and password are required', 400));
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json(errorResponse('Email already registered', 409));
    }

    // Create user with email_verified = false
    const hashedPassword = await hashPassword(password);
    const userId = await createUser({
      name,
      email,
      contact_number,
      password: hashedPassword,
      role: 'user',
    });

    // Generate verification code (email sending can be implemented via frontend service)
    const verificationCode = generateVerificationCode();
    await createVerificationCode(email, verificationCode, 15);
    // Note: Email sending removed from backend - implement via frontend if needed

    res.status(201).json(
      successResponse(
        {
          user: { id: userId, name, email, contact_number, role: 'user' },
          message: 'User registered successfully. Please check your email to verify your account.',
        },
        'User registered successfully'
      )
    );
  } catch (error: any) {
    console.error('Register error:', error);
    res.status(500).json(errorResponse(error.message));
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json(errorResponse('Email and password are required', 400));
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json(errorResponse('Invalid credentials', 401));
    }

    // Check if email is verified
    if (!user.email_verified) {
      return res.status(403).json(errorResponse('Please verify your email before logging in', 403));
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json(errorResponse('Invalid credentials', 401));
    }

    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    res.json(
      successResponse(
        {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
          token,
        },
        'Login successful'
      )
    );
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json(errorResponse(error.message));
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = await findUserByEmail(req.user!.email);
    if (!user) {
      return res.status(404).json(errorResponse('User not found', 404));
    }

    res.json(
      successResponse({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
      })
    );
  } catch (error: any) {
    console.error('Get profile error:', error);
    res.status(500).json(errorResponse(error.message));
  }
};

export const getClients = async (req: Request, res: Response) => {
  try {
    const clients = await getAllClients();
    
    res.json(
      successResponse(
        clients.map(client => ({
          id: client.id,
          name: client.name,
          email: client.email,
          contactNumber: client.contact_number,
          memberSince: client.created_at,
          totalBookings: parseInt(client.total_bookings) || 0,
        })),
        'Clients retrieved successfully'
      )
    );
  } catch (error: any) {
    console.error('Get clients error:', error);
    res.status(500).json(errorResponse(error.message));
  }
};
