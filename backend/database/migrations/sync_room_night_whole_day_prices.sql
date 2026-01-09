-- Update existing room accommodations to set add_price equal to price
-- This migration ensures that for room-type accommodations, the night and whole day prices are the same
-- Run this migration to sync existing data with the new pricing structure

UPDATE `accommodations`
SET `add_price` = `price`
WHERE `type` = 'room' AND (`add_price` IS NULL OR `add_price` = 0);

-- Optional: If you want to set add_price to price for all rooms regardless of current value
-- Uncomment the line below and comment out the one above
-- UPDATE `accommodations` SET `add_price` = `price` WHERE `type` = 'room';
