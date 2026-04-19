// ============================================================
//  migrate.js
//  Migrasi database untuk Sistem Dashboard Owner
//  Stack: Node.js + mysql2
//
//  Cara pakai:
//    node migrate.js            → jalankan migrasi + seed
//    node migrate.js --migrate  → hanya buat tabel
//    node migrate.js --seed     → hanya masukkan dummy data
//    node migrate.js --rollback → hapus semua tabel
// ============================================================

const mysql = require("mysql2/promise");

// ------------------------------------------------------------
//  Konfigurasi koneksi — sesuaikan dengan environment kamu
// ------------------------------------------------------------
const DB_CONFIG = {
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "dessertation_db",
  multipleStatements: true,
};

// ------------------------------------------------------------
//  DDL — urutan penting karena ada foreign key
// ------------------------------------------------------------
const MIGRATE_QUERIES = [
  // 1. pengguna
  `CREATE TABLE IF NOT EXISTS pengguna (
    id_pengguna  CHAR(36)     NOT NULL,
    nama         VARCHAR(100) NOT NULL,
    email        VARCHAR(100) NOT NULL UNIQUE,
    password     VARCHAR(255) NOT NULL,
    role         ENUM('admin','kasir','staff_produksi') NOT NULL,
    created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_pengguna)
  ) ENGINE=InnoDB`,

  // 2. outlet
  `CREATE TABLE IF NOT EXISTS outlet (
    id_outlet    CHAR(36)     NOT NULL,
    nama_outlet  VARCHAR(100) NOT NULL,
    alamat       VARCHAR(255) NOT NULL,
    created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_outlet)
  ) ENGINE=InnoDB`,

  // 3. kategori
  `CREATE TABLE IF NOT EXISTS kategori (
    id_kategori   CHAR(36)     NOT NULL,
    kode_kategori VARCHAR(10)  NOT NULL UNIQUE,
    nama_kategori VARCHAR(100) NOT NULL,
    created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_kategori)
  ) ENGINE=InnoDB`,

  // 4. produk
  `CREATE TABLE IF NOT EXISTS produk (
    id_produk   CHAR(36)      NOT NULL,
    id_kategori CHAR(36)      NOT NULL,
    nama_produk VARCHAR(150)  NOT NULL,
    deskripsi   TEXT,
    harga       DECIMAL(12,2) NOT NULL,
    created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_produk),
    CONSTRAINT fk_produk_kategori
      FOREIGN KEY (id_kategori) REFERENCES kategori (id_kategori)
      ON UPDATE CASCADE ON DELETE RESTRICT
  ) ENGINE=InnoDB`,

  // 5. stok_outlet (stok produk per outlet — relasi Produk * ←→ * Outlet)
  `CREATE TABLE IF NOT EXISTS stok_outlet (
    id_stok_outlet CHAR(36)      NOT NULL,
    id_produk      CHAR(36)      NOT NULL,
    id_outlet      CHAR(36)      NOT NULL,
    jumlah_stok    DECIMAL(12,2) NOT NULL DEFAULT 0,
    updated_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
                                 ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id_stok_outlet),
    CONSTRAINT uq_stok_outlet UNIQUE (id_produk, id_outlet),
    CONSTRAINT fk_stok_outlet_produk
      FOREIGN KEY (id_produk) REFERENCES produk (id_produk)
      ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_stok_outlet_outlet
      FOREIGN KEY (id_outlet) REFERENCES outlet (id_outlet)
      ON UPDATE CASCADE ON DELETE CASCADE 
  ) ENGINE=InnoDB`,

  // 6. bahan_baku
  `CREATE TABLE IF NOT EXISTS bahan_baku (
    id_bahan_baku CHAR(36)     NOT NULL,
    nama_bahan    VARCHAR(150) NOT NULL,
    satuan        ENUM('kg','gram','liter','ml','pcs','lusin','karton') NOT NULL,
    created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_bahan_baku)
  ) ENGINE=InnoDB`,

  // 7. stok_bahan_baku (1:1 dengan bahan_baku)
  `CREATE TABLE IF NOT EXISTS stok_bahan_baku (
    id_stok_bb    CHAR(36)      NOT NULL,
    id_bahan_baku CHAR(36)      NOT NULL UNIQUE,
    jumlah_stok   DECIMAL(12,2) NOT NULL DEFAULT 0,
    stok_minimum  DECIMAL(12,2) NOT NULL DEFAULT 0,
    updated_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
                                ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id_stok_bb),
    CONSTRAINT fk_stok_bb_bahan_baku
      FOREIGN KEY (id_bahan_baku) REFERENCES bahan_baku (id_bahan_baku)
      ON UPDATE CASCADE ON DELETE RESTRICT
  ) ENGINE=InnoDB`,

  // 8. pengeluaran
  `CREATE TABLE IF NOT EXISTS pengeluaran (
    id_pengeluaran CHAR(36)      NOT NULL,
    id_pengguna    CHAR(36)      NOT NULL,
    tanggal        DATE          NOT NULL,
    biaya          DECIMAL(14,2) NOT NULL,
    deskripsi      VARCHAR(255),
    created_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_pengeluaran),
    CONSTRAINT fk_pengeluaran_pengguna
      FOREIGN KEY (id_pengguna) REFERENCES pengguna (id_pengguna)
      ON UPDATE CASCADE ON DELETE RESTRICT
  ) ENGINE=InnoDB`,

  // 9. penggunaan_bahan_baku
  `CREATE TABLE IF NOT EXISTS penggunaan_bahan_baku (
    id_penggunaan    CHAR(36)      NOT NULL,
    id_bahan_baku    CHAR(36)      NOT NULL,
    id_pengguna      CHAR(36)      NOT NULL,
    jumlah_digunakan DECIMAL(12,2) NOT NULL,
    catatan          VARCHAR(255),
    tanggal          DATE          NOT NULL,
    created_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_penggunaan),
    CONSTRAINT fk_penggunaan_bb
      FOREIGN KEY (id_bahan_baku) REFERENCES bahan_baku (id_bahan_baku)
      ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_penggunaan_pengguna
      FOREIGN KEY (id_pengguna) REFERENCES pengguna (id_pengguna)
      ON UPDATE CASCADE ON DELETE RESTRICT
  ) ENGINE=InnoDB`,

  // 10. transaksi
  `CREATE TABLE IF NOT EXISTS transaksi (
    id_transaksi CHAR(36)      NOT NULL,
    id_outlet    CHAR(36)      NOT NULL,
    id_pengguna  CHAR(36)      NOT NULL,
    tanggal      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total_harga  DECIMAL(14,2) NOT NULL DEFAULT 0,
    metode_bayar ENUM('tunai','qris','transfer') NOT NULL DEFAULT 'tunai',
    status       ENUM('selesai','dibatalkan')    NOT NULL DEFAULT 'selesai',
    created_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_transaksi),
    CONSTRAINT fk_transaksi_outlet
      FOREIGN KEY (id_outlet) REFERENCES outlet (id_outlet)
      ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_transaksi_pengguna
      FOREIGN KEY (id_pengguna) REFERENCES pengguna (id_pengguna)
      ON UPDATE CASCADE ON DELETE RESTRICT
  ) ENGINE=InnoDB`,

  // 11. detail_transaksi
  `CREATE TABLE IF NOT EXISTS detail_transaksi (
    id_detail    CHAR(36)      NOT NULL,
    id_transaksi CHAR(36)      NOT NULL,
    id_produk    CHAR(36)      NOT NULL,
    jumlah       INT UNSIGNED  NOT NULL DEFAULT 1,
    harga_satuan DECIMAL(12,2) NOT NULL,
    subtotal     DECIMAL(14,2) NOT NULL,
    created_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_detail),
    CONSTRAINT fk_detail_transaksi
      FOREIGN KEY (id_transaksi) REFERENCES transaksi (id_transaksi)
      ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_detail_produk
      FOREIGN KEY (id_produk) REFERENCES produk (id_produk)
      ON UPDATE CASCADE ON DELETE RESTRICT
  ) ENGINE=InnoDB`,

  // 12. laporan
  `CREATE TABLE IF NOT EXISTS laporan (
    id_laporan        CHAR(36)       NOT NULL,
    id_outlet         CHAR(36),
    id_pengguna       CHAR(36)       NOT NULL,
    jenis_laporan     ENUM('bulanan','tahunan') NOT NULL,
    periode_bulan     TINYINT UNSIGNED,
    periode_tahun     SMALLINT UNSIGNED NOT NULL,
    total_pendapatan  DECIMAL(16,2)  NOT NULL DEFAULT 0,
    total_pengeluaran DECIMAL(16,2)  NOT NULL DEFAULT 0,
    created_at        DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_laporan),
    CONSTRAINT fk_laporan_outlet
      FOREIGN KEY (id_outlet) REFERENCES outlet (id_outlet)
      ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_laporan_pengguna
      FOREIGN KEY (id_pengguna) REFERENCES pengguna (id_pengguna)
      ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT chk_periode_bulan
      CHECK (
        (jenis_laporan = 'tahunan' AND periode_bulan IS NULL) OR
        (jenis_laporan = 'bulanan' AND periode_bulan BETWEEN 1 AND 12)
      )
  ) ENGINE=InnoDB`,

  // 13. laporan_pengeluaran (tabel penghubung many-to-many)
  `CREATE TABLE IF NOT EXISTS laporan_pengeluaran (
    id_laporan     CHAR(36) NOT NULL,
    id_pengeluaran CHAR(36) NOT NULL,
    PRIMARY KEY (id_laporan, id_pengeluaran),
    CONSTRAINT fk_lp_laporan
      FOREIGN KEY (id_laporan) REFERENCES laporan (id_laporan)
      ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_lp_pengeluaran
      FOREIGN KEY (id_pengeluaran) REFERENCES pengeluaran (id_pengeluaran)
      ON UPDATE CASCADE ON DELETE CASCADE
  ) ENGINE=InnoDB`,
];

