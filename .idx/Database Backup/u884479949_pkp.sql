-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Jun 22, 2025 at 04:24 PM
-- Server version: 10.11.10-MariaDB
-- PHP Version: 7.2.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `u884479949_pkp`
--

-- --------------------------------------------------------

--
-- Table structure for table `ActivityLog`
--

CREATE TABLE `ActivityLog` (
  `id` varchar(191) NOT NULL,
  `user` varchar(191) NOT NULL,
  `action` varchar(191) NOT NULL,
  `details` text NOT NULL,
  `timestamp` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`payload`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `ActivityLog`
--

INSERT INTO `ActivityLog` (`id`, `user`, `action`, `details`, `timestamp`, `payload`) VALUES
('cmc7dhbv1000et0yhdmrrjv2e', 'Yudha Hafiz', 'CREATE_TANAH_GARAPAN', 'Created new entry for \'Alex\' in \'Blok A\'.', '2025-06-22 07:55:04.910', NULL),
('cmc7di0g4000gt0yhpw8b9i4g', 'Yudha Hafiz', 'CREATE_USER', 'Created new user \'sutozu\' with role \'user\'.', '2025-06-22 07:55:36.713', NULL),
('cmc7dx7wi000mt0yhz32gu9q1', 'Yudha Hafiz', 'CREATE_CERTIFICATE', 'Created certificate \'dasdar\' for new.', '2025-06-22 08:07:26.274', NULL),
('cmc7dxzj2000ot0yhhs9l6dli', 'Yudha Hafiz', 'CREATE_CERTIFICATE', 'Created certificate \'rfafas\' for tes.', '2025-06-22 08:08:02.078', NULL),
('cmc7e3kqq000rt0yhncqib955', 'Yudha Hafiz', 'CREATE_CERTIFICATE', 'Created certificate \'sertifikat009\' for tes.', '2025-06-22 08:12:22.850', NULL),
('cmc7ecamc000tt0yhoxpxftcj', 'Yudha Hafiz', 'CREATE_CERTIFICATE', 'Created certificate \'neww\' for tes.', '2025-06-22 08:19:09.636', NULL),
('cmc7foopg0001t0gttdmvf37x', 'Yudha Hafiz', 'CREATE_USER', 'Created new user \'manager\' with role \'manager\'.', '2025-06-22 08:56:47.380', NULL),
('cmc7jf1b30002t0gt0uxqapqq', 'Yudha Hafiz', 'UPDATE_CERTIFICATE', 'Updated certificate \'neww\'.', '2025-06-22 10:41:15.615', NULL),
('cmc7lslo40003t0gtmf89yaho', 'Yudha Hafiz', 'DELETE_CERTIFICATE', 'Deleted certificate \'neww\'.', '2025-06-22 11:47:47.764', NULL),
('cmc7lsqe00004t0gtifge3qvy', 'Yudha Hafiz', 'DELETE_CERTIFICATE', 'Deleted certificate \'sertifikat009\'.', '2025-06-22 11:47:53.881', NULL),
('cmc7lt4yp0005t0gtzjdc9ci1', 'Yudha Hafiz', 'DELETE_TANAH_GARAPAN', 'Deleted entry for \'Budi Salamanan\' in \'Blok A\'.', '2025-06-22 11:48:12.769', NULL),
('cmc7md3y50005t02kzhu9g563', 'Yudha Hafiz', 'CREATE_CERTIFICATE', 'Created certificate \'new sert\' for new.', '2025-06-22 12:03:44.574', NULL),
('cmc7mlaw00009t02kduixpaj4', 'Yudha Hafiz', 'CREATE_CERTIFICATE', 'Created certificate \'313aafafa\' for new.', '2025-06-22 12:10:06.817', NULL),
('cmc7mrf530001t00qcm3hwowo', 'Yudha Hafiz', 'CREATE_CERTIFICATE', 'Created certificate \'fdgfdh\' for dfgdfgfd.', '2025-06-22 12:14:52.263', NULL),
('cmc7mrkvs0002t00qu9c79zo8', 'Yudha Hafiz', 'DELETE_CERTIFICATE', 'Deleted certificate \'fdgfdh\'.', '2025-06-22 12:14:59.704', '{\"id\":\"cmc7mreui0000t00q9fdn3aou\",\"kode\":\"LPN01\",\"nama_pemegang\":[\"dfgdfgfd\"],\"surat_hak\":\"Hak Guna Usaha\",\"no_sertifikat\":\"fdgfdh\",\"lokasi_tanah\":\"gfhgfhfgh\",\"luas_m2\":4,\"tgl_terbit\":\"2025-06-11T17:00:00.000Z\",\"surat_ukur\":\"111\",\"nib\":\"12123213opo\",\"pendaftaran_pertama\":\"2025-06-16T17:00:00.000Z\",\"createdAt\":\"2025-06-22T12:14:51.883Z\",\"updatedAt\":\"2025-06-22T12:14:51.883Z\"}'),
('cmc7mrugp0004t00qpc7cvhao', 'Yudha Hafiz', 'RESTORE_DATA', 'Restored certificate \'fdgfdh\'.', '2025-06-22 12:15:12.121', NULL),
('cmc7msc9j0005t00qxwa8cjm0', 'Yudha Hafiz', 'DELETE_TANAH_GARAPAN', 'Deleted entry for \'Anton Mustafa\' in \'Blok A\'.', '2025-06-22 12:15:35.191', '{\"id\":\"cmc7d6rs1000bt0yhm3zdklgu\",\"letakTanah\":\"Blok A\",\"namaPemegangHak\":\"Anton Mustafa\",\"letterC\":\"CC11ew\",\"nomorSuratKeteranganGarapan\":\"SKG/012302903\",\"luas\":234423,\"keterangan\":\"tambahan\",\"createdAt\":\"2025-06-22T07:46:52.032Z\",\"updatedAt\":\"2025-06-22T07:46:52.032Z\"}'),
('cmc7msga90007t00qtur7zq66', 'Yudha Hafiz', 'RESTORE_DATA', 'Restored Tanah Garapan entry for \'Anton Mustafa\'.', '2025-06-22 12:15:40.402', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `Certificate`
--

CREATE TABLE `Certificate` (
  `id` varchar(191) NOT NULL,
  `kode` varchar(191) NOT NULL,
  `nama_pemegang` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`nama_pemegang`)),
  `surat_hak` varchar(191) NOT NULL,
  `no_sertifikat` varchar(191) NOT NULL,
  `lokasi_tanah` text NOT NULL,
  `luas_m2` int(11) NOT NULL,
  `tgl_terbit` datetime(3) NOT NULL,
  `surat_ukur` varchar(191) NOT NULL,
  `nib` varchar(191) NOT NULL,
  `pendaftaran_pertama` datetime(3) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `Certificate`
--

INSERT INTO `Certificate` (`id`, `kode`, `nama_pemegang`, `surat_hak`, `no_sertifikat`, `lokasi_tanah`, `luas_m2`, `tgl_terbit`, `surat_ukur`, `nib`, `pendaftaran_pertama`, `createdAt`, `updatedAt`) VALUES
('cmc6r018w0007t0yhpppi1ckz', 'LPN01', '[\"tesas\"]', 'Hak Guna Usaha', '313aafafasadad', 'asrqw', 213123, '2025-06-05 17:00:00.000', '111', '2142', '2025-06-17 17:00:00.000', '2025-06-21 21:25:46.176', '2025-06-21 21:25:46.176'),
('cmc7mru9n0003t00qhg3mum5j', 'LPN01', '[\"dfgdfgfd\"]', 'Hak Guna Usaha', 'fdgfdh', 'gfhgfhfgh', 4, '2025-06-11 17:00:00.000', '111', '12123213opo', '2025-06-16 17:00:00.000', '2025-06-22 12:15:11.867', '2025-06-22 12:15:11.867');

-- --------------------------------------------------------

--
-- Table structure for table `TanahGarapanEntry`
--

CREATE TABLE `TanahGarapanEntry` (
  `id` varchar(191) NOT NULL,
  `letakTanah` varchar(191) NOT NULL,
  `namaPemegangHak` varchar(191) NOT NULL,
  `letterC` varchar(191) NOT NULL,
  `nomorSuratKeteranganGarapan` varchar(191) NOT NULL,
  `luas` int(11) NOT NULL,
  `keterangan` text DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `TanahGarapanEntry`
--

INSERT INTO `TanahGarapanEntry` (`id`, `letakTanah`, `namaPemegangHak`, `letterC`, `nomorSuratKeteranganGarapan`, `luas`, `keterangan`, `createdAt`, `updatedAt`) VALUES
('cmc7dhbl3000dt0yhcvf5vomk', 'Blok A', 'Alex', 'CC113', 'SKG/555', 21312, '', '2025-06-22 07:55:04.311', '2025-06-22 07:55:04.311'),
('cmc7msfz30006t00qgoulg432', 'Blok A', 'Anton Mustafa', 'CC11ew', 'SKG/012302903', 234423, 'tambahan', '2025-06-22 12:15:39.999', '2025-06-22 12:15:39.999');

-- --------------------------------------------------------

--
-- Table structure for table `User`
--

CREATE TABLE `User` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `role` varchar(191) NOT NULL DEFAULT 'user',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `password` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `User`
--

INSERT INTO `User` (`id`, `name`, `email`, `role`, `createdAt`, `password`) VALUES
('cmc7d99v7000ct0yhsn4wewyn', 'Yudha Hafiz', 'yudhahafiz@gmail.com', 'admin', '2025-06-22 07:48:48.787', '$2a$10$lx2RrGLFr1tHkOgIdC3fT.jbPJIGgcJB3YRFX/SWbKFXIISXezKWq'),
('cmc7di04j000ft0yh02vf7q8j', 'sutozu', 'razzorite@gmail.com', 'user', '2025-06-22 07:55:36.355', '$2a$10$42VlnufKqnNLuxybisikzuH9bgXuJqRYM3TfbFdxJdehTYRpjBLTG'),
('cmc7fooek0000t0gtmxdygnn5', 'manager', 'manager@example.com', 'manager', '2025-06-22 08:56:46.988', '$2a$10$u71/TOFWdlkmydA/YG1gRuoiA9kFMUXFFXez9Wz9y5BtTechfLx9u');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `ActivityLog`
--
ALTER TABLE `ActivityLog`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `Certificate`
--
ALTER TABLE `Certificate`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Certificate_no_sertifikat_key` (`no_sertifikat`),
  ADD UNIQUE KEY `Certificate_nib_key` (`nib`);

--
-- Indexes for table `TanahGarapanEntry`
--
ALTER TABLE `TanahGarapanEntry`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `User`
--
ALTER TABLE `User`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `User_email_key` (`email`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
