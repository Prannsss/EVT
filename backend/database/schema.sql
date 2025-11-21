-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 21, 2025 at 09:34 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `elimardb`
--

-- --------------------------------------------------------

--
-- Table structure for table `accommodations`
--

CREATE TABLE `accommodations` (
  `id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `type` enum('room','cottage') NOT NULL,
  `capacity` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `inclusions` text DEFAULT NULL,
  `image_url` text DEFAULT NULL COMMENT 'JSON array of image paths or single image path',
  `panoramic_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `accommodations`
--

INSERT INTO `accommodations` (`id`, `name`, `type`, `capacity`, `description`, `price`, `inclusions`, `image_url`, `panoramic_url`, `created_at`, `updated_at`) VALUES
(1, 'Cottage 1', 'cottage', '5-10 persons', 'ahhhhhhh', 250.00, 'ahhhh\r\nahhhh\r\nahhhh', '[\"/uploads/1761988243101-781342796.png\",\"/uploads/1761988243162-139365502.png\"]', '/uploads/1761988243249-449213099.png', '2025-11-01 09:10:43', '2025-11-01 09:10:43');

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

CREATE TABLE `bookings` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `accommodation_id` int(11) NOT NULL,
  `check_in_date` date NOT NULL,
  `check_out_date` date DEFAULT NULL COMMENT 'Check-out date for overnight stays',
  `booking_time` time DEFAULT '09:00:00' COMMENT 'Client-selected booking time',
  `adults` int(11) DEFAULT 0,
  `kids` int(11) DEFAULT 0,
  `pwd` int(11) DEFAULT 0,
  `senior` int(11) DEFAULT 0 COMMENT 'Number of senior citizens',
  `adult_swimming` int(11) DEFAULT 0 COMMENT 'Number of adults with swimming',
  `kid_swimming` int(11) DEFAULT 0 COMMENT 'Number of kids with swimming',
  `pwd_swimming` int(11) DEFAULT 0 COMMENT 'Number of PWD with swimming',
  `senior_swimming` int(11) DEFAULT 0 COMMENT 'Number of seniors with swimming',
  `guest_names` text DEFAULT NULL COMMENT 'JSON array of guest names with types (adult, kid, pwd, senior)',
  `overnight_stay` tinyint(1) DEFAULT 0,
  `overnight_swimming` tinyint(1) DEFAULT 0,
  `total_price` decimal(10,2) NOT NULL,
  `status` enum('pending','approved','cancelled','completed') DEFAULT 'pending',
  `checked_out_at` timestamp NULL DEFAULT NULL COMMENT 'Timestamp when booking was checked out',
  `proof_of_payment_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `email_logs`
--

CREATE TABLE `email_logs` (
  `id` int(11) NOT NULL,
  `recipient` varchar(150) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `message` text DEFAULT NULL,
  `email_type` enum('verification','booking_confirmation','status_update','other') DEFAULT 'other',
  `status` enum('sent','failed') DEFAULT 'sent',
  `sent_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `email_verification_codes`
--

CREATE TABLE `email_verification_codes` (
  `id` int(11) NOT NULL,
  `email` varchar(150) NOT NULL,
  `code` varchar(6) NOT NULL,
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `event_bookings`
--

CREATE TABLE `event_bookings` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `event_type` enum('whole_day','evening','morning') NOT NULL,
  `booking_date` date NOT NULL,
  `event_details` text DEFAULT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `proof_of_payment_url` varchar(255) DEFAULT NULL,
  `status` enum('pending','confirmed','cancelled','rejected','approved','completed') DEFAULT 'pending',
  `checked_out_at` timestamp NULL DEFAULT NULL COMMENT 'Timestamp when event was checked out',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Stores event bookings that reserve the entire resort exclusively';

-- --------------------------------------------------------

--
-- Table structure for table `gallery`
--

CREATE TABLE `gallery` (
  `id` int(11) NOT NULL,
  `image_url` text NOT NULL COMMENT 'JSON array of image paths or single image path',
  `description` varchar(255) DEFAULT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `gallery`
--

INSERT INTO `gallery` (`id`, `image_url`, `description`, `uploaded_at`) VALUES
(1, '[\"/uploads/1762835472770-850242185.jpg\"]', NULL, '2025-11-11 04:31:12');

-- --------------------------------------------------------

--
-- Table structure for table `pricing_settings`
--

CREATE TABLE `pricing_settings` (
  `id` int(11) NOT NULL,
  `category` varchar(50) NOT NULL COMMENT 'entrance, swimming, event, night_swimming',
  `type` varchar(50) NOT NULL COMMENT 'adult, kids_senior_pwd, whole_day, evening, morning, per_head',
  `label` varchar(100) NOT NULL COMMENT 'Display name for the setting',
  `price` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pricing_settings`
--

INSERT INTO `pricing_settings` (`id`, `category`, `type`, `label`, `price`, `created_at`, `updated_at`) VALUES
(1, 'entrance', 'adult', 'Adult Entrance Fee', 70.00, '2025-11-01 09:56:59', '2025-11-01 09:56:59'),
(2, 'entrance', 'kids_senior_pwd', 'Kids/Senior/PWD Entrance Fee', 50.00, '2025-11-01 09:56:59', '2025-11-01 09:56:59'),
(3, 'swimming', 'adult', 'Adult Swimming Fee', 80.00, '2025-11-01 09:56:59', '2025-11-01 09:56:59'),
(4, 'swimming', 'kids_senior_pwd', 'Kids/Senior/PWD Swimming Fee', 50.00, '2025-11-01 09:56:59', '2025-11-01 09:56:59'),
(5, 'event', 'whole_day', 'Whole Day Event (9 AM - 5 PM)', 15000.00, '2025-11-01 09:56:59', '2025-11-01 09:56:59'),
(6, 'event', 'evening', 'Evening Event (5:30 PM - 10 PM)', 10000.00, '2025-11-01 09:56:59', '2025-11-01 09:56:59'),
(7, 'event', 'morning', 'Morning Event (9 AM - 5 PM)', 10000.00, '2025-11-01 09:56:59', '2025-11-01 09:56:59'),
(8, 'night_swimming', 'per_head', 'Night Swimming (per head)', 200.00, '2025-11-01 09:56:59', '2025-11-01 09:56:59');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `contact_number` varchar(20) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','user') DEFAULT 'user',
  `email_verified` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `contact_number`, `password`, `role`, `email_verified`, `created_at`, `updated_at`) VALUES
(1, 'Admin', 'admin@elimar.com', NULL, '$2b$10$cB9QlRH0SVQkaQAagSHjluwFdz1i2bWIEAxFFVOWc.FpAdtBzKJ42', 'admin', 1, '2025-11-01 08:12:43', '2025-11-01 08:12:43');

-- --------------------------------------------------------

--
-- Table structure for table `walk_in_logs`
--

CREATE TABLE `walk_in_logs` (
  `id` int(11) NOT NULL,
  `client_name` varchar(150) NOT NULL,
  `guest_names` text DEFAULT NULL,
  `address` text DEFAULT NULL,
  `accommodation_id` int(11) DEFAULT NULL,
  `check_in_date` date NOT NULL,
  `adults` int(11) DEFAULT 0,
  `kids` int(11) DEFAULT 0,
  `pwd` int(11) DEFAULT 0,
  `amount_paid` decimal(10,2) DEFAULT 0.00,
  `checked_out` tinyint(1) NOT NULL DEFAULT 0,
  `checked_out_at` timestamp NULL DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `accommodations`
--
ALTER TABLE `accommodations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `accommodation_id` (`accommodation_id`);

--
-- Indexes for table `email_logs`
--
ALTER TABLE `email_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_recipient` (`recipient`),
  ADD KEY `idx_email_type` (`email_type`),
  ADD KEY `idx_sent_at` (`sent_at`);

--
-- Indexes for table `email_verification_codes`
--
ALTER TABLE `email_verification_codes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_code` (`code`),
  ADD KEY `idx_expires` (`expires_at`);

--
-- Indexes for table `event_bookings`
--
ALTER TABLE `event_bookings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_event_booking` (`booking_date`,`event_type`),
  ADD KEY `idx_booking_date` (`booking_date`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_user_id` (`user_id`);

--
-- Indexes for table `gallery`
--
ALTER TABLE `gallery`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `pricing_settings`
--
ALTER TABLE `pricing_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_category_type` (`category`,`type`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `walk_in_logs`
--
ALTER TABLE `walk_in_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_check_in_date` (`check_in_date`),
  ADD KEY `accommodation_id` (`accommodation_id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_checked_out` (`checked_out`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `accommodations`
--
ALTER TABLE `accommodations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `bookings`
--
ALTER TABLE `bookings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `email_logs`
--
ALTER TABLE `email_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `email_verification_codes`
--
ALTER TABLE `email_verification_codes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `event_bookings`
--
ALTER TABLE `event_bookings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `gallery`
--
ALTER TABLE `gallery`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `pricing_settings`
--
ALTER TABLE `pricing_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `walk_in_logs`
--
ALTER TABLE `walk_in_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`accommodation_id`) REFERENCES `accommodations` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `event_bookings`
--
ALTER TABLE `event_bookings`
  ADD CONSTRAINT `event_bookings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `walk_in_logs`
--
ALTER TABLE `walk_in_logs`
  ADD CONSTRAINT `walk_in_logs_ibfk_1` FOREIGN KEY (`accommodation_id`) REFERENCES `accommodations` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `walk_in_logs_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