// ------------------------------------------------------------
//  Rollback — urutan terbalik karena ada foreign key
// ------------------------------------------------------------
const ROLLBACK_QUERIES = [
  "DROP TABLE IF EXISTS laporan_pengeluaran",
  "DROP TABLE IF EXISTS laporan",
  "DROP TABLE IF EXISTS detail_transaksi",
  "DROP TABLE IF EXISTS transaksi",
  "DROP TABLE IF EXISTS penggunaan_bahan_baku",
  "DROP TABLE IF EXISTS pengeluaran",
  "DROP TABLE IF EXISTS stok_bahan_baku",
  "DROP TABLE IF EXISTS bahan_baku",
  "DROP TABLE IF EXISTS stok_outlet",
  "DROP TABLE IF EXISTS produk",
  "DROP TABLE IF EXISTS kategori",
  "DROP TABLE IF EXISTS outlet",
  "DROP TABLE IF EXISTS pengguna",
];

// ------------------------------------------------------------
//  Seed — dummy data
// ------------------------------------------------------------
const SEED_QUERIES = [
  // pengguna
  `INSERT IGNORE INTO pengguna (id_pengguna, nama, email, password, role) VALUES
    ('usr-001', 'Budi Santoso',    'budi@owner.com',  '$2b$10$hashedpassword1', 'admin'),
    ('usr-002', 'Siti Rahayu',     'siti@owner.com',  '$2b$10$hashedpassword2', 'kasir'),
    ('usr-003', 'Andi Wijaya',     'andi@owner.com',  '$2b$10$hashedpassword3', 'kasir'),
    ('usr-004', 'Dewi Lestari',    'dewi@owner.com',  '$2b$10$hashedpassword4', 'staff_produksi'),
    ('usr-005', 'Rafi Firmansyah', 'rafi@owner.com',  '$2b$10$hashedpassword5', 'staff_produksi')`,

  // outlet
  `INSERT IGNORE INTO outlet (id_outlet, nama_outlet, alamat) VALUES
    ('otl-001', 'Outlet Pusat',   'Jl. Sudirman No. 10, Jakarta'),
    ('otl-002', 'Outlet Selatan', 'Jl. Fatmawati No. 45, Jakarta'),
    ('otl-003', 'Outlet Barat',   'Jl. Panjang No. 88, Jakarta')`,

  // kategori
  `INSERT IGNORE INTO kategori (id_kategori, kode_kategori, nama_kategori) VALUES
    ('kat-001', 'MNM', 'Minuman'),
    ('kat-002', 'MKN', 'Makanan'),
    ('kat-003', 'SNK', 'Snack'),
    ('kat-004', 'PKT', 'Paket')`,

  // produk
  `INSERT IGNORE INTO produk (id_produk, id_kategori, nama_produk, deskripsi, harga) VALUES
    ('prd-001', 'kat-001', 'Es Kopi Susu',       'Kopi susu dingin signature',        28000),
    ('prd-002', 'kat-001', 'Es Teh Manis',        'Teh manis dingin segar',            12000),
    ('prd-003', 'kat-001', 'Jus Alpukat',         'Jus alpukat segar tanpa susu',      22000),
    ('prd-004', 'kat-002', 'Nasi Goreng Spesial', 'Nasi goreng dengan telur dan ayam', 25000),
    ('prd-005', 'kat-002', 'Mie Goreng',          'Mie goreng pedas level 1-3',        22000),
    ('prd-006', 'kat-003', 'Kentang Goreng',      'Kentang goreng crispy',             15000),
    ('prd-007', 'kat-004', 'Paket Hemat A',       'Nasi goreng + Es teh + Snack',      45000)`,

  // stok_outlet
  `INSERT IGNORE INTO stok_outlet (id_stok_outlet, id_produk, id_outlet, jumlah_stok) VALUES
    ('stok-001', 'prd-001', 'otl-001', 50),
    ('stok-002', 'prd-002', 'otl-001', 80),
    ('stok-003', 'prd-003', 'otl-001', 30),
    ('stok-004', 'prd-004', 'otl-001', 40),
    ('stok-005', 'prd-005', 'otl-001', 40),
    ('stok-006', 'prd-006', 'otl-001', 60),
    ('stok-007', 'prd-007', 'otl-001', 25),
    ('stok-008', 'prd-001', 'otl-002', 35),
    ('stok-009', 'prd-002', 'otl-002', 60),
    ('stok-010', 'prd-003', 'otl-002', 20),
    ('stok-011', 'prd-004', 'otl-002', 30),
    ('stok-012', 'prd-005', 'otl-002', 30),
    ('stok-013', 'prd-006', 'otl-002', 45),
    ('stok-014', 'prd-007', 'otl-002', 15),
    ('stok-015', 'prd-001', 'otl-003', 25),
    ('stok-016', 'prd-002', 'otl-003', 50),
    ('stok-017', 'prd-003', 'otl-003', 15),
    ('stok-018', 'prd-004', 'otl-003', 20),
    ('stok-019', 'prd-005', 'otl-003', 20),
    ('stok-020', 'prd-006', 'otl-003', 30),
    ('stok-021', 'prd-007', 'otl-003', 10)`,

  // bahan_baku
  `INSERT IGNORE INTO bahan_baku (id_bahan_baku, nama_bahan, satuan) VALUES
    ('bb-001', 'Kopi Arabika',  'kg'),
    ('bb-002', 'Susu UHT',      'liter'),
    ('bb-003', 'Gula Pasir',    'kg'),
    ('bb-004', 'Teh Celup',     'pcs'),
    ('bb-005', 'Alpukat',       'kg'),
    ('bb-006', 'Beras',         'kg'),
    ('bb-007', 'Mie Instan',    'pcs'),
    ('bb-008', 'Kentang',       'kg'),
    ('bb-009', 'Minyak Goreng', 'liter')`,

  // stok_bahan_baku
  `INSERT IGNORE INTO stok_bahan_baku (id_stok_bb, id_bahan_baku, jumlah_stok, stok_minimum) VALUES
    ('stk-001', 'bb-001',  15.00,  5.00),
    ('stk-002', 'bb-002',  40.00, 10.00),
    ('stk-003', 'bb-003',  25.00,  5.00),
    ('stk-004', 'bb-004', 200.00, 50.00),
    ('stk-005', 'bb-005',  30.00,  5.00),
    ('stk-006', 'bb-006',  50.00, 10.00),
    ('stk-007', 'bb-007', 100.00, 20.00),
    ('stk-008', 'bb-008',  20.00,  5.00),
    ('stk-009', 'bb-009',  10.00,  2.00)`,

  // pengeluaran
  `INSERT IGNORE INTO pengeluaran (id_pengeluaran, id_pengguna, tanggal, biaya, deskripsi) VALUES
    ('pel-001', 'usr-001', '2025-03-01', 500000, 'Pembelian kopi arabika 5kg'),
    ('pel-002', 'usr-001', '2025-03-03', 240000, 'Pembelian susu UHT 12 liter'),
    ('pel-003', 'usr-001', '2025-03-05', 150000, 'Pembelian gula pasir 10kg'),
    ('pel-004', 'usr-001', '2025-03-10', 300000, 'Pembelian beras 20kg'),
    ('pel-005', 'usr-001', '2025-03-12',  80000, 'Pembelian minyak goreng 4 liter'),
    ('pel-006', 'usr-001', '2025-03-15', 450000, 'Pembelian alpukat 15kg'),
    ('pel-007', 'usr-001', '2025-03-20', 200000, 'Biaya listrik outlet pusat'),
    ('pel-008', 'usr-001', '2025-03-22', 180000, 'Biaya listrik outlet selatan'),
    ('pel-009', 'usr-001', '2025-04-01', 500000, 'Pembelian kopi arabika 5kg'),
    ('pel-010', 'usr-001', '2025-04-05', 300000, 'Pembelian beras 20kg')`,

  // penggunaan_bahan_baku
  `INSERT IGNORE INTO penggunaan_bahan_baku
    (id_penggunaan, id_bahan_baku, id_pengguna, jumlah_digunakan, catatan, tanggal) VALUES
    ('pgu-001', 'bb-001', 'usr-004',  2.00, 'Produksi kopi pagi',      '2025-03-01'),
    ('pgu-002', 'bb-002', 'usr-004',  5.00, 'Produksi es kopi susu',   '2025-03-01'),
    ('pgu-003', 'bb-003', 'usr-004',  1.50, 'Produksi minuman manis',  '2025-03-02'),
    ('pgu-004', 'bb-005', 'usr-005',  3.00, 'Produksi jus alpukat',    '2025-03-03'),
    ('pgu-005', 'bb-006', 'usr-005',  5.00, 'Produksi nasi goreng',    '2025-03-04'),
    ('pgu-006', 'bb-009', 'usr-004',  2.00, 'Goreng kentang dan nasi', '2025-03-04'),
    ('pgu-007', 'bb-001', 'usr-004',  1.50, 'Produksi kopi siang',     '2025-03-05'),
    ('pgu-008', 'bb-002', 'usr-005',  4.00, 'Tambahan susu minuman',   '2025-03-06'),
    ('pgu-009', 'bb-008', 'usr-005',  2.50, 'Produksi kentang goreng', '2025-03-07'),
    ('pgu-010', 'bb-004', 'usr-004', 20.00, 'Produksi teh manis',      '2025-03-08')`,

  // transaksi
  `INSERT IGNORE INTO transaksi
    (id_transaksi, id_outlet, id_pengguna, tanggal, total_harga, metode_bayar, status) VALUES
    ('trx-001', 'otl-001', 'usr-002', '2025-03-01 09:15:00',  55000, 'tunai',    'selesai'),
    ('trx-002', 'otl-001', 'usr-002', '2025-03-01 11:30:00',  49000, 'qris',     'selesai'),
    ('trx-003', 'otl-001', 'usr-002', '2025-03-02 10:00:00',  94000, 'tunai',    'selesai'),
    ('trx-004', 'otl-002', 'usr-003', '2025-03-01 08:45:00',  37000, 'transfer', 'selesai'),
    ('trx-005', 'otl-002', 'usr-003', '2025-03-02 13:00:00',  62000, 'qris',     'selesai'),
    ('trx-006', 'otl-003', 'usr-002', '2025-03-03 09:30:00',  45000, 'tunai',    'selesai'),
    ('trx-007', 'otl-001', 'usr-002', '2025-03-03 14:00:00',  28000, 'tunai',    'dibatalkan'),
    ('trx-008', 'otl-002', 'usr-003', '2025-03-04 10:15:00', 114000, 'qris',     'selesai'),
    ('trx-009', 'otl-003', 'usr-002', '2025-03-05 11:00:00',  83000, 'tunai',    'selesai'),
    ('trx-010', 'otl-001', 'usr-003', '2025-03-05 15:30:00',  67000, 'transfer', 'selesai')`,

  // detail_transaksi
  `INSERT IGNORE INTO detail_transaksi
    (id_detail, id_transaksi, id_produk, jumlah, harga_satuan, subtotal) VALUES
    ('dtl-001', 'trx-001', 'prd-001', 1, 28000,  28000),
    ('dtl-002', 'trx-001', 'prd-002', 1, 12000,  12000),
    ('dtl-003', 'trx-001', 'prd-006', 1, 15000,  15000),
    ('dtl-004', 'trx-002', 'prd-004', 1, 25000,  25000),
    ('dtl-005', 'trx-002', 'prd-002', 2, 12000,  24000),
    ('dtl-006', 'trx-003', 'prd-007', 1, 45000,  45000),
    ('dtl-007', 'trx-003', 'prd-003', 1, 22000,  22000),
    ('dtl-008', 'trx-003', 'prd-006', 1, 15000,  15000),
    ('dtl-009', 'trx-003', 'prd-002', 1, 12000,  12000),
    ('dtl-010', 'trx-004', 'prd-004', 1, 25000,  25000),
    ('dtl-011', 'trx-004', 'prd-002', 1, 12000,  12000),
    ('dtl-012', 'trx-005', 'prd-005', 1, 22000,  22000),
    ('dtl-013', 'trx-005', 'prd-001', 1, 28000,  28000),
    ('dtl-014', 'trx-005', 'prd-002', 1, 12000,  12000),
    ('dtl-015', 'trx-006', 'prd-007', 1, 45000,  45000),
    ('dtl-016', 'trx-007', 'prd-001', 1, 28000,  28000),
    ('dtl-017', 'trx-008', 'prd-007', 2, 45000,  90000),
    ('dtl-018', 'trx-008', 'prd-002', 2, 12000,  24000),
    ('dtl-019', 'trx-009', 'prd-001', 2, 28000,  56000),
    ('dtl-020', 'trx-009', 'prd-006', 1, 15000,  15000),
    ('dtl-021', 'trx-009', 'prd-002', 1, 12000,  12000),
    ('dtl-022', 'trx-010', 'prd-005', 1, 22000,  22000),
    ('dtl-023', 'trx-010', 'prd-007', 1, 45000,  45000)`,

  // laporan
  `INSERT IGNORE INTO laporan
    (id_laporan, id_outlet, id_pengguna, jenis_laporan,
     periode_bulan, periode_tahun, total_pendapatan, total_pengeluaran) VALUES
    ('lap-001', 'otl-001', 'usr-001', 'bulanan',    3, 2025, 12500000,  1950000),
    ('lap-002', 'otl-002', 'usr-001', 'bulanan',    3, 2025,  8300000,   980000),
    ('lap-003', 'otl-003', 'usr-001', 'bulanan',    3, 2025,  6700000,   750000),
    ('lap-004',  NULL,     'usr-001', 'bulanan',    3, 2025, 27500000,  3680000),
    ('lap-005',  NULL,     'usr-001', 'tahunan', NULL, 2025, 95000000, 14200000)`,

  // laporan_pengeluaran (many-to-many)
  `INSERT IGNORE INTO laporan_pengeluaran (id_laporan, id_pengeluaran) VALUES
    ('lap-001', 'pel-001'), ('lap-001', 'pel-002'),
    ('lap-001', 'pel-003'), ('lap-001', 'pel-007'),
    ('lap-002', 'pel-004'), ('lap-002', 'pel-005'),
    ('lap-002', 'pel-008'),
    ('lap-004', 'pel-001'), ('lap-004', 'pel-002'),
    ('lap-004', 'pel-003'), ('lap-004', 'pel-004'),
    ('lap-004', 'pel-005'), ('lap-004', 'pel-006'),
    ('lap-004', 'pel-007'), ('lap-004', 'pel-008'),
    ('lap-005', 'pel-001'), ('lap-005', 'pel-002'),
    ('lap-005', 'pel-003'), ('lap-005', 'pel-004'),
    ('lap-005', 'pel-005'), ('lap-005', 'pel-006'),
    ('lap-005', 'pel-007'), ('lap-005', 'pel-008'),
    ('lap-005', 'pel-009'), ('lap-005', 'pel-010')`,
];

