-- Migration: Fix rooms that are missing whole_day support
-- This migration ensures all room-type accommodations have supports_whole_day = 1
-- Run this migration to fix any rooms that were created before the fix
-- Date: 2026

-- Update existing room accommodations to support whole_day
UPDATE `accommodations`
SET `supports_whole_day` = 1
WHERE `type` = 'room' AND `supports_whole_day` = 0;

-- Verify the fix
SELECT id, name, type, supports_morning, supports_night, supports_whole_day
FROM `accommodations`
WHERE `type` = 'room';
