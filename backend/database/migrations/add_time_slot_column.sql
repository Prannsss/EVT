-- Migration: Add time_slot column to bookings and walk_in_logs tables
-- This replaces the flexible booking_time with fixed time slots
-- Date: 2025
-- 
-- Time Slot System:
-- COTTAGE:
--   - morning: 9:00 AM - 5:00 PM
--   - night: 5:30 PM - 10:00 PM
--   - whole_day: NOT AVAILABLE (cottages are day-use only)
--   - Slots are INDEPENDENT (no blocking between morning and night)
-- 
-- ROOM:
--   - morning: 9:00 AM - 5:00 PM
--   - night: 5:30 PM - 8:00 AM (overnight)
--   - whole_day: 9:00 AM - 8:00 AM (overnight)
--   - Blocking rules apply (see availability service)

-- Add time_slot column to bookings table
ALTER TABLE `bookings` 
ADD COLUMN `time_slot` ENUM('morning', 'night', 'whole_day') NOT NULL DEFAULT 'morning' 
AFTER `check_out_date`;

-- Update existing bookings based on booking_time
-- Morning: 9:00 AM - 5:00 PM (09:00:00 - 16:59:59)
-- Night: 5:30 PM - 8:00 AM (17:30:00 - 08:59:59, wraps around midnight)
-- Times between 5:00 PM - 5:30 PM default to night
UPDATE `bookings` 
SET `time_slot` = CASE
    WHEN TIME(booking_time) >= '09:00:00' AND TIME(booking_time) < '17:00:00' THEN 'morning'
    ELSE 'night'
END
WHERE `booking_time` IS NOT NULL;

-- Update overnight_stay ROOMS to whole_day
-- IMPORTANT: Only rooms can have whole_day, not cottages
UPDATE `bookings` b
INNER JOIN `accommodations` a ON b.accommodation_id = a.id
SET b.`time_slot` = 'whole_day'
WHERE b.`overnight_stay` = 1 
  AND a.`type` = 'room';

-- Add time_slot column to walk_in_logs table
ALTER TABLE `walk_in_logs`
ADD COLUMN `time_slot` ENUM('morning', 'night', 'whole_day') NOT NULL DEFAULT 'morning'
AFTER `check_in_date`;

-- Note: Existing walk_in_logs default to 'morning' slot
-- Admin can update individual records as needed

-- Add index for faster time_slot queries
ALTER TABLE `bookings` ADD INDEX `idx_time_slot` (`time_slot`);
ALTER TABLE `walk_in_logs` ADD INDEX `idx_walk_in_time_slot` (`time_slot`);

-- Create trigger to enforce: whole_day can ONLY be used with rooms, NOT cottages
DELIMITER $$

CREATE TRIGGER `prevent_cottage_whole_day_insert`
BEFORE INSERT ON `bookings`
FOR EACH ROW
BEGIN
    IF NEW.time_slot = 'whole_day' THEN
        -- Check if accommodation is a cottage
        IF EXISTS (
            SELECT 1 FROM accommodations 
            WHERE id = NEW.accommodation_id AND type = 'cottage'
        ) THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Cottages cannot be booked for whole_day slot. Use morning or night only.';
        END IF;
    END IF;
END$$

CREATE TRIGGER `prevent_cottage_whole_day_update`
BEFORE UPDATE ON `bookings`
FOR EACH ROW
BEGIN
    IF NEW.time_slot = 'whole_day' THEN
        -- Check if accommodation is a cottage
        IF EXISTS (
            SELECT 1 FROM accommodations 
            WHERE id = NEW.accommodation_id AND type = 'cottage'
        ) THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Cottages cannot be booked for whole_day slot. Use morning or night only.';
        END IF;
    END IF;
END$$

CREATE TRIGGER `prevent_cottage_whole_day_walkin_insert`
BEFORE INSERT ON `walk_in_logs`
FOR EACH ROW
BEGIN
    IF NEW.time_slot = 'whole_day' THEN
        -- Check if accommodation is a cottage
        IF NEW.accommodation_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM accommodations 
            WHERE id = NEW.accommodation_id AND type = 'cottage'
        ) THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Cottages cannot be booked for whole_day slot. Use morning or night only.';
        END IF;
    END IF;
END$$

CREATE TRIGGER `prevent_cottage_whole_day_walkin_update`
BEFORE UPDATE ON `walk_in_logs`
FOR EACH ROW
BEGIN
    IF NEW.time_slot = 'whole_day' THEN
        -- Check if accommodation is a cottage
        IF NEW.accommodation_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM accommodations 
            WHERE id = NEW.accommodation_id AND type = 'cottage'
        ) THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Cottages cannot be booked for whole_day slot. Use morning or night only.';
        END IF;
    END IF;
END$$

DELIMITER ;

-- Note: The booking_time and overnight_stay columns are kept for backward compatibility
-- They can be removed in a future migration after confirming the new system works
