# Time Slot Settings Database Migration

## Overview
This migration adds dynamic time slot configuration to the system, allowing administrators to configure booking time ranges from the admin panel instead of having hardcoded values.

## What Changed

### 1. Database
- **New Table**: `time_slot_settings`
  - Stores configurable time ranges for Morning, Night (Cottage), Night (Room), and Whole Day slots
  - Includes `start_time`, `end_time`, `is_overnight`, and `is_enabled` flags

### 2. Backend (API)
- **New Model**: `backend/src/models/time-settings.model.ts`
- **New Controller**: `backend/src/controllers/time-settings.controller.ts`
- **New Routes**: `backend/src/routes/time-settings.routes.ts`
- **Endpoints**:
  - `GET /api/time-settings` - Fetch all time settings (public)
  - `PUT /api/time-settings` - Update all time settings (admin only)

### 3. Frontend
- **New Context**: `src/contexts/TimeSlotContext.tsx` - Provides time settings throughout the app
- **Updated Components**:
  - `src/app/layout.tsx` - Added TimeSlotProvider wrapper
  - `src/components/BookingModal.tsx` - Fetches times from database
  - `src/app/admin/walk-in/page.tsx` - Fetches times from database
  - `src/app/admin/accommodations/page.tsx` - Admin interface to configure times

## Migration Steps

### 1. Run the SQL Migration
Execute the migration file in your MySQL database:

\`\`\`bash
mysql -u your_username -p elimardb < backend/database/migrations/add_time_slot_settings.sql
\`\`\`

Or manually run the SQL from:
\`backend/database/migrations/add_time_slot_settings.sql\`

### 2. Restart Backend Server
\`\`\`bash
cd backend
npm run dev
\`\`\`

### 3. Restart Frontend
\`\`\`bash
npm run dev
\`\`\`

## Default Time Slot Settings

After migration, these are the default values:

| Slot Type | Accommodation Type | Start Time | End Time | Overnight |
|-----------|-------------------|------------|----------|-----------|
| Morning | All | 09:00 | 17:00 | No |
| Night | Cottage | 17:30 | 22:00 | No |
| Night | Room | 17:30 | 08:00 | Yes |
| Whole Day | Room | 09:00 | 08:00 | Yes |

## How to Configure Time Slots (Admin)

1. Login as admin
2. Navigate to **Admin → Accommodations**
3. Click **"Time Settings"** button (next to "Add Accommodation")
4. Adjust the time ranges using time pickers
5. Click **"Save Settings"**

The changes will be immediately reflected on:
- Client booking modal
- Admin walk-in logs
- All availability checks

## Technical Details

### Time Format
- **Database**: Stores as `TIME` type (HH:MM:SS)
- **API**: Returns as `HH:MM` (24-hour format)
- **Frontend**: Displays as `12:00 AM/PM` format

### Overnight Logic
- `is_overnight` flag indicates if `end_time` is on the next day
- Example: Night (Room) - 5:30 PM to 8:00 AM means 5:30 PM today → 8:00 AM tomorrow

### Cottage vs Room Differences
- **Cottages**: Morning and Night only (Night ends same day at 10:00 PM by default)
- **Rooms**: Morning, Night (overnight), and Whole Day (overnight)

## Backward Compatibility
- Old hardcoded values (9:00 AM - 5:00 PM, etc.) are replaced by database values
- If API fails, fallback to default values to prevent booking system failure

## Notes
- Event booking times (whole resort events) remain hardcoded as they follow different business rules
- Time slot availability is still controlled by the accommodation type (cottages cannot have whole_day)
- Database triggers prevent cottages from being assigned whole_day bookings
