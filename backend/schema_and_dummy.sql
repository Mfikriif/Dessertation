-- ============================================================
--  DATABASE SCHEMA & DUMMY DATA
--  Sistem Dashboard Owner
--  Generated from Domain Model (Pikri)
-- ============================================================

CREATE DATABASE IF NOT EXISTS dashboard_owner
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE dashboard_owner;

-- ============================================================
--  TABEL MASTER DATA
-- ============================================================

-- ------------------------------------------------------------
--  1. pengguna
-- ------------------------------------------------------------
CREATE TABLE pengguna (
  id_pengguna  CHAR(36)     NOT NULL DEFAULT (UUID()),
  nama         VARCHAR(100) NOT NULL,
  email        VARCHAR(100) NOT NULL UNIQUE,
  password     VARCHAR(255) NOT NULL,
  role         ENUM('admin', 'kasir', 'staff_produksi') NOT NULL,
  created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_pengguna)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
--  2. outlet
-- ------------------------------------------------------------
CREATE TABLE outlet (
  id_outlet    CHAR(36)     NOT NULL DEFAULT (UUID()),
  nama_outlet  VARCHAR(100) NOT NULL,
  alamat       VARCHAR(255) NOT NULL,
  created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_outlet)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
--  3. kategori
-- ------------------------------------------------------------
CREATE TABLE kategori (
  id_kategori    CHAR(36)     NOT NULL DEFAULT (UUID()),
  nama_kategori  VARCHAR(100) NOT NULL,
  created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_kategori)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
--  4. produk
-- ------------------------------------------------------------
CREATE TABLE produk (
  id_produk    CHAR(36)       NOT NULL DEFAULT (UUID()),
  id_kategori  CHAR(36)       NOT NULL,
  nama_produk  VARCHAR(150)   NOT NULL,
  deskripsi    TEXT,
  harga        DECIMAL(12, 2) NOT NULL,
  created_at   DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_produk),
  CONSTRAINT fk_produk_kategori
    FOREIGN KEY (id_kategori) REFERENCES kategori (id_kategori)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ------------------------------------------------------------
--  5. bahan_baku
-- ------------------------------------------------------------
CREATE TABLE bahan_baku (
  id_bahan_baku  CHAR(36)     NOT NULL DEFAULT (UUID()),
  nama_bahan     VARCHAR(150) NOT NULL,
  satuan         ENUM('kg', 'gram', 'liter', 'ml', 'pcs', 'lusin', 'karton') NOT NULL,
  created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_bahan_baku)
) ENGINE=InnoDB;

-- ============================================================
--  TABEL STOK
-- ============================================================

-- ------------------------------------------------------------
--  6. stok_bahan_baku
--     Relasi 1:1 dengan bahan_baku
-- ------------------------------------------------------------
CREATE TABLE stok_bahan_baku (
  id_stok_bb    CHAR(36)       NOT NULL DEFAULT (UUID()),
  id_bahan_baku CHAR(36)       NOT NULL UNIQUE,
  jumlah_stok   DECIMAL(12, 2) NOT NULL DEFAULT 0,
  updated_at    DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP
                               ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_stok_bb),
  CONSTRAINT fk_stok_bb_bahan_baku
    FOREIGN KEY (id_bahan_baku) REFERENCES bahan_baku (id_bahan_baku)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ============================================================
--  TABEL OPERASIONAL
-- ============================================================

-- ------------------------------------------------------------
--  7. pengeluaran
-- ------------------------------------------------------------
CREATE TABLE pengeluaran (
  id_pengeluaran  CHAR(36)       NOT NULL DEFAULT (UUID()),
  id_pengguna     CHAR(36)       NOT NULL,
  tanggal         DATE           NOT NULL,
  biaya           DECIMAL(14, 2) NOT NULL,
  deskripsi       VARCHAR(255),
  created_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_pengeluaran),
  CONSTRAINT fk_pengeluaran_pengguna
    FOREIGN KEY (id_pengguna) REFERENCES pengguna (id_pengguna)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ------------------------------------------------------------
--  8. penggunaan_bahan_baku
--     Setiap pencatatan otomatis mengurangi stok_bahan_baku
--     via TRIGGER di bawah
-- ------------------------------------------------------------
CREATE TABLE penggunaan_bahan_baku (
  id_penggunaan    CHAR(36)       NOT NULL DEFAULT (UUID()),
  id_bahan_baku    CHAR(36)       NOT NULL,
  id_pengguna      CHAR(36)       NOT NULL,
  jumlah_digunakan DECIMAL(12, 2) NOT NULL,
  catatan          VARCHAR(255),
  tanggal          DATE           NOT NULL,
  created_at       DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_penggunaan),
  CONSTRAINT fk_penggunaan_bb
    FOREIGN KEY (id_bahan_baku) REFERENCES bahan_baku (id_bahan_baku)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_penggunaan_pengguna
    FOREIGN KEY (id_pengguna) REFERENCES pengguna (id_pengguna)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ============================================================
