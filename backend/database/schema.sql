-- Resort Booking System Database Schema
-- Database: resort_db

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS elimardb;
USE elimardb;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    contact_number VARCHAR(20) COMMENT 'Philippine phone format: 09078845654 or +639078845654',
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Email Verification Codes Table
CREATE TABLE IF NOT EXISTS email_verification_codes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(150) NOT NULL,
    code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_code (code),
    INDEX idx_expires (expires_at)
);

-- Accommodations Table
CREATE TABLE IF NOT EXISTS accommodations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(150) NOT NULL,
    type ENUM('room', 'cottage') NOT NULL,
    capacity VARCHAR(50) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    inclusions TEXT,
    image_url TEXT COMMENT 'JSON array of image paths or single image path',
    panoramic_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    accommodation_id INT NOT NULL,
    check_in_date DATE NOT NULL,
    check_out_date DATE,
    adults INT DEFAULT 0,
    kids INT DEFAULT 0,
    pwd INT DEFAULT 0,
    overnight_stay BOOLEAN DEFAULT FALSE,
    overnight_swimming BOOLEAN DEFAULT FALSE,
    total_price DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'approved', 'cancelled') DEFAULT 'pending',
    proof_of_payment_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (accommodation_id) REFERENCES accommodations(id) ON DELETE CASCADE
);

-- Gallery Table
CREATE TABLE IF NOT EXISTS gallery (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255),
    image_url TEXT NOT NULL COMMENT 'JSON array of image paths or single image path',
    description TEXT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Email Logs Table
CREATE TABLE IF NOT EXISTS email_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    recipient VARCHAR(150) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT,
    email_type ENUM('verification', 'booking_confirmation', 'status_update', 'other') DEFAULT 'other',
    status ENUM('sent', 'failed') DEFAULT 'sent',
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_recipient (recipient),
    INDEX idx_email_type (email_type),
    INDEX idx_sent_at (sent_at)
);

-- Pricing Settings Table
CREATE TABLE IF NOT EXISTS pricing_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    category VARCHAR(50) NOT NULL COMMENT 'entrance, swimming, event, night_swimming',
    type VARCHAR(50) NOT NULL COMMENT 'adult, kids_senior_pwd, whole_day, evening, morning, per_head',
    label VARCHAR(100) NOT NULL COMMENT 'Display name for the setting',
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_category_type (category, type)
);

-- Event Bookings Table
-- Stores event bookings that reserve the entire resort exclusively
CREATE TABLE IF NOT EXISTS event_bookings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    event_type ENUM('whole_day', 'evening', 'morning') NOT NULL,
    booking_date DATE NOT NULL,
    event_details TEXT,
    total_price DECIMAL(10, 2) NOT NULL,
    proof_of_payment_url VARCHAR(255),
    status ENUM('pending', 'confirmed', 'cancelled', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_event_booking (booking_date, event_type),
    INDEX idx_booking_date (booking_date),
    INDEX idx_status (status),
    INDEX idx_user_id (user_id)
);

-- Insert default admin user
-- Password: Admin123 (hashed with bcrypt)
INSERT INTO users (name, email, password, role, email_verified) 
VALUES ('Admin', 'admin@elimar.com', '$2b$10$cB9QlRH0SVQkaQAagSHjluwFdz1i2bWIEAxFFVOWc.FpAdtBzKJ42', 'admin', TRUE)
ON DUPLICATE KEY UPDATE email=email;

-- Insert default pricing settings
INSERT INTO pricing_settings (category, type, label, price) VALUES
('entrance', 'adult', 'Adult Entrance Fee', 70.00),
('entrance', 'kids_senior_pwd', 'Kids/Senior/PWD Entrance Fee', 50.00),
('swimming', 'adult', 'Adult Swimming Fee', 80.00),
('swimming', 'kids_senior_pwd', 'Kids/Senior/PWD Swimming Fee', 50.00),
('event', 'whole_day', 'Whole Day Event (9 AM - 5 PM)', 15000.00),
('event', 'evening', 'Evening Event (5:30 PM - 10 PM)', 10000.00),
('event', 'morning', 'Morning Event (9 AM - 5 PM)', 10000.00),
('night_swimming', 'per_head', 'Night Swimming (per head)', 200.00)
ON DUPLICATE KEY UPDATE 
  label = VALUES(label),
  price = VALUES(price);
