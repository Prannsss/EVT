-- Migration: Add time slot availability flags to accommodations table
-- This allows admins to configure which time slots are available for each accommodation
-- Date: 2025

-- Add columns to indicate which time slots this accommodation supports
ALTER TABLE `accommodations`
ADD COLUMN `supports_morning` TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Whether this accommodation can be booked for morning slot',
ADD COLUMN `supports_night` TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Whether this accommodation can be booked for night slot',
ADD COLUMN `supports_whole_day` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Whether this accommodation can be booked for whole day slot (rooms only)';

-- Set whole_day support based on accommodation type
-- Only rooms can support whole_day by default
UPDATE `accommodations`
SET `supports_whole_day` = CASE
    WHEN `type` = 'room' THEN 1
    ELSE 0
END;

-- Add constraint to ensure cottages never support whole_day
ALTER TABLE `accommodations`
ADD CONSTRAINT `chk_cottage_no_whole_day` 
CHECK (NOT (`type` = 'cottage' AND `supports_whole_day` = 1));

-- Add index for filtering accommodations by supported time slots
ALTER TABLE `accommodations` ADD INDEX `idx_time_slot_support` (`supports_morning`, `supports_night`, `supports_whole_day`);
