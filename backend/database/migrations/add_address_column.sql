-- Migration: Add address column to bookings table
-- Created: January 6, 2026
-- Description: Adds an address column after guest_names to store client address information

ALTER TABLE `bookings` 
ADD COLUMN `address` VARCHAR(255) NULL DEFAULT NULL 
COMMENT 'Client address for record keeping' 
AFTER `guest_names`;