--  TABEL LAPORAN
-- ============================================================

-- ------------------------------------------------------------
--  9. laporan
-- ------------------------------------------------------------
CREATE TABLE laporan (
  id_laporan        CHAR(36)       NOT NULL DEFAULT (UUID()),
  id_outlet         CHAR(36),
  id_pengguna       CHAR(36)       NOT NULL,
  jenis_laporan     ENUM('bulanan', 'tahunan') NOT NULL,
  periode_bulan     TINYINT        UNSIGNED,
  periode_tahun     SMALLINT       UNSIGNED NOT NULL,
  total_pendapatan  DECIMAL(16, 2) NOT NULL DEFAULT 0,
  total_pengeluaran DECIMAL(16, 2) NOT NULL DEFAULT 0,
  created_at        DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_laporan),
  CONSTRAINT fk_laporan_outlet
    FOREIGN KEY (id_outlet) REFERENCES outlet (id_outlet)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_laporan_pengguna
    FOREIGN KEY (id_pengguna) REFERENCES pengguna (id_pengguna)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  -- laporan tahunan: periode_bulan NULL
  -- laporan bulanan: periode_bulan 1-12
  CONSTRAINT chk_periode_bulan
    CHECK (
      (jenis_laporan = 'tahunan' AND periode_bulan IS NULL) OR
      (jenis_laporan = 'bulanan' AND periode_bulan BETWEEN 1 AND 12)
    )
) ENGINE=InnoDB;

