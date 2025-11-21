import { sendEmail } from '../config/email.js';
import { env } from '../config/env.js';
import { logEmail } from '../models/email-log.model.js';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface VerificationEmailData {
  to: string;
  name: string;
  code: string;
}

interface BookingNotificationData {
  to: string;
  clientName: string;
  status: 'approved' | 'rejected';
  bookingId: number;
  accommodation: string;
  checkIn: string;
  checkOut?: string;
  adminMessage?: string;
}

interface BookingConfirmationData {
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

interface CheckOutEmailData {
  clientEmail: string;
  clientName: string;
  bookingDetails: {
    accommodationName?: string;
    checkInDate: string;
    checkOutDate?: string;
    amountPaid: number;
  };
}

// ============================================================================
// VERIFICATION CODE EMAIL
// ============================================================================

export const sendVerificationCodeEmail = async (
  data: VerificationEmailData
): Promise<boolean> => {
  const subject = 'Email Verification Code - Elimar Spring Garden';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
          color: white; 
          padding: 30px; 
          text-align: center; 
          border-radius: 10px 10px 0 0; 
        }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .code-box {
          background: white;
          border: 2px dashed #667eea;
          border-radius: 10px;
          padding: 30px;
          margin: 25px 0;
          text-align: center;
        }
        .code {
          font-size: 36px;
          font-weight: bold;
          color: #667eea;
          letter-spacing: 8px;
          font-family: 'Courier New', monospace;
        }
        .warning {
          background: #fff3cd;
          border-left: 4px solid #ffc107;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Email Verification</h1>
        </div>
        <div class="content">
          <p>Dear ${data.name},</p>
          <p>Welcome to Elimar Spring Garden! To complete your registration, please verify your email address using the code below:</p>
          
          <div class="code-box">
            <p style="margin: 0; font-size: 14px; color: #666;">Your Verification Code</p>
            <div class="code">${data.code}</div>
            <p style="margin: 10px 0 0 0; font-size: 12px; color: #999;">Valid for 15 minutes</p>
          </div>
          
          <div class="warning">
            <strong>⚠️ Security Notice:</strong>
            <ul style="margin: 5px 0 0 0; padding-left: 20px;">
              <li>Never share this code with anyone</li>
              <li>Our team will never ask for this code</li>
              <li>This code expires in 15 minutes</li>
            </ul>
          </div>
          
          <p>If you didn't request this verification code, please ignore this email or contact our support team if you have concerns.</p>
          
          <p>Best regards,<br>${env.EMAIL_FROM_NAME || 'Elimar Spring Garden Team'}</p>
        </div>
        <div class="footer">
          <p>This is an automated message, please do not reply.</p>
          <p>&copy; ${new Date().getFullYear()} Elimar Spring Garden. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    console.log(`📧 Attempting to send verification email to ${data.to}...`);
    const sent = await sendEmail({
      to: data.to,
      subject,
      html,
    });

    const message = `Verification code: ${data.code}`;
    await logEmail(data.to, subject, message, 'verification', sent ? 'sent' : 'failed');

    if (sent) {
      console.log(`✅ Verification code email sent successfully to ${data.to}`);
    } else {
      console.error(`❌ Failed to send verification code email to ${data.to} - sendEmail returned false`);
    }
    return sent;
  } catch (error) {
    console.error('❌ Exception while sending verification code email:', error);
    const message = `Verification code: ${data.code}`;
    await logEmail(data.to, subject, message, 'verification', 'failed');
    return false;
  }
};

// ============================================================================
// BOOKING NOTIFICATION EMAILS (APPROVE/REJECT)
// ============================================================================

export const sendBookingNotificationEmail = async (
  data: BookingNotificationData
): Promise<boolean> => {
  const isApproved = data.status === 'approved';
  const subject = `Booking ${isApproved ? 'Approved' : 'Rejected'} - #${data.bookingId}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { 
          background: linear-gradient(135deg, ${isApproved ? '#10b981 0%, #059669 100%' : '#ef4444 0%, #dc2626 100%'}); 
          color: white; 
          padding: 30px; 
          text-align: center; 
          border-radius: 10px 10px 0 0; 
        }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .details-box { 
          background: white; 
          border: 1px solid #ddd; 
          border-radius: 8px; 
          padding: 20px; 
          margin: 20px 0; 
        }
        .status-badge {
          display: inline-block;
          padding: 8px 16px;
          border-radius: 5px;
          font-weight: bold;
          background: ${isApproved ? '#10b981' : '#ef4444'};
          color: white;
          margin: 10px 0;
        }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${isApproved ? '✓' : '✕'} Booking ${isApproved ? 'Approved' : 'Rejected'}</h1>
        </div>
        <div class="content">
          <p>Dear ${data.clientName},</p>
          <p>We have reviewed your booking request.</p>
          
          <div class="status-badge">${data.status.toUpperCase()}</div>
          
          <div class="details-box">
            <h3>Booking Details:</h3>
            <p><strong>Booking ID:</strong> #${data.bookingId}</p>
            <p><strong>Accommodation:</strong> ${data.accommodation}</p>
            <p><strong>Check-In:</strong> ${new Date(data.checkIn).toLocaleDateString()}</p>
            ${data.checkOut ? `<p><strong>Check-Out:</strong> ${new Date(data.checkOut).toLocaleDateString()}</p>` : ''}
            <p><strong>Status:</strong> ${isApproved ? 'Approved' : 'Rejected'}</p>
          </div>
          
          ${data.adminMessage ? `
          <div class="details-box">
            <h3>Message from Admin:</h3>
            <p>${data.adminMessage}</p>
          </div>
          ` : ''}
          
          ${isApproved ? `
          <div class="details-box" style="background: #fef3c7; border-left: 4px solid #f59e0b;">
            <h3 style="color: #92400e; margin-top: 0;">⚠️ Important: What to Bring</h3>
            <p style="font-size: 16px; margin: 10px 0;">Your booking has been confirmed! We look forward to welcoming you on your check-in date.</p>
            <p style="font-size: 18px; font-weight: bold; color: #92400e; background: white; padding: 15px; border-radius: 5px; text-align: center; border: 2px dashed #f59e0b;">
              📋 Please bring a valid ID for us to verify that it's you.
            </p>
            <p style="font-size: 14px; color: #78350f; margin-bottom: 0;">We will need to verify your identity upon arrival for security purposes.</p>
          </div>
          ` : `
          <p>Unfortunately, we were unable to approve your booking request at this time. 
          This could be due to availability issues or other constraints. Please feel free to contact us 
          for more information or to make an alternative booking.</p>
          `}
          
          <p>Best regards,<br>${env.EMAIL_FROM_NAME || 'Resort Management Team'}</p>
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
      to: data.to,
      subject,
      html,
    });

    const message = `Booking #${data.bookingId} ${data.status} - ${data.accommodation}`;
    await logEmail(data.to, subject, message, 'status_update', sent ? 'sent' : 'failed');

    if (sent) {
      console.log(`✅ Booking ${data.status} email sent to ${data.to}`);
    }
    return sent;
  } catch (error) {
    console.error(`❌ Failed to send booking ${data.status} email:`, error);
    const message = `Booking #${data.bookingId} ${data.status} - ${data.accommodation}`;
    await logEmail(data.to, subject, message, 'status_update', 'failed');
    return false;
  }
};

