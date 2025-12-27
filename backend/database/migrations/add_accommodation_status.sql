-- Add status column to accommodations table
ALTER TABLE accommodations 
ADD COLUMN status ENUM('vacant', 'pending', 'booked(morning)', 'booked(night)', 'booked(whole_day)') 
DEFAULT 'vacant' 
AFTER type;

-- Set all existing accommodations to vacant by default
UPDATE accommodations SET status = 'vacant' WHERE status IS NULL;
