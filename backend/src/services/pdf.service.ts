import PDFDocument from 'pdfkit';
import { Response } from 'express';
import { WalkInLog } from '../types/walk-in.js';

interface Booking {
  id: number;
  user_name?: string;
  user_email?: string;
  accommodation_name?: string;
  check_in_date: string;
  total_price: number;
  status: string;
  adults?: number;
  kids?: number;
  pwd?: number;
  guest_names?: string;
}

interface EventBooking {
  id: number;
  user_name?: string;
  user_email?: string;
  event_type: string;
  booking_date: string;
  total_price: number;
  status: string;
}

interface ReportData {
  walkInLogs: WalkInLog[];
  regularBookings: Booking[];
  eventBookings: EventBooking[];
  reportType: 'month' | 'all-time';
  month?: string;
  year?: string;
  scope?: 'entire' | 'guest-list';
}

// Constants for styling
const COLORS = {
  primary: '#2563eb',
  success: '#16a34a',
  text: '#000000',
  textLight: '#374151',
  textMuted: '#6b7280',
  border: '#e5e7eb',
  borderLight: '#f3f4f6',
} as const;

const FONTS = {
  bold: 'Helvetica-Bold',
  regular: 'Helvetica',
} as const;

const FONT_SIZES = {
  title: 18,
  body: 10,
  small: 9,
} as const;

const PAGE = {
  width: 841.89,
  height: 595.28,
  margin: 50,
  contentWidth: 741.89,
  newPageThreshold: 500,
} as const;

const SPACING = {
  afterTitle: 0.3,
  afterSubtitle: 0.2,
  afterDate: 0.8,
  afterSeparator: 1.2,
  afterSectionTitle: 0.4,
  afterTableHeader: 0.2,
  betweenRows: 0.4,
  betweenSections: 1.5,
  summaryItemGap: 0.6,
  rowHeight: 20,
} as const;