// ============================================================================
// BOOKING CONFIRMATION EMAIL (INITIAL BOOKING SUBMISSION)
// ============================================================================

export const sendBookingConfirmation = async (
  data: BookingConfirmationData
): Promise<boolean> => {
  const subject = `Booking Received - #${data.bookingId}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .details-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .details-table td { padding: 8px; border: 1px solid #ddd; }
        .details-table td:first-child { font-weight: bold; background: #f5f5f5; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Booking Request Received</h1>
        </div>
        <div class="content">
          <p>Dear ${data.clientName},</p>
          <p>Thank you for your booking request. We have received your submission and it is currently under review.</p>
          
          <table class="details-table">
            <tr>
              <td>Booking ID</td>
              <td>#${data.bookingId}</td>
            </tr>
            <tr>
              <td>Accommodation</td>
              <td>${data.accommodationName}</td>
            </tr>
            <tr>
              <td>Check-In Date</td>
              <td>${new Date(data.checkInDate).toLocaleDateString()}</td>
            </tr>
            ${data.checkOutDate ? `
            <tr>
              <td>Check-Out Date</td>
              <td>${new Date(data.checkOutDate).toLocaleDateString()}</td>
            </tr>
            ` : ''}
            <tr>
              <td>Guests</td>
              <td>Adults: ${data.adults}, Kids: ${data.kids}, PWD: ${data.pwd}</td>
            </tr>
            <tr>
              <td>Total Amount</td>
              <td><strong>₱${data.totalAmount.toLocaleString()}</strong></td>
            </tr>
          </table>
          
          <p><strong>What's Next?</strong></p>
          <p>Our team will review your booking request and notify you via email once it has been approved or if we need any additional information.</p>
          
          <p>Best regards,<br>${env.EMAIL_FROM_NAME || 'Resort Management Team'}</p>
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
      to: data.clientEmail,
      subject,
      html,
    });

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

// ============================================================================
// CHECK-OUT THANK YOU EMAIL
// ============================================================================

export const sendCheckOutThankYouEmail = async (
  data: CheckOutEmailData
): Promise<boolean> => {
  const subject = 'Thank You for Your Stay!';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .details { background: white; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Thank You for Staying With Us!</h1>
        </div>
        <div class="content">
          <p>Dear ${data.clientName},</p>
          <p>We hope you enjoyed your stay at our resort. It was a pleasure having you as our guest!</p>
          
          <div class="details">
            <h3>Your Stay Details:</h3>
            ${data.bookingDetails.accommodationName ? `<p><strong>Accommodation:</strong> ${data.bookingDetails.accommodationName}</p>` : ''}
            <p><strong>Check-In Date:</strong> ${new Date(data.bookingDetails.checkInDate).toLocaleDateString()}</p>
            ${data.bookingDetails.checkOutDate ? `<p><strong>Check-Out Date:</strong> ${new Date(data.bookingDetails.checkOutDate).toLocaleDateString()}</p>` : ''}
            <p><strong>Amount Paid:</strong> ₱${data.bookingDetails.amountPaid.toLocaleString()}</p>
          </div>
          
          <p>We would love to welcome you back in the future. If you have any feedback or suggestions, please don't hesitate to reach out to us.</p>
          
          <p>Safe travels and we hope to see you again soon!</p>
          
          <p>Warm regards,<br>${env.EMAIL_FROM_NAME || 'Resort Management Team'}</p>
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
      to: data.clientEmail,
      subject,
      html,
    });

    const message = `Check-out thank you for ${data.clientName}`;
    await logEmail(data.clientEmail, subject, message, 'other', sent ? 'sent' : 'failed');

    if (sent) {
      console.log(`✅ Check-out thank you email sent to ${data.clientEmail}`);
    }
    return sent;
  } catch (error) {
    console.error('❌ Failed to send check-out thank you email:', error);
    const message = `Check-out thank you for ${data.clientName}`;
    await logEmail(data.clientEmail, subject, message, 'other', 'failed');
    return false;
  }
};
