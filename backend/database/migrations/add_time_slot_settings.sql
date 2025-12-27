-- Migration: Add time_slot_settings table
-- Stores configurable time ranges for each booking slot type
-- Date: 2025
-- 
-- This table allows admins to configure:
-- - Morning slot times (default: 9:00 AM - 5:00 PM)
-- - Night slot times for cottages (default: 5:30 PM - 10:00 PM)
-- - Night slot times for rooms (default: 5:30 PM - 8:00 AM overnight)
-- - Whole day slot times (default: 9:00 AM - 8:00 AM overnight, rooms only)

CREATE TABLE `time_slot_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `slot_type` ENUM('morning', 'night', 'whole_day') NOT NULL,
  `accommodation_type` ENUM('cottage', 'room', 'all') NOT NULL DEFAULT 'all' COMMENT 'Which accommodation type this setting applies to',
  `start_time` TIME NOT NULL COMMENT 'Start time for this slot',
  `end_time` TIME NOT NULL COMMENT 'End time for this slot',
  `is_overnight` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Whether end_time is on the next day',
  `is_enabled` TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Whether this time slot is available for booking',
  `label` VARCHAR(100) DEFAULT NULL COMMENT 'Display label for this time slot',
  `description` TEXT DEFAULT NULL COMMENT 'Additional description or notes',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_slot_accommodation` (`slot_type`, `accommodation_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Insert default time slot settings
-- Morning slot (same for both cottages and rooms)
INSERT INTO `time_slot_settings` (`slot_type`, `accommodation_type`, `start_time`, `end_time`, `is_overnight`, `is_enabled`, `label`, `description`) VALUES
('morning', 'all', '09:00:00', '17:00:00', 0, 1, 'Morning', 'Day-time booking from 9:00 AM to 5:00 PM');

-- Night slot for cottages (same day, ends at 10 PM)
INSERT INTO `time_slot_settings` (`slot_type`, `accommodation_type`, `start_time`, `end_time`, `is_overnight`, `is_enabled`, `label`, `description`) VALUES
('night', 'cottage', '17:30:00', '22:00:00', 0, 1, 'Night (Cottage)', 'Evening booking from 5:30 PM to 10:00 PM same day');

-- Night slot for rooms (overnight, ends at 8 AM next day)
INSERT INTO `time_slot_settings` (`slot_type`, `accommodation_type`, `start_time`, `end_time`, `is_overnight`, `is_enabled`, `label`, `description`) VALUES
('night', 'room', '17:30:00', '08:00:00', 1, 1, 'Night (Room)', 'Overnight booking from 5:30 PM to 8:00 AM next day');

-- Whole day slot (rooms only, overnight)
INSERT INTO `time_slot_settings` (`slot_type`, `accommodation_type`, `start_time`, `end_time`, `is_overnight`, `is_enabled`, `label`, `description`) VALUES
('whole_day', 'room', '09:00:00', '08:00:00', 1, 1, 'Whole Day', '24-hour booking from 9:00 AM to 8:00 AM next day (rooms only)');

-- Add index for faster queries
ALTER TABLE `time_slot_settings` ADD INDEX `idx_slot_type` (`slot_type`);
ALTER TABLE `time_slot_settings` ADD INDEX `idx_accommodation_type` (`accommodation_type`);
ALTER TABLE `time_slot_settings` ADD INDEX `idx_is_enabled` (`is_enabled`);