export const generateLogBookReport = (res: Response, data: ReportData): void => {
  const doc = new PDFDocument({ margin: PAGE.margin, size: 'A4', layout: 'landscape' });

  const timestamp = Date.now();
  const reportPeriod = data.reportType === 'month' && data.month
    ? `${data.month.replace(/\s+/g, '-')}` 
    : 'all-time';
  
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=logbook-report-${reportPeriod}-${timestamp}.pdf`
  );

  doc.pipe(res);

  renderHeader(doc, data);

  if (data.scope === 'guest-list') {
    renderGuestListSection(doc, data);
  } else {
    if (data.walkInLogs.length > 0) {
      renderWalkInSection(doc, data.walkInLogs);
    }

    if (data.regularBookings.length > 0) {
      renderRegularBookingsSection(doc, data.regularBookings);
    }

    if (data.eventBookings.length > 0) {
      renderEventBookingsSection(doc, data.eventBookings);
    }
  }

  doc.end();
};

function renderGuestListSection(doc: PDFKit.PDFDocument, data: ReportData): void {
  renderSectionTitle(doc, 'Guest List Report', true);

  const colWidths = [240, 150, 150, 200];
  const headers = ['Guest Name', 'Type', 'Date', 'Source'];
  
  renderTableHeader(doc, headers, colWidths);

  doc.fontSize(FONT_SIZES.body).font(FONTS.regular);

  let totalGuests = 0;

  // Process Regular Bookings Guests
  data.regularBookings.forEach(booking => {
    if (booking.guest_names) {
      try {
        const guests = JSON.parse(booking.guest_names);
        if (Array.isArray(guests)) {
          guests.forEach((guest: any) => {
            if (guest.name && guest.name.trim()) {
              renderGuestRow(doc, guest.name, guest.type || 'Adult', booking.check_in_date, 'Online Booking', colWidths);
              totalGuests++;
            }
          });
        }
      } catch (e) {
        // Ignore parsing errors
      }
    }
  });

  // Process Walk-in Guests
  data.walkInLogs.forEach(log => {
    if (log.guest_names) {
      try {
        // Try parsing as JSON first
        const guests = JSON.parse(log.guest_names);
        if (Array.isArray(guests)) {
          guests.forEach((guest: any) => {
            if (guest.name && guest.name.trim()) {
              renderGuestRow(doc, guest.name, guest.type || 'Adult', log.check_in_date, 'Walk-In', colWidths);
              totalGuests++;
            }
          });
        }
      } catch (e) {
        // If not JSON, might be comma-separated string or plain text
        const names = log.guest_names.split(',');
        names.forEach(name => {
          if (name.trim()) {
            renderGuestRow(doc, name.trim(), 'Walk-In Guest', log.check_in_date, 'Walk-In', colWidths);
            totalGuests++;
          }
        });
      }
    }
  });

  // Add total row
  doc.moveDown(SPACING.betweenRows);
  renderTotalRow(doc, colWidths, 'Total Guests:', totalGuests.toString());
}

function renderGuestRow(doc: PDFKit.PDFDocument, name: string, type: string, date: string, source: string, colWidths: number[]) {
  const rowData = [
    { text: name, color: COLORS.text, align: 'left' as const },
    { text: type.charAt(0).toUpperCase() + type.slice(1), color: COLORS.text, align: 'left' as const },
    { text: formatDate(date), color: COLORS.text, align: 'left' as const },
    { text: source, color: COLORS.text, align: 'left' as const },
  ];

  const rowHeight = getRowHeight(doc, rowData, colWidths);
  
  if (doc.y + rowHeight > PAGE.newPageThreshold) {
    doc.addPage();
    doc.y = PAGE.margin;
  }

  const rowY = doc.y;
  let xPos = PAGE.margin;

  rowData.forEach((data, i) => {
    drawTableCell(doc, xPos, rowY, colWidths[i], rowHeight, data.text, data.align, data.color);
    xPos += colWidths[i];
  });

  doc.fillColor(COLORS.text);
  doc.y = rowY + rowHeight;
}

function renderHeader(doc: PDFKit.PDFDocument, data: ReportData): void {
  doc
    .fontSize(FONT_SIZES.title)
    .font(FONTS.bold)
    .fillColor(COLORS.primary)
    .text('Elimar Spring Garden', { align: 'center' });
  
  doc.moveDown(SPACING.afterTitle);
  
  doc
    .fontSize(FONT_SIZES.body)
    .font(FONTS.regular)
    .fillColor(COLORS.textMuted)
    .text('Log Book Report', { align: 'center' });
  
  doc.moveDown(SPACING.afterSubtitle);

  if (data.reportType === 'month' && data.month) {
    doc
      .fontSize(FONT_SIZES.body)
      .fillColor(COLORS.textLight)
      .text(`Period: ${data.month}`, { align: 'center' });
    doc.moveDown(SPACING.afterSubtitle);
  } else if (data.reportType === 'all-time') {
    doc
      .fontSize(FONT_SIZES.body)
      .fillColor(COLORS.textLight)
      .text('Period: All Time', { align: 'center' });
    doc.moveDown(SPACING.afterSubtitle);
  }

  const generatedDate = new Date().toLocaleString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  doc
    .fontSize(FONT_SIZES.small)
    .font(FONTS.regular)
    .fillColor(COLORS.textLight)
    .text(`Generated: ${generatedDate}`, { align: 'center' });
  
  doc.moveDown(SPACING.afterDate);
  
  doc
    .moveTo(PAGE.margin, doc.y)
    .lineTo(doc.page.width - PAGE.margin, doc.y)
    .strokeColor(COLORS.border)
    .lineWidth(1.5)
    .stroke();
  
  doc.moveDown(SPACING.afterSeparator);
}

function renderWalkInSection(doc: PDFKit.PDFDocument, walkInLogs: WalkInLog[]): void {
  renderSectionTitle(doc, 'Walk-In Guests', true);

  const colWidths = [140, 120, 90, 90, 200, 100];
  const headers = ['Client Name', 'Accommodation', 'Check-In', 'Check-Out', 'Accompanying Guests', 'Amount'];
  
  renderTableHeader(doc, headers, colWidths);

  doc.fontSize(FONT_SIZES.body).font(FONTS.regular);
  
  walkInLogs.forEach((log, index) => {
    const rowData = [
      { text: log.client_name || 'N/A', color: COLORS.text, align: 'left' as const },
      { text: log.accommodation_name || 'N/A', color: COLORS.text, align: 'left' as const },
      { text: formatDate(log.check_in_date), color: COLORS.text, align: 'left' as const },
      { text: log.checked_out_at ? formatDate(log.checked_out_at) : '-', color: COLORS.text, align: 'left' as const },
      { text: formatGuestNames(log.guest_names), color: COLORS.text, align: 'left' as const },
      { text: formatCurrency(log.amount_paid), color: COLORS.success, align: 'right' as const },
    ];

    const rowHeight = getRowHeight(doc, rowData, colWidths);

    if (doc.y + rowHeight > PAGE.newPageThreshold) {
      doc.addPage();
      doc.y = PAGE.margin;
    }

    const rowY = doc.y;
    let xPos = PAGE.margin;

    // Draw cells for this row
    rowData.forEach((data, i) => {
      drawTableCell(doc, xPos, rowY, colWidths[i], rowHeight, data.text, data.align, data.color);
      xPos += colWidths[i];
    });

    doc.fillColor(COLORS.text);
    doc.y = rowY + rowHeight;
  });

  // Add total row
  doc.moveDown(SPACING.betweenRows);
  const totalWalkIn = calculateTotal(walkInLogs, 'amount_paid');
  renderTotalRow(doc, colWidths, 'Total Walk-In Revenue:', formatCurrency(totalWalkIn));

  doc.moveDown(SPACING.betweenSections);
}

function renderRegularBookingsSection(doc: PDFKit.PDFDocument, bookings: Booking[]): void {
  checkSectionPageBreak(doc);
  renderSectionTitle(doc, 'Regular Bookings', true);

  const colWidths = [150, 140, 100, 240, 110];
  const headers = ['Client Name', 'Accommodation', 'Booking Date', 'Accompanying Guests', 'Amount'];
  
  renderTableHeader(doc, headers, colWidths);

  doc.fontSize(FONT_SIZES.body).font(FONTS.regular);
  
  bookings.forEach((booking, index) => {
    const rowData = [
      { text: booking.user_name || booking.user_email || 'Unknown', color: COLORS.text, align: 'left' as const },
      { text: booking.accommodation_name || `Booking #${booking.id}`, color: COLORS.text, align: 'left' as const },
      { text: formatDate(booking.check_in_date), color: COLORS.text, align: 'left' as const },
      { text: formatGuestNames(booking.guest_names), color: COLORS.text, align: 'left' as const },
      { text: formatCurrency(booking.total_price), color: COLORS.success, align: 'right' as const },
    ];

    const rowHeight = getRowHeight(doc, rowData, colWidths);

    if (doc.y + rowHeight > PAGE.newPageThreshold) {
      doc.addPage();
      doc.y = PAGE.margin;
    }

    const rowY = doc.y;
    let xPos = PAGE.margin;

    // Draw cells for this row
    rowData.forEach((data, i) => {
      drawTableCell(doc, xPos, rowY, colWidths[i], rowHeight, data.text, data.align, data.color);
      xPos += colWidths[i];
    });

    doc.fillColor(COLORS.text);
    doc.y = rowY + rowHeight;
  });

  // Add total row
  doc.moveDown(SPACING.betweenRows);
  const totalRegular = calculateTotal(bookings, 'total_price');
  renderTotalRow(doc, colWidths, 'Total Regular Bookings Revenue:', formatCurrency(totalRegular));

  doc.moveDown(SPACING.betweenSections);
}

