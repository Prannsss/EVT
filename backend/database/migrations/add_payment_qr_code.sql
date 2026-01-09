-- Add payment QR code storage table
CREATE TABLE `payment_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `qr_code_url` varchar(255) DEFAULT NULL COMMENT 'Path to QR code image',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Insert default record (will be updated with actual QR code)
INSERT INTO `payment_settings` (`qr_code_url`) VALUES (NULL);