-- ------------------------------------------------------------
--  10. laporan_pengeluaran  (tabel penghubung)
--      Laporan bisa melihat detail pengeluaran yang tercakup
-- ------------------------------------------------------------
CREATE TABLE laporan_pengeluaran (
  id_laporan     CHAR(36) NOT NULL,
  id_pengeluaran CHAR(36) NOT NULL,
  PRIMARY KEY (id_laporan, id_pengeluaran),
  CONSTRAINT fk_lp_laporan
    FOREIGN KEY (id_laporan) REFERENCES laporan (id_laporan)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_lp_pengeluaran
    FOREIGN KEY (id_pengeluaran) REFERENCES pengeluaran (id_pengeluaran)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
--  CARA KURANGI STOK MANUAL DARI APLIKASI
--  Jalankan query ini di aplikasi saat stok perlu dikurangi
-- ============================================================

-- UPDATE stok_bahan_baku
-- SET    jumlah_stok = jumlah_stok - [jumlah_digunakan]
-- WHERE  id_bahan_baku = '[id_bahan_baku]';

-- ============================================================
--  DUMMY DATA
-- ============================================================

-- ------------------------------------------------------------
--  pengguna
-- ------------------------------------------------------------
INSERT INTO pengguna (id_pengguna, nama, email, password, role) VALUES
  ('usr-001', 'Budi Santoso',   'budi@owner.com',   '$2b$10$hashedpassword1', 'admin'),
  ('usr-002', 'Siti Rahayu',    'siti@owner.com',    '$2b$10$hashedpassword2', 'kasir'),
  ('usr-003', 'Andi Wijaya',    'andi@owner.com',    '$2b$10$hashedpassword3', 'kasir'),
  ('usr-004', 'Dewi Lestari',   'dewi@owner.com',    '$2b$10$hashedpassword4', 'staff_produksi'),
  ('usr-005', 'Rafi Firmansyah','rafi@owner.com',    '$2b$10$hashedpassword5', 'staff_produksi');

-- ------------------------------------------------------------
--  outlet
-- ------------------------------------------------------------
INSERT INTO outlet (id_outlet, nama_outlet, alamat) VALUES
  ('otl-001', 'Outlet Pusat',   'Jl. Sudirman No. 10, Jakarta'),
  ('otl-002', 'Outlet Selatan', 'Jl. Fatmawati No. 45, Jakarta'),
  ('otl-003', 'Outlet Barat',   'Jl. Panjang No. 88, Jakarta');

-- ------------------------------------------------------------
--  kategori
-- ------------------------------------------------------------
INSERT INTO kategori (id_kategori, nama_kategori) VALUES
  ('kat-001', 'Minuman'),
  ('kat-002', 'Makanan'),
  ('kat-003', 'Snack'),
  ('kat-004', 'Paket');

-- ------------------------------------------------------------
--  produk
-- ------------------------------------------------------------
INSERT INTO produk (id_produk, id_kategori, nama_produk, deskripsi, harga) VALUES
  ('prd-001', 'kat-001', 'Es Kopi Susu',       'Kopi susu dingin signature',       28000),
  ('prd-002', 'kat-001', 'Es Teh Manis',        'Teh manis dingin segar',           12000),
  ('prd-003', 'kat-001', 'Jus Alpukat',         'Jus alpukat segar tanpa susu',     22000),
  ('prd-004', 'kat-002', 'Nasi Goreng Spesial', 'Nasi goreng dengan telur dan ayam',25000),
  ('prd-005', 'kat-002', 'Mie Goreng',          'Mie goreng pedas level 1-3',       22000),
  ('prd-006', 'kat-003', 'Kentang Goreng',      'Kentang goreng crispy',            15000),
  ('prd-007', 'kat-004', 'Paket Hemat A',       'Nasi goreng + Es teh + Snack',     45000);

-- ------------------------------------------------------------
--  bahan_baku
-- ------------------------------------------------------------
INSERT INTO bahan_baku (id_bahan_baku, nama_bahan, satuan) VALUES
  ('bb-001', 'Kopi Arabika',  'kg'),
  ('bb-002', 'Susu UHT',      'liter'),
  ('bb-003', 'Gula Pasir',    'kg'),
  ('bb-004', 'Teh Celup',     'pcs'),
  ('bb-005', 'Alpukat',       'kg'),
  ('bb-006', 'Beras',         'kg'),
  ('bb-007', 'Mie Instan',    'pcs'),
  ('bb-008', 'Kentang',       'kg'),
  ('bb-009', 'Minyak Goreng', 'liter');

-- ------------------------------------------------------------
--  stok_bahan_baku (1:1 dengan bahan_baku)
-- ------------------------------------------------------------
INSERT INTO stok_bahan_baku (id_stok_bb, id_bahan_baku, jumlah_stok) VALUES
  ('stk-001', 'bb-001', 15.00),
  ('stk-002', 'bb-002', 40.00),
  ('stk-003', 'bb-003', 25.00),
  ('stk-004', 'bb-004', 200.00),
  ('stk-005', 'bb-005', 30.00),
  ('stk-006', 'bb-006', 50.00),
  ('stk-007', 'bb-007', 100.00),
  ('stk-008', 'bb-008', 20.00),
  ('stk-009', 'bb-009', 10.00);

-- ------------------------------------------------------------
--  pengeluaran
-- ------------------------------------------------------------
INSERT INTO pengeluaran (id_pengeluaran, id_pengguna, tanggal, biaya, deskripsi) VALUES
  ('pel-001', 'usr-001', '2025-03-01', 500000,  'Pembelian kopi arabika 5kg'),
  ('pel-002', 'usr-001', '2025-03-03', 240000,  'Pembelian susu UHT 12 liter'),
  ('pel-003', 'usr-001', '2025-03-05', 150000,  'Pembelian gula pasir 10kg'),
  ('pel-004', 'usr-001', '2025-03-10', 300000,  'Pembelian beras 20kg'),
  ('pel-005', 'usr-001', '2025-03-12', 80000,   'Pembelian minyak goreng 4 liter'),
  ('pel-006', 'usr-001', '2025-03-15', 450000,  'Pembelian alpukat 15kg'),
  ('pel-007', 'usr-001', '2025-03-20', 200000,  'Biaya listrik outlet pusat'),
  ('pel-008', 'usr-001', '2025-03-22', 180000,  'Biaya listrik outlet selatan'),
  ('pel-009', 'usr-001', '2025-04-01', 500000,  'Pembelian kopi arabika 5kg'),
  ('pel-010', 'usr-001', '2025-04-05', 300000,  'Pembelian beras 20kg');

-- ------------------------------------------------------------
--  penggunaan_bahan_baku
--  (trigger akan otomatis kurangi stok_bahan_baku)
-- ------------------------------------------------------------
INSERT INTO penggunaan_bahan_baku
  (id_penggunaan, id_bahan_baku, id_pengguna, jumlah_digunakan, catatan, tanggal)
VALUES
  ('pgu-001', 'bb-001', 'usr-004', 2.00,  'Produksi kopi pagi',         '2025-03-01'),
  ('pgu-002', 'bb-002', 'usr-004', 5.00,  'Produksi es kopi susu',      '2025-03-01'),
  ('pgu-003', 'bb-003', 'usr-004', 1.50,  'Produksi minuman manis',     '2025-03-02'),
  ('pgu-004', 'bb-005', 'usr-005', 3.00,  'Produksi jus alpukat',       '2025-03-03'),
  ('pgu-005', 'bb-006', 'usr-005', 5.00,  'Produksi nasi goreng',       '2025-03-04'),
  ('pgu-006', 'bb-009', 'usr-004', 2.00,  'Goreng kentang & nasi',      '2025-03-04'),
  ('pgu-007', 'bb-001', 'usr-004', 1.50,  'Produksi kopi siang',        '2025-03-05'),
  ('pgu-008', 'bb-002', 'usr-005', 4.00,  'Tambahan susu minuman',      '2025-03-06'),
  ('pgu-009', 'bb-008', 'usr-005', 2.50,  'Produksi kentang goreng',    '2025-03-07'),
  ('pgu-010', 'bb-004', 'usr-004', 20.00, 'Produksi teh manis',         '2025-03-08');

-- ------------------------------------------------------------
--  laporan
-- ------------------------------------------------------------
INSERT INTO laporan
  (id_laporan, id_outlet, id_pengguna, jenis_laporan,
   periode_bulan, periode_tahun, total_pendapatan, total_pengeluaran)
VALUES
  -- laporan bulanan per outlet
  ('lap-001', 'otl-001', 'usr-001', 'bulanan', 3, 2025, 12500000, 1950000),
  ('lap-002', 'otl-002', 'usr-001', 'bulanan', 3, 2025,  8300000,  980000),
  ('lap-003', 'otl-003', 'usr-001', 'bulanan', 3, 2025,  6700000,  750000),
  -- laporan bulanan keseluruhan (id_outlet NULL = semua outlet)
  ('lap-004', NULL,      'usr-001', 'bulanan', 3, 2025, 27500000, 3680000),
  -- laporan tahunan keseluruhan
  ('lap-005', NULL,      'usr-001', 'tahunan', NULL, 2025, 95000000, 14200000);

-- ------------------------------------------------------------
--  laporan_pengeluaran (tabel penghubung)
--  menghubungkan laporan dengan detail pengeluaran yang tercakup
-- ------------------------------------------------------------
INSERT INTO laporan_pengeluaran (id_laporan, id_pengeluaran) VALUES
  -- laporan bulanan Maret keseluruhan (lap-004) mencakup semua pengeluaran Maret
  ('lap-004', 'pel-001'),
  ('lap-004', 'pel-002'),
  ('lap-004', 'pel-003'),
  ('lap-004', 'pel-004'),
  ('lap-004', 'pel-005'),
  ('lap-004', 'pel-006'),
  ('lap-004', 'pel-007'),
  ('lap-004', 'pel-008'),
  -- laporan outlet pusat Maret (lap-001) mencakup pengeluaran terkait outlet pusat
  ('lap-001', 'pel-001'),
  ('lap-001', 'pel-002'),
  ('lap-001', 'pel-003'),
  ('lap-001', 'pel-007'),
  -- laporan outlet selatan Maret (lap-002)
  ('lap-002', 'pel-004'),
  ('lap-002', 'pel-005'),
  ('lap-002', 'pel-008'),
  -- laporan tahunan (lap-005) mencakup semua pengeluaran
  ('lap-005', 'pel-001'),
  ('lap-005', 'pel-002'),
  ('lap-005', 'pel-003'),
  ('lap-005', 'pel-004'),
  ('lap-005', 'pel-005'),
  ('lap-005', 'pel-006'),
  ('lap-005', 'pel-007'),
  ('lap-005', 'pel-008'),
  ('lap-005', 'pel-009'),
  ('lap-005', 'pel-010');

-- ============================================================
--  CONTOH QUERY BERGUNA
-- ============================================================

-- 1. Lihat stok bahan baku saat ini
-- SELECT b.nama_bahan, b.satuan, s.jumlah_stok, s.updated_at
-- FROM stok_bahan_baku s
-- JOIN bahan_baku b ON b.id_bahan_baku = s.id_bahan_baku
-- ORDER BY b.nama_bahan;

-- 2. Laporan pengeluaran bulanan beserta detailnya
-- SELECT l.jenis_laporan, l.periode_bulan, l.periode_tahun,
--        o.nama_outlet, p.tanggal, p.biaya, p.deskripsi
-- FROM laporan l
-- LEFT JOIN outlet o ON o.id_outlet = l.id_outlet
-- JOIN laporan_pengeluaran lp ON lp.id_laporan = l.id_laporan
-- JOIN pengeluaran p ON p.id_pengeluaran = lp.id_pengeluaran
-- WHERE l.id_laporan = 'lap-004';

-- 3. Riwayat penggunaan bahan baku oleh staff
-- SELECT pg.tanggal, b.nama_bahan, pg.jumlah_digunakan, b.satuan,
--        u.nama AS dicatat_oleh, pg.catatan
-- FROM penggunaan_bahan_baku pg
-- JOIN bahan_baku b ON b.id_bahan_baku = pg.id_bahan_baku
-- JOIN pengguna u ON u.id_pengguna = pg.id_pengguna
-- ORDER BY pg.tanggal DESC;

-- 4. Produk per kategori
-- SELECT k.nama_kategori, p.nama_produk, p.harga
-- FROM produk p
-- JOIN kategori k ON k.id_kategori = p.id_kategori
-- ORDER BY k.nama_kategori, p.nama_produk;