function renderEventBookingsSection(doc: PDFKit.PDFDocument, bookings: EventBooking[]): void {
  checkSectionPageBreak(doc);
  renderSectionTitle(doc, 'Event Bookings', true);

  const colWidths = [240, 170, 170, 160];
  const headers = ['Client Name', 'Event Type', 'Date', 'Amount'];
  
  renderTableHeader(doc, headers, colWidths);

  doc.fontSize(FONT_SIZES.body).font(FONTS.regular);
  
  bookings.forEach((booking, index) => {
    const eventType = booking.event_type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

    const rowData = [
      { text: booking.user_name || booking.user_email || 'Unknown', color: COLORS.text, align: 'left' as const },
      { text: eventType, color: COLORS.text, align: 'left' as const },
      { text: formatDate(booking.booking_date), color: COLORS.text, align: 'left' as const },
      { text: formatCurrency(booking.total_price), color: COLORS.success, align: 'right' as const },
    ];

    const rowHeight = getRowHeight(doc, rowData, colWidths);

    if (doc.y + rowHeight > PAGE.newPageThreshold) {
      doc.addPage();
      doc.y = PAGE.margin;
    }

    const rowY = doc.y;
    let xPos = PAGE.margin;

    // Draw cells for this row
    rowData.forEach((data, i) => {
      drawTableCell(doc, xPos, rowY, colWidths[i], rowHeight, data.text, data.align, data.color);
      xPos += colWidths[i];
    });

    doc.fillColor(COLORS.text);
    doc.y = rowY + rowHeight;
  });

  // Add total row
  doc.moveDown(SPACING.betweenRows);
  const totalEvent = calculateTotal(bookings, 'total_price');
  renderTotalRow(doc, colWidths, 'Total Event Bookings Revenue:', formatCurrency(totalEvent));

  doc.moveDown(SPACING.betweenSections);
}

