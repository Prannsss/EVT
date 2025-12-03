-- Add the add_price column after the price column
ALTER TABLE `accommodations` 
ADD COLUMN `add_price` decimal(10,2) DEFAULT NULL COMMENT 'Whole day/overnight price for rooms' 
AFTER `price`;