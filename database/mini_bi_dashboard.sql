-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Mar 30, 2026 at 03:12 PM
-- Server version: 8.0.44
-- PHP Version: 8.3.16

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `mini_bi_dashboard`
--

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int NOT NULL,
  `code` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `code`, `name`) VALUES
(1, 'SW', 'Phần mềm'),
(2, 'HW', 'Thiết bị'),
(3, 'SVC', 'Dịch vụ'),
(4, 'TRN', 'Đào tạo'),
(5, 'CNT', 'Tư vấn'),
(6, 'MNT', 'Bảo trì');

-- --------------------------------------------------------

--
-- Table structure for table `dashboard_settings`
--

CREATE TABLE `dashboard_settings` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `layout_config` json NOT NULL,
  `theme` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'dark',
  `currency` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'VND'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

CREATE TABLE `departments` (
  `id` int NOT NULL,
  `code` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `departments`
--

INSERT INTO `departments` (`id`, `code`, `name`) VALUES
(1, 'SALES', 'Kinh doanh'),
(2, 'TECH', 'Kỹ thuật'),
(3, 'MKT', 'Marketing'),
(4, 'OPS', 'Vận hành');

-- --------------------------------------------------------

--
-- Table structure for table `kernel404_transactions`
--

CREATE TABLE `kernel404_transactions` (
  `id` int NOT NULL,
  `order_date` date NOT NULL,
  `revenue` decimal(15,2) NOT NULL,
  `cost` decimal(15,2) NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `region_id` int NOT NULL,
  `province_id` int NOT NULL,
  `category_id` int NOT NULL,
  `department_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `kernel404_transactions`
--

INSERT INTO `kernel404_transactions` (`id`, `order_date`, `revenue`, `cost`, `quantity`, `region_id`, `province_id`, `category_id`, `department_id`) VALUES
(101, '2025-03-02', 482240898.64, 270054903.24, 7, 1, 12, 1, 4),
(102, '2024-05-13', 415261410.00, 253309460.10, 11, 1, 11, 6, 4),
(103, '2025-08-28', 416175376.26, 224734703.18, 9, 2, 28, 4, 4),
(104, '2025-02-25', 419444644.99, 151000072.20, 7, 1, 1, 5, 3),
(105, '2024-02-14', 30188571.20, 12377314.19, 19, 2, 24, 3, 4),
(106, '2025-12-02', 437150825.17, 279776528.11, 8, 1, 12, 3, 2),
(107, '2024-03-30', 484746223.54, 208440876.12, 20, 2, 24, 3, 3),
(108, '2025-07-29', 187406794.65, 78710853.75, 4, 1, 10, 2, 1),
(109, '2024-02-14', 459681004.57, 248227742.47, 17, 2, 30, 1, 1),
(110, '2025-11-14', 115156145.19, 46062458.08, 4, 1, 7, 2, 1),
(111, '2024-07-08', 388766951.56, 198271145.30, 19, 3, 14, 1, 1),
(112, '2025-06-21', 160410942.12, 70580814.53, 5, 3, 19, 1, 3),
(113, '2024-06-08', 6672835.57, 3069504.36, 20, 1, 3, 2, 1),
(114, '2025-08-17', 450096890.38, 162034880.54, 18, 3, 23, 4, 3),
(115, '2025-11-06', 441090856.26, 172025433.94, 19, 2, 31, 6, 2),
(116, '2025-11-28', 476348868.78, 290572809.96, 2, 3, 22, 6, 4),
(117, '2024-03-02', 360683215.38, 173127943.38, 20, 2, 24, 3, 2),
(118, '2024-03-03', 288425078.26, 144212539.13, 13, 1, 2, 5, 3),
(119, '2024-08-20', 416186477.00, 174798320.34, 7, 3, 19, 6, 4),
(120, '2024-02-04', 221250736.14, 117262890.15, 12, 1, 8, 2, 4),
(121, '2024-08-14', 82109053.43, 38591255.11, 8, 2, 25, 3, 4),
(122, '2024-12-18', 147444165.19, 85517615.81, 2, 3, 17, 1, 2),
(123, '2024-07-19', 178806118.93, 85826937.09, 3, 3, 13, 2, 2),
(124, '2024-04-10', 202141062.65, 109156173.83, 5, 1, 1, 1, 2),
(125, '2025-07-29', 416009735.49, 232965451.87, 20, 3, 17, 1, 2),
(126, '2024-03-08', 119035808.05, 44043248.98, 8, 3, 13, 1, 3),
(127, '2024-11-01', 144795661.11, 65158047.50, 7, 2, 32, 1, 4),
(128, '2025-03-13', 396062651.71, 201991952.37, 19, 1, 12, 1, 2),
(129, '2025-05-29', 244775994.31, 115044717.33, 15, 3, 17, 6, 1),
(130, '2024-07-27', 188720237.12, 120780951.76, 1, 2, 29, 3, 3),
(131, '2024-04-27', 289750899.87, 115900359.95, 1, 1, 3, 3, 4),
(132, '2024-02-05', 329323853.54, 210767266.27, 19, 3, 13, 3, 3),
(133, '2024-11-01', 130170054.87, 80705434.02, 6, 2, 32, 4, 4),
(134, '2024-12-17', 228448250.76, 98232747.83, 6, 2, 32, 6, 1),
(135, '2025-11-28', 191609800.87, 80476116.37, 20, 1, 9, 4, 4),
(136, '2024-01-31', 118390134.81, 72217982.23, 11, 3, 23, 1, 3),
(137, '2025-07-12', 445613872.02, 155964855.21, 15, 2, 27, 4, 4),
(138, '2025-04-01', 216641555.91, 93155869.04, 7, 2, 26, 5, 3),
(139, '2024-08-19', 75514398.08, 46063782.83, 7, 3, 14, 4, 3),
(140, '2024-07-23', 118009559.97, 71985831.58, 15, 1, 4, 5, 3),
(141, '2025-07-06', 250675397.30, 162939008.25, 12, 1, 6, 5, 3),
(142, '2025-02-25', 121563991.47, 66860195.31, 12, 2, 28, 4, 2),
(143, '2024-01-10', 260590268.43, 164171869.11, 11, 1, 10, 5, 1),
(144, '2024-04-26', 61711521.34, 37026912.80, 9, 2, 29, 4, 3),
(145, '2025-10-26', 323674687.79, 116522887.60, 12, 2, 31, 5, 3),
(146, '2025-06-10', 461631243.38, 249280871.43, 17, 3, 22, 4, 3),
(147, '2024-07-13', 405235902.47, 226932105.38, 19, 1, 6, 6, 4),
(148, '2024-05-24', 483224877.41, 304431672.77, 6, 3, 14, 1, 3),
(149, '2024-11-15', 250132672.30, 130068989.60, 15, 3, 23, 6, 1),
(150, '2025-04-08', 100717773.17, 58416308.44, 17, 1, 3, 4, 1),
(151, '2024-04-13', 411971607.31, 230704100.09, 1, 2, 28, 3, 1),
(152, '2025-02-18', 492670546.32, 211848334.92, 5, 3, 17, 6, 1),
(153, '2025-10-20', 271713145.24, 111402389.55, 14, 2, 26, 4, 1),
(154, '2025-01-07', 41428963.07, 26514536.36, 8, 2, 27, 2, 2),
(155, '2025-09-23', 457847840.19, 206031528.09, 4, 2, 34, 6, 3),
(156, '2024-12-06', 139737364.71, 57292319.53, 3, 3, 20, 4, 3),
(157, '2024-02-28', 49739250.92, 27356588.01, 7, 3, 18, 5, 2),
(158, '2025-10-19', 254316953.79, 96640442.44, 5, 3, 18, 2, 4),
(159, '2024-12-17', 147657135.48, 62015996.90, 1, 1, 5, 4, 4),
(160, '2024-11-10', 452412366.57, 208109688.62, 8, 1, 6, 3, 4),
(161, '2024-10-30', 409762218.04, 172100131.58, 4, 2, 26, 3, 2),
(162, '2024-09-14', 397194314.61, 154905782.70, 18, 1, 4, 6, 3),
(163, '2025-03-08', 78323543.13, 42294713.29, 7, 1, 12, 4, 2),
(164, '2025-01-26', 259310822.35, 93351896.05, 14, 1, 11, 4, 4),
(165, '2025-03-09', 72917858.93, 43750715.36, 8, 1, 7, 3, 1),
(166, '2025-11-24', 187854337.98, 86412995.47, 16, 1, 6, 3, 2),
(167, '2025-08-29', 347199344.54, 159711698.49, 10, 3, 20, 3, 1),
(168, '2025-01-09', 98160255.54, 52024935.44, 7, 3, 22, 6, 3),
(169, '2025-07-27', 235090025.64, 124597713.59, 18, 1, 2, 2, 3),
(170, '2025-01-10', 263356428.40, 105342571.36, 17, 2, 32, 5, 2),
(171, '2025-02-26', 152673315.72, 88550523.12, 11, 1, 9, 5, 1),
(172, '2025-01-29', 96907012.45, 34886524.48, 8, 1, 8, 6, 1),
(173, '2025-06-04', 435292967.52, 261175780.51, 15, 2, 30, 6, 2),
(174, '2025-08-09', 12132412.69, 7522095.87, 12, 1, 6, 2, 4),
(175, '2024-03-18', 84128098.49, 51318140.08, 19, 1, 1, 1, 4),
(176, '2024-09-27', 35421684.34, 20544576.92, 18, 1, 11, 3, 4),
(177, '2024-06-11', 215462210.57, 140050436.87, 4, 2, 27, 1, 1),
(178, '2025-01-26', 142545182.04, 57018072.82, 16, 3, 17, 6, 1),
(179, '2025-10-29', 46819071.61, 19664010.08, 16, 2, 25, 5, 1),
(180, '2025-04-30', 304458817.80, 191809055.21, 9, 2, 30, 4, 3),
(181, '2025-09-27', 484433820.52, 271282939.49, 2, 1, 2, 1, 1),
(182, '2025-03-26', 9928586.59, 3971434.64, 1, 1, 9, 6, 4),
(183, '2024-11-29', 247962851.23, 156216596.27, 7, 2, 32, 3, 1),
(184, '2025-02-10', 264276782.53, 95139641.71, 7, 3, 19, 5, 2),
(185, '2025-12-06', 21292738.27, 10859296.52, 9, 1, 12, 5, 1),
(186, '2024-09-27', 42006051.81, 19322783.83, 19, 3, 18, 6, 1),
(187, '2024-04-26', 458192020.77, 229096010.38, 4, 1, 8, 6, 2),
(188, '2025-06-04', 296335051.13, 160020927.61, 15, 3, 18, 6, 4),
(189, '2025-12-19', 67905202.17, 38705965.24, 18, 3, 13, 6, 2),
(190, '2025-11-01', 102005761.92, 38762189.53, 20, 2, 26, 6, 1),
(191, '2024-05-31', 94260530.59, 50900686.52, 19, 3, 19, 1, 4),
(192, '2025-03-21', 425262963.07, 255157777.84, 4, 1, 7, 2, 2),
(193, '2024-05-29', 80823857.12, 37987212.85, 4, 1, 10, 4, 2),
(194, '2024-08-05', 136447137.56, 61401211.90, 11, 3, 21, 6, 2),
(195, '2025-06-04', 106072072.73, 56218198.55, 7, 2, 26, 5, 3),
(196, '2025-12-15', 163018032.93, 105961721.40, 5, 1, 2, 1, 1),
(197, '2024-04-29', 46524756.03, 17214159.73, 14, 2, 29, 5, 1),
(198, '2025-06-07', 93901106.35, 42255497.86, 10, 2, 27, 3, 3),
(199, '2025-06-26', 370582373.45, 196408657.93, 18, 2, 33, 6, 4),
(200, '2025-09-07', 461268347.87, 202958073.06, 2, 2, 32, 6, 4);

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `body` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'INFO',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `provinces`
--

CREATE TABLE `provinces` (
  `id` int NOT NULL,
  `code` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `region_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `provinces`
--

INSERT INTO `provinces` (`id`, `code`, `name`, `region_id`) VALUES
(1, 'HN', 'Hà Nội', 1),
(2, 'HP', 'Hải Phòng', 1),
(3, 'QNINH', 'Quảng Ninh', 1),
(4, 'LCI', 'Lào Cai', 1),
(5, 'HG', 'Hà Giang', 1),
(6, 'CB', 'Cao Bằng', 1),
(7, 'TNG', 'Thái Nguyên', 1),
(8, 'SLA', 'Sơn La', 1),
(9, 'PT', 'Phú Thọ', 1),
(10, 'TB', 'Thái Bình', 1),
(11, 'HNM', 'Hà Nam', 1),
(12, 'TH', 'Thanh Hóa', 1),
(13, 'NAN', 'Nghệ An', 3),
(14, 'QBINH', 'Quảng Bình', 3),
(15, 'HUE', 'Huế', 3),
(16, 'DN', 'Đà Nẵng', 3),
(17, 'QNGAI', 'Quảng Ngãi', 3),
(18, 'PYEN', 'Phú Yên', 3),
(19, 'NTH', 'Ninh Thuận', 3),
(20, 'GL', 'Gia Lai', 3),
(21, 'DLK', 'Đắk Lắk', 3),
(22, 'LDG', 'Lâm Đồng', 3),
(23, 'BTHUAN', 'Bình Thuận', 3),
(24, 'HCM', 'TP. Hồ Chí Minh', 2),
(25, 'DNAI', 'Đồng Nai', 2),
(26, 'BPHUOC', 'Bình Phước', 2),
(27, 'LAN', 'Long An', 2),
(28, 'TGIANG', 'Tiền Giang', 2),
(29, 'DTHAP', 'Đồng Tháp', 2),
(30, 'BTE', 'Bến Tre', 2),
(31, 'VLG', 'Vĩnh Long', 2),
(32, 'CTHO', 'Cần Thơ', 2),
(33, 'KGG', 'Kiên Giang', 2),
(34, 'BRVT', 'Bà Rịa – Vũng Tàu', 2);

-- --------------------------------------------------------

--
-- Table structure for table `regions`
--

CREATE TABLE `regions` (
  `id` int NOT NULL,
  `code` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `regions`
--

INSERT INTO `regions` (`id`, `code`, `name`) VALUES
(1, 'NORTH', 'Miền Bắc'),
(2, 'SOUTH', 'Miền Nam'),
(3, 'CENTRAL', 'Miền Trung');

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` int NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `name`) VALUES
(3, 'ADMIN'),
(4, 'DIRECTOR'),
(1, 'EMPLOYEE'),
(2, 'MANAGER');

-- --------------------------------------------------------

--
-- Table structure for table `targets`
--

CREATE TABLE `targets` (
  `id` int NOT NULL,
  `year` int NOT NULL,
  `month` int NOT NULL,
  `region_id` int DEFAULT NULL,
  `revenue` decimal(15,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `targets`
--

INSERT INTO `targets` (`id`, `year`, `month`, `region_id`, `revenue`) VALUES
(1, 2024, 1, 1, 1373963167.21),
(2, 2024, 1, 3, 1727158076.24),
(3, 2024, 1, 2, 1869828084.58);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `username` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `full_name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar_url` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role_id` int NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password_hash`, `email`, `full_name`, `avatar_url`, `role_id`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'admin', '$2a$10$72mEFke0z10HXUOTwzSFb.tToTDpPLG3L8CrYjnrz7WYlFQ8ag.ca', 'admin@kernel404.vn', 'Quản Trị Viên', NULL, 3, 1, '2026-03-30 13:40:46.344', '2026-03-30 13:40:46.344'),
(2, 'giamdoc', '$2a$10$BuWQCYT2948jvkD.i6blNu4oflbDDHf3LURFV.RgHHwG2leU5tXkC', 'director@kernel404.vn', 'Nguyễn Văn A', NULL, 4, 1, '2026-03-30 13:40:46.427', '2026-03-30 13:40:46.427'),
(3, 'truongphong_bac', '$2a$10$AV2QhJZswNvWcXAl1eEPW.z.wrasENoSHb9q69kuXE2dc8KlVNQ2i', 'north.manager@kernel404.vn', 'Trần Thị B', NULL, 2, 1, '2026-03-30 13:40:46.510', '2026-03-30 13:40:46.510'),
(4, 'truongphong_nam', '$2a$10$pCJ9XSBxRCYKBipsk87D7uqH/mi2oZdC4dkp.Usl9elXbKYoJnRNe', 'south.manager@kernel404.vn', 'Lê Văn C', NULL, 2, 1, '2026-03-30 13:40:46.591', '2026-03-30 13:40:46.591');

-- --------------------------------------------------------

--
-- Table structure for table `user_region_access`
--

CREATE TABLE `user_region_access` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `region_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_region_access`
--

INSERT INTO `user_region_access` (`id`, `user_id`, `region_id`) VALUES
(1, 3, 1),
(2, 4, 2);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `categories_code_key` (`code`);

--
-- Indexes for table `dashboard_settings`
--
ALTER TABLE `dashboard_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `dashboard_settings_user_id_key` (`user_id`);

--
-- Indexes for table `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `departments_code_key` (`code`);

--
-- Indexes for table `kernel404_transactions`
--
ALTER TABLE `kernel404_transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `kernel404_transactions_order_date_idx` (`order_date`),
  ADD KEY `kernel404_transactions_region_id_idx` (`region_id`),
  ADD KEY `kernel404_transactions_category_id_idx` (`category_id`),
  ADD KEY `kernel404_transactions_province_id_idx` (`province_id`),
  ADD KEY `kernel404_transactions_department_id_fkey` (`department_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `notifications_user_id_fkey` (`user_id`);

--
-- Indexes for table `provinces`
--
ALTER TABLE `provinces`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `provinces_code_key` (`code`),
  ADD KEY `provinces_region_id_fkey` (`region_id`);

--
-- Indexes for table `regions`
--
ALTER TABLE `regions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `regions_code_key` (`code`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `roles_name_key` (`name`);

--
-- Indexes for table `targets`
--
ALTER TABLE `targets`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `targets_year_month_region_id_key` (`year`,`month`,`region_id`),
  ADD KEY `targets_region_id_fkey` (`region_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_username_key` (`username`),
  ADD UNIQUE KEY `users_email_key` (`email`),
  ADD KEY `users_role_id_fkey` (`role_id`);

--
-- Indexes for table `user_region_access`
--
ALTER TABLE `user_region_access`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_region_access_user_id_region_id_key` (`user_id`,`region_id`),
  ADD KEY `user_region_access_region_id_fkey` (`region_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `dashboard_settings`
--
ALTER TABLE `dashboard_settings`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `departments`
--
ALTER TABLE `departments`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `kernel404_transactions`
--
ALTER TABLE `kernel404_transactions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=201;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `provinces`
--
ALTER TABLE `provinces`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- AUTO_INCREMENT for table `regions`
--
ALTER TABLE `regions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `targets`
--
ALTER TABLE `targets`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `user_region_access`
--
ALTER TABLE `user_region_access`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `dashboard_settings`
--
ALTER TABLE `dashboard_settings`
  ADD CONSTRAINT `dashboard_settings_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `kernel404_transactions`
--
ALTER TABLE `kernel404_transactions`
  ADD CONSTRAINT `kernel404_transactions_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `kernel404_transactions_department_id_fkey` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `kernel404_transactions_province_id_fkey` FOREIGN KEY (`province_id`) REFERENCES `provinces` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `kernel404_transactions_region_id_fkey` FOREIGN KEY (`region_id`) REFERENCES `regions` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `provinces`
--
ALTER TABLE `provinces`
  ADD CONSTRAINT `provinces_region_id_fkey` FOREIGN KEY (`region_id`) REFERENCES `regions` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `targets`
--
ALTER TABLE `targets`
  ADD CONSTRAINT `targets_region_id_fkey` FOREIGN KEY (`region_id`) REFERENCES `regions` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `user_region_access`
--
ALTER TABLE `user_region_access`
  ADD CONSTRAINT `user_region_access_region_id_fkey` FOREIGN KEY (`region_id`) REFERENCES `regions` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `user_region_access_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