function renderTotalRow(doc: PDFKit.PDFDocument, colWidths: number[], label: string, value: string): void {
  const totalWidth = colWidths.reduce((sum, width) => sum + width, 0);
  
  // Draw separator line before total
  doc
    .moveTo(PAGE.margin, doc.y)
    .lineTo(PAGE.margin + totalWidth, doc.y)
    .strokeColor(COLORS.primary)
    .lineWidth(2)
    .stroke();
  
  doc.moveDown(0.4);
  
  const rowY = doc.y;
  
  // Label on the left
  doc
    .fontSize(FONT_SIZES.body)
    .font(FONTS.bold)
    .fillColor(COLORS.textLight)
    .text(label, PAGE.margin, rowY, { width: totalWidth - colWidths[colWidths.length - 1], align: 'left' });
  
  // Total amount on the right
  doc
    .fillColor(COLORS.success)
    .text(value, PAGE.margin + totalWidth - colWidths[colWidths.length - 1], rowY, { 
      width: colWidths[colWidths.length - 1], 
      align: 'right' 
    });
  
  doc.fillColor(COLORS.text).font(FONTS.regular);
}

function renderSectionTitle(doc: PDFKit.PDFDocument, title: string, highlight: boolean = false): void {
  const startY = doc.y;
  
  if (highlight) {
    // Draw yellow highlight background
    doc.font(FONTS.bold).fontSize(FONT_SIZES.body);
    const textWidth = doc.widthOfString(title);
    doc
      .rect(PAGE.margin - 5, startY - 2, textWidth + 10, FONT_SIZES.body + 4)
      .fillColor('#88e788')
      .fill();
  }
  
  doc
    .fontSize(FONT_SIZES.body)
    .font(FONTS.bold)
    .fillColor(COLORS.primary)
    .text(title, PAGE.margin, startY);
  
  doc.fillColor(COLORS.text);
  doc.moveDown(SPACING.afterSectionTitle);
}

