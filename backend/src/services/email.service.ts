import { sendEmail } from '../config/email.js';
import { env } from '../config/env.js';
import { logEmail } from '../models/email-log.model.js';

interface BookingEmailData {
  clientName: string;
  clientEmail: string;
  accommodationName: string;
  checkInDate: string;
  checkOutDate?: string;
  adults: number;
  kids: number;
  pwd: number;
  totalAmount: number;
  bookingId: number;
}

export const sendVerificationEmail = async (
  email: string,
  name: string,
  code: string
): Promise<boolean> => {
  const subject = 'Verify Your Email - Resort Booking';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .code-box { background: white; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
        .code { font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #667eea; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Email Verification</h1>
        </div>
        <div class="content">
          <p>Hello ${name},</p>
          <p>Thank you for signing up! Please use the verification code below to verify your email address:</p>
          
          <div class="code-box">
            <div class="code">${code}</div>
          </div>
          
          <p><strong>This code will expire in 15 minutes.</strong></p>
          
          <p>If you didn't create an account, please ignore this email.</p>
          
          <p>Best regards,<br>${env.EMAIL_FROM_NAME}</p>
        </div>
        <div class="footer">
          <p>This is an automated message, please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const sent = await sendEmail({
      to: email,
      subject,
      html,
    });

    // Log email to database
    await logEmail(email, subject, `Verification code: ${code}`, 'verification', sent ? 'sent' : 'failed');

    if (sent) {
      console.log(`✅ Verification email sent to ${email}`);
    }
    return sent;
  } catch (error) {
    console.error('❌ Failed to send verification email:', error);
    await logEmail(email, subject, `Verification code: ${code}`, 'verification', 'failed');
    return false;
  }
};

export const sendBookingConfirmation = async (data: BookingEmailData): Promise<boolean> => {
  const subject = `Booking Confirmation - #${data.bookingId}`;
  const html = `
    <h2>Booking Confirmation</h2>
    <p>Dear ${data.clientName},</p>
    <p>Thank you for your booking. Here are your booking details:</p>
    
    <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;"><strong>Booking ID:</strong></td>
        <td style="padding: 8px; border: 1px solid #ddd;">#${data.bookingId}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;"><strong>Accommodation:</strong></td>
        <td style="padding: 8px; border: 1px solid #ddd;">${data.accommodationName}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;"><strong>Check-in Date:</strong></td>
        <td style="padding: 8px; border: 1px solid #ddd;">${data.checkInDate}</td>
      </tr>
      ${data.checkOutDate ? `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;"><strong>Check-out Date:</strong></td>
        <td style="padding: 8px; border: 1px solid #ddd;">${data.checkOutDate}</td>
      </tr>
      ` : ''}
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;"><strong>Guests:</strong></td>
        <td style="padding: 8px; border: 1px solid #ddd;">
          Adults: ${data.adults}, Kids: ${data.kids}, PWD: ${data.pwd}
        </td>
      </tr>
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;"><strong>Total Amount:</strong></td>
        <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">₱${data.totalAmount.toFixed(2)}</td>
      </tr>
    </table>
    
    <p style="margin-top: 20px;">We look forward to welcoming you!</p>
    <p>Best regards,<br>Resort Management Team</p>
  `;

  try {
    const sent = await sendEmail({
      to: data.clientEmail,
      subject,
      html,
    });

    // Log email to database
    const message = `Booking #${data.bookingId} - ${data.accommodationName} for ${data.clientName}`;
    await logEmail(data.clientEmail, subject, message, 'booking_confirmation', sent ? 'sent' : 'failed');

    if (sent) {
      console.log(`✅ Booking confirmation email sent to ${data.clientEmail}`);
    }
    return sent;
  } catch (error) {
    console.error('❌ Failed to send booking confirmation email:', error);
    const message = `Booking #${data.bookingId} - ${data.accommodationName} for ${data.clientName}`;
    await logEmail(data.clientEmail, subject, message, 'booking_confirmation', 'failed');
    return false;
  }
};

export const sendBookingStatusUpdate = async (
  clientEmail: string,
  clientName: string,
  bookingId: number,
  status: string
): Promise<boolean> => {
  const subject = `Booking Status Update - #${bookingId}`;
  const html = `
    <h2>Booking Status Update</h2>
    <p>Dear ${clientName},</p>
    <p>Your booking #${bookingId} status has been updated to: <strong>${status.toUpperCase()}</strong></p>
    <p>Best regards,<br>Resort Management Team</p>
  `;

  try {
    const sent = await sendEmail({
      to: clientEmail,
      subject,
      html,
    });

    // Log email to database
    const message = `Booking #${bookingId} status updated to ${status}`;
    await logEmail(clientEmail, subject, message, 'status_update', sent ? 'sent' : 'failed');

    if (sent) {
      console.log(`✅ Status update email sent to ${clientEmail}`);
    }
    return sent;
  } catch (error) {
    console.error('❌ Failed to send status update email:', error);
    const message = `Booking #${bookingId} status updated to ${status}`;
    await logEmail(clientEmail, subject, message, 'status_update', 'failed');
    return false;
  }
};