// ------------------------------------------------------------
//  Runner
// ------------------------------------------------------------
async function createDatabase(connection) {
  await connection.query(
    `CREATE DATABASE IF NOT EXISTS \`${DB_CONFIG.database}\`
     CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  );
  await connection.query(`USE \`${DB_CONFIG.database}\``);
  console.log(`✓ Database "${DB_CONFIG.database}" siap`);
}

async function migrate(connection) {
  console.log("\n[ MIGRASI TABEL ]");
  for (const sql of MIGRATE_QUERIES) {
    const match = sql.match(/CREATE TABLE IF NOT EXISTS (\w+)/i);
    const tableName = match ? match[1] : "?";
    await connection.query(sql);
    console.log(`  ✓ Tabel "${tableName}" berhasil dibuat`);
  }
}

async function seed(connection) {
  console.log("\n[ SEED DUMMY DATA ]");
  const labels = [
    "pengguna",
    "outlet",
    "kategori",
    "produk",
    "stok_outlet",
    "bahan_baku",
    "stok_bahan_baku",
    "pengeluaran",
    "penggunaan_bahan_baku",
    "transaksi",
    "detail_transaksi",
    "laporan",
    "laporan_pengeluaran",
  ];
  for (let i = 0; i < SEED_QUERIES.length; i++) {
    const [result] = await connection.query(SEED_QUERIES[i]);
    console.log(
      `  ✓ Seed "${labels[i]}" — ${result.affectedRows} baris dimasukkan`,
    );
  }
}