function renderTableHeader(doc: PDFKit.PDFDocument, headers: string[], colWidths: number[]): void {
  const tableTop = doc.y;
  let xPos = PAGE.margin;
  
  doc.fontSize(FONT_SIZES.body).font(FONTS.bold);
  
  // Draw header cells
  headers.forEach((header, i) => {
    const align = (header === 'Amount') ? 'right' : 'left';
    
    // Draw cell background
    doc
      .rect(xPos, tableTop, colWidths[i], SPACING.rowHeight)
      .fillAndStroke(COLORS.borderLight, COLORS.border);
    
    // Draw header text
    const padding = 5;
    doc
      .fillColor(COLORS.text)
      .text(header, xPos + padding, tableTop + (SPACING.rowHeight / 2) - (FONT_SIZES.body / 2), {
        width: colWidths[i] - (padding * 2),
        align: align,
        lineBreak: false,
      });
    
    xPos += colWidths[i];
  });

  doc.y = tableTop + SPACING.rowHeight;
}

function drawRowSeparator(doc: PDFKit.PDFDocument, colWidths: number[]): void {
  const totalWidth = colWidths.reduce((sum, width) => sum + width, 0);
  doc
    .moveTo(PAGE.margin, doc.y)
    .lineTo(PAGE.margin + totalWidth, doc.y)
    .strokeColor(COLORS.borderLight)
    .lineWidth(0.5)
    .stroke();
}

function drawTableCell(doc: PDFKit.PDFDocument, x: number, y: number, width: number, height: number, text: string, align: 'left' | 'right' = 'left', color: string = COLORS.text): void {
  // Draw cell border
  doc
    .rect(x, y, width, height)
    .strokeColor(COLORS.border)
    .lineWidth(0.5)
    .stroke();
  
  // Draw text inside cell with padding
  const padding = 5;
  doc
    .fontSize(FONT_SIZES.body)
    .fillColor(color)
    .text(text, x + padding, y + padding, {
      width: width - (padding * 2),
      align: align,
      lineBreak: true,
    });
}

function getRowHeight(doc: PDFKit.PDFDocument, rowData: any[], colWidths: number[]): number {
  let maxHeight = SPACING.rowHeight;
  const padding = 10; // 5 top + 5 bottom
  
  rowData.forEach((data, i) => {
    const textHeight = doc.heightOfString(data.text, {
      width: colWidths[i] - 10, // 5 left + 5 right padding
      align: data.align
    });
    if (textHeight + padding > maxHeight) {
      maxHeight = textHeight + padding;
    }
  });
  
  return maxHeight;
}

function checkPageBreak(doc: PDFKit.PDFDocument): void {
  if (doc.y > PAGE.newPageThreshold) {
    doc.addPage();
    doc.y = PAGE.margin;
  }
}

function checkSectionPageBreak(doc: PDFKit.PDFDocument): void {
  if (doc.y > 600) {
    doc.addPage();
  }
}

function formatCurrency(amount: number | undefined | null): string {
  // Ensure we're working with a valid number
  const numericAmount = Number(amount) || 0;
  
  // Format using toLocaleString with proper options
  return `P${numericAmount.toLocaleString('en-PH', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
}

function calculateTotal(items: any[], field: string): number {
  // Use proper numerical addition, not string concatenation
  return items.reduce((sum, item) => {
    const value = Number(item[field]) || 0;
    return sum + value;
  }, 0);
}

function formatGuestNames(guestNamesStr?: string | null): string {
  if (!guestNamesStr) return '-';
  
  try {
    const guests = JSON.parse(guestNamesStr);
    if (Array.isArray(guests)) {
      const names = guests
        .filter((g: any) => g.name && g.name.trim())
        .map((g: any) => g.name.trim());
      return names.length > 0 ? names.join(', ') : '-';
    }
  } catch (e) {
    return guestNamesStr;
  }
  return '-';
}