async function rollback(connection) {
  console.log("\n[ ROLLBACK — HAPUS SEMUA TABEL ]");
  await connection.query("SET FOREIGN_KEY_CHECKS = 0");
  for (const sql of ROLLBACK_QUERIES) {
    const match = sql.match(/DROP TABLE IF EXISTS (\w+)/i);
    const tableName = match ? match[1] : "?";
    await connection.query(sql);
    console.log(`  ✓ Tabel "${tableName}" dihapus`);
  }
  await connection.query("SET FOREIGN_KEY_CHECKS = 1");
}

// ------------------------------------------------------------
//  Entry point
// ------------------------------------------------------------
async function main() {
  const args = process.argv.slice(2);
  const doMigrate = args.includes("--migrate") || args.length === 0;
  const doSeed = args.includes("--seed") || args.length === 0;
  const doRollback = args.includes("--rollback");

  const { database, ...configWithoutDb } = DB_CONFIG;
  const initConn = await mysql.createConnection(configWithoutDb);

  try {
    await createDatabase(initConn);
  } finally {
    await initConn.end();
  }

  const connection = await mysql.createConnection(DB_CONFIG);

  try {
    if (doRollback) {
      await rollback(connection);
      console.log("\n✅ Rollback selesai.\n");
      return;
    }

    if (doMigrate) await migrate(connection);
    if (doSeed) await seed(connection);

    console.log("\n✅ Selesai.\n");
  } catch (err) {
    console.error("\n❌ Error:", err.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

main();
