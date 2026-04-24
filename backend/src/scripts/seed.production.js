// ============================================================
//  seed.production.js
//  Seeder data produksi — transaksi di-generate otomatis 1 tahun
//  Stack: Node.js + mysql2
//
//  Cara pakai:
//    node seed.production.js               → seed semua tabel
//    node seed.production.js --produk      → hanya kategori + produk
//    node seed.production.js --transaksi   → hanya transaksi + detail
//    node seed.production.js --transaksi 2024 → tahun tertentu
// ============================================================

const mysql = require("mysql2/promise");

const DB_CONFIG = {
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "dessertation_db",
  multipleStatements: true,
};

// ============================================================
//  DATA REFERENSI
// ============================================================

const OUTLETS = [
  { id: "otl-001", kasir: ["usr-002"] },
  { id: "otl-002", kasir: ["usr-003"] },
  { id: "otl-003", kasir: ["usr-002", "usr-003"] },
];

const PRODUK = [
  { id: "prd-001", harga: 8000 },
  { id: "prd-002", harga: 8000 },
  { id: "prd-003", harga: 8000 },
  { id: "prd-004", harga: 8000 },
  { id: "prd-005", harga: 8000 },
  { id: "prd-006", harga: 8000 },
  { id: "prd-007", harga: 8000 },
  { id: "prd-008", harga: 7000 },
  { id: "prd-009", harga: 7000 },
  { id: "prd-010", harga: 8000 },
  { id: "prd-011", harga: 9000 },
  { id: "prd-012", harga: 8000 },
  { id: "prd-013", harga: 8000 },
  { id: "prd-014", harga: 8000 },
  { id: "prd-015", harga: 8000 },
  { id: "prd-016", harga: 7000 },
  { id: "prd-017", harga: 7000 },
];

const METODE_BAYAR = ["tunai", "qris", "transfer"];

// ============================================================
//  HELPER — seeded PRNG supaya hasilnya konsisten tiap run
// ============================================================
function makePrng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

const pad = (n, len = 6) => String(n).padStart(len, "0");
const fmtDT = (d) => d.toISOString().slice(0, 19).replace("T", " ");

// ============================================================
//  GENERATOR TRANSAKSI SETAHUN
// ============================================================
function generateTransaksiSetahun(tahun = 2025) {
  const rng = makePrng(tahun * 7 + 42);

  const transaksiRows = [];
  const detailRows = [];
  let trxCounter = 0;
  let dtlCounter = 0;

  const end = new Date(`${tahun}-12-31T23:59:59`);

  for (
    let d = new Date(`${tahun}-01-01`);
    d <= end;
    d.setDate(d.getDate() + 1)
  ) {
    const dow = d.getDay(); // 0=Min, 6=Sab
    const isWeekend = dow === 0 || dow === 6;

    // Weekday: 8–14 trx/outlet | Weekend: 15–22 trx/outlet
    const minTrx = isWeekend ? 15 : 8;
    const maxTrx = isWeekend ? 22 : 14;

    for (const outlet of OUTLETS) {
      const jumlahTrx = minTrx + Math.floor(rng() * (maxTrx - minTrx + 1));

      for (let t = 0; t < jumlahTrx; t++) {
        trxCounter++;
        const trxId = `trx-${pad(trxCounter)}`;

        // Jam operasional 08:00–21:00
        const jamFloat = 8 + rng() * 13;
        const tgl = new Date(d);
        tgl.setHours(
          Math.floor(jamFloat),
          Math.floor(rng() * 60),
          Math.floor(rng() * 60),
          0,
        );

        const kasir = outlet.kasir[Math.floor(rng() * outlet.kasir.length)];
        const metodeBayar =
          METODE_BAYAR[Math.floor(rng() * METODE_BAYAR.length)];
        const status = rng() < 0.04 ? "dibatalkan" : "selesai";

        // 2–5 varian per transaksi, tidak duplikat
        const jumlahItem = 2 + Math.floor(rng() * 4);
        const shuffled = [...PRODUK].sort(() => rng() - 0.5);
        const items = shuffled.slice(0, jumlahItem);

        let totalHarga = 0;
        for (const p of items) {
          dtlCounter++;
          const qty = 1 + Math.floor(rng() * 4); // 1–4 pcs
          const subtotal = p.harga * qty;
          totalHarga += subtotal;

          detailRows.push(
            `('dtl-${pad(dtlCounter)}','${trxId}','${p.id}',${qty},${p.harga},${subtotal})`,
          );
        }

        transaksiRows.push(
          `('${trxId}','${outlet.id}','${kasir}','${fmtDT(tgl)}',${totalHarga},'${metodeBayar}','${status}')`,
        );
      }
    }
  }

  return { transaksiRows, detailRows };
}

// ============================================================
//  STATIC SEED QUERIES
// ============================================================
const STATIC_SEED_QUERIES = [
  // 1. pengguna
  `INSERT IGNORE INTO pengguna (id_pengguna, nama, email, password, role) VALUES
    ('usr-001', 'Admin Utama',        'admin@mochi.com',  '$2b$10$hashedpassword1', 'admin'),
    ('usr-002', 'Kasir Satu',         'kasir1@mochi.com', '$2b$10$hashedpassword2', 'kasir'),
    ('usr-003', 'Kasir Dua',          'kasir2@mochi.com', '$2b$10$hashedpassword3', 'kasir'),
    ('usr-004', 'Staff Produksi Satu','prod1@mochi.com',  '$2b$10$hashedpassword4', 'staff_produksi'),
    ('usr-005', 'Staff Produksi Dua', 'prod2@mochi.com',  '$2b$10$hashedpassword5', 'staff_produksi')`,

  // 2. outlet
  `INSERT IGNORE INTO outlet (id_outlet, nama_outlet, alamat) VALUES
    ('otl-001', 'Outlet Pusat',    'Jl. Utama No. 1'),
    ('otl-002', 'Outlet Cabang 1', 'Jl. Cabang No. 2'),
    ('otl-003', 'Outlet Cabang 2', 'Jl. Cabang No. 3')`,

  // 3. kategori
  `INSERT IGNORE INTO kategori (id_kategori, kode_kategori, nama_kategori) VALUES
    ('kat-001', 'MCH', 'Mochi')`,

  // 4. produk
  `INSERT IGNORE INTO produk (id_produk, id_kategori, nama_produk, deskripsi, harga) VALUES
    ('prd-001','kat-001','Milo',            'Mochi dengan isian coklat milo',                                                8000.00),
    ('prd-002','kat-001','Choco Macha',     'Mochi dengan isian coklat dan matcha',                                          8000.00),
    ('prd-003','kat-001','Choco Cheese',    'Mochi dengan isian coklat dan keju',                                            8000.00),
    ('prd-004','kat-001','Matcha Berry',    'Mochi dengan cream matcha dan stroberi',                                        8000.00),
    ('prd-005','kat-001','Redbean Berry',   'Mochi dengan isian kacang merah dan stroberi',                                  8000.00),
    ('prd-006','kat-001','Cookies and Cream','Mochi dengan rasa cookies and cream',                                          8000.00),
    ('prd-007','kat-001','Cheese Oreo',     'Mochi dengan isian keju yang creamy dan oreo',                                  8000.00),
    ('prd-008','kat-001','Cream Biskuit',   'Mochi biskuit',                                                                 7000.00),
    ('prd-009','kat-001','Cream Matcha',    'Mochi dengan taburan matcha dan isian cream',                                   7000.00),
    ('prd-010','kat-001','Choco Berry',     'Mochi dengan isian coklat dan stroberi',                                        8000.00),
    ('prd-011','kat-001','Double Choco',    'Mochi dengan isian lelehan coklat silverqueen dan potongan coklat silverqueen', 9000.00),
    ('prd-012','kat-001','Choco Silverqueen','Mochi dengan isian coklat silverqueen',                                        8000.00),
    ('prd-013','kat-001','Choco Mallow',    'Mochi dengan isian coklat dan marshmallow',                                     8000.00),
    ('prd-014','kat-001','Tiramisu',        'Mochi dengan isian tiramisu yang creamy',                                       8000.00),
    ('prd-015','kat-001','Oreo Berry',      'Mochi dengan isian oreo dan stroberi',                                          8000.00),
    ('prd-016','kat-001','Cream Redvelvet', 'Mochi dengan isian cream dan kulit redvelvet',                                  7000.00),
    ('prd-017','kat-001','Cream Caramel',   'Mochi dengan isian cream dan caramel yang manis',                               7000.00)`,

  // 5. stok_outlet (17 × 3 outlet)
  `INSERT IGNORE INTO stok_outlet (id_stok_outlet, id_produk, id_outlet, jumlah_stok) VALUES
    ('stok-001','prd-001','otl-001',50),('stok-002','prd-002','otl-001',50),
    ('stok-003','prd-003','otl-001',50),('stok-004','prd-004','otl-001',50),
    ('stok-005','prd-005','otl-001',50),('stok-006','prd-006','otl-001',50),
    ('stok-007','prd-007','otl-001',50),('stok-008','prd-008','otl-001',50),
    ('stok-009','prd-009','otl-001',50),('stok-010','prd-010','otl-001',50),
    ('stok-011','prd-011','otl-001',50),('stok-012','prd-012','otl-001',50),
    ('stok-013','prd-013','otl-001',50),('stok-014','prd-014','otl-001',50),
    ('stok-015','prd-015','otl-001',50),('stok-016','prd-016','otl-001',50),
    ('stok-017','prd-017','otl-001',50),
    ('stok-018','prd-001','otl-002',30),('stok-019','prd-002','otl-002',30),
    ('stok-020','prd-003','otl-002',30),('stok-021','prd-004','otl-002',30),
    ('stok-022','prd-005','otl-002',30),('stok-023','prd-006','otl-002',30),
    ('stok-024','prd-007','otl-002',30),('stok-025','prd-008','otl-002',30),
    ('stok-026','prd-009','otl-002',30),('stok-027','prd-010','otl-002',30),
    ('stok-028','prd-011','otl-002',30),('stok-029','prd-012','otl-002',30),
    ('stok-030','prd-013','otl-002',30),('stok-031','prd-014','otl-002',30),
    ('stok-032','prd-015','otl-002',30),('stok-033','prd-016','otl-002',30),
    ('stok-034','prd-017','otl-002',30),
    ('stok-035','prd-001','otl-003',30),('stok-036','prd-002','otl-003',30),
    ('stok-037','prd-003','otl-003',30),('stok-038','prd-004','otl-003',30),
    ('stok-039','prd-005','otl-003',30),('stok-040','prd-006','otl-003',30),
    ('stok-041','prd-007','otl-003',30),('stok-042','prd-008','otl-003',30),
    ('stok-043','prd-009','otl-003',30),('stok-044','prd-010','otl-003',30),
    ('stok-045','prd-011','otl-003',30),('stok-046','prd-012','otl-003',30),
    ('stok-047','prd-013','otl-003',30),('stok-048','prd-014','otl-003',30),
    ('stok-049','prd-015','otl-003',30),('stok-050','prd-016','otl-003',30),
    ('stok-051','prd-017','otl-003',30)`,

  // 6. bahan_baku
  `INSERT IGNORE INTO bahan_baku (id_bahan_baku, nama_bahan, satuan) VALUES
    ('bb-001','Tepung Ketan',     'kg'),
    ('bb-002','Gula Pasir',       'kg'),
    ('bb-003','Susu UHT',         'liter'),
    ('bb-004','Coklat Batang',    'kg'),
    ('bb-005','Keju Cheddar',     'kg'),
    ('bb-006','Matcha Powder',    'gram'),
    ('bb-007','Kacang Merah',     'kg'),
    ('bb-008','Stroberi',         'kg'),
    ('bb-009','Oreo',             'pcs'),
    ('bb-010','Cream Cheese',     'kg'),
    ('bb-011','Marshmallow',      'gram'),
    ('bb-012','Biskuit',          'pcs'),
    ('bb-013','Coklat Silverqueen','kg'),
    ('bb-014','Milo Powder',      'gram'),
    ('bb-015','Pasta Tiramisu',   'gram'),
    ('bb-016','Pasta Redvelvet',  'gram'),
    ('bb-017','Caramel Sauce',    'gram')`,

  // 7. stok_bahan_baku
  `INSERT IGNORE INTO stok_bahan_baku (id_stok_bb, id_bahan_baku, jumlah_stok, stok_minimum) VALUES
    ('stk-001','bb-001', 50.00,10.00),('stk-002','bb-002', 30.00, 5.00),
    ('stk-003','bb-003', 20.00, 5.00),('stk-004','bb-004', 15.00, 3.00),
    ('stk-005','bb-005', 10.00, 2.00),('stk-006','bb-006',500.00,100.00),
    ('stk-007','bb-007', 10.00, 2.00),('stk-008','bb-008', 15.00, 3.00),
    ('stk-009','bb-009',100.00,20.00),('stk-010','bb-010', 10.00, 2.00),
    ('stk-011','bb-011',500.00,100.00),('stk-012','bb-012',200.00,50.00),
    ('stk-013','bb-013', 10.00, 2.00),('stk-014','bb-014',500.00,100.00),
    ('stk-015','bb-015',500.00,100.00),('stk-016','bb-016',500.00,100.00),
    ('stk-017','bb-017',500.00,100.00)`,

  // 8. pengeluaran
  `INSERT IGNORE INTO pengeluaran (id_pengeluaran, id_pengguna, tanggal, biaya, deskripsi) VALUES
    ('pel-001','usr-001','2025-01-05', 500000,'Pembelian tepung ketan 10kg'),
    ('pel-002','usr-001','2025-01-10', 200000,'Pembelian gula pasir 10kg'),
    ('pel-003','usr-001','2025-02-05', 300000,'Pembelian coklat batang'),
    ('pel-004','usr-001','2025-02-15', 250000,'Pembelian keju cheddar'),
    ('pel-005','usr-001','2025-03-01', 150000,'Pembelian matcha powder'),
    ('pel-006','usr-001','2025-03-10', 180000,'Pembelian stroberi segar'),
    ('pel-007','usr-001','2025-04-01', 100000,'Biaya operasional outlet pusat'),
    ('pel-008','usr-001','2025-04-15',  80000,'Biaya operasional outlet cabang 1'),
    ('pel-009','usr-001','2025-05-01', 400000,'Pembelian tepung ketan 10kg'),
    ('pel-010','usr-001','2025-05-10', 350000,'Pembelian coklat silverqueen'),
    ('pel-011','usr-001','2025-06-01', 200000,'Pembelian cream cheese'),
    ('pel-012','usr-001','2025-07-05', 120000,'Pembelian marshmallow'),
    ('pel-013','usr-001','2025-08-01', 500000,'Pembelian tepung ketan 10kg'),
    ('pel-014','usr-001','2025-09-10', 170000,'Pembelian pasta tiramisu'),
    ('pel-015','usr-001','2025-10-01', 160000,'Pembelian pasta redvelvet'),
    ('pel-016','usr-001','2025-11-05', 190000,'Pembelian caramel sauce'),
    ('pel-017','usr-001','2025-12-01', 500000,'Pembelian tepung ketan akhir tahun'),
    ('pel-018','usr-001','2025-12-15',  90000,'Biaya listrik semua outlet')`,

  // 9. penggunaan_bahan_baku
  `INSERT IGNORE INTO penggunaan_bahan_baku
    (id_penggunaan, id_bahan_baku, id_pengguna, jumlah_digunakan, catatan, tanggal) VALUES
    ('pgu-001','bb-001','usr-004',  5.00,'Produksi mochi batch pagi',    '2025-01-01'),
    ('pgu-002','bb-002','usr-004',  2.00,'Produksi mochi batch pagi',    '2025-01-01'),
    ('pgu-003','bb-004','usr-004',  1.50,'Produksi isian coklat',        '2025-02-01'),
    ('pgu-004','bb-006','usr-005',200.00,'Produksi isian matcha',        '2025-03-01'),
    ('pgu-005','bb-007','usr-005',  2.00,'Produksi isian kacang merah',  '2025-04-01'),
    ('pgu-006','bb-008','usr-005',  3.00,'Produksi isian stroberi',      '2025-05-01'),
    ('pgu-007','bb-001','usr-004',  4.00,'Produksi mochi batch siang',   '2025-06-01'),
    ('pgu-008','bb-013','usr-004',  2.00,'Produksi double choco',        '2025-07-01'),
    ('pgu-009','bb-011','usr-005',300.00,'Produksi choco mallow',        '2025-08-01'),
    ('pgu-010','bb-015','usr-004',250.00,'Produksi tiramisu',            '2025-09-01')`,

  // 10. laporan
  `INSERT IGNORE INTO laporan
    (id_laporan, id_outlet, id_pengguna, jenis_laporan,
     periode_bulan, periode_tahun, total_pendapatan, total_pengeluaran) VALUES
    ('lap-001','otl-001','usr-001','bulanan', 1,2025, 8500000,  700000),
    ('lap-002','otl-001','usr-001','bulanan', 2,2025, 9200000,  550000),
    ('lap-003','otl-001','usr-001','bulanan', 3,2025, 9800000,  630000),
    ('lap-004','otl-001','usr-001','bulanan', 4,2025, 8700000,  580000),
    ('lap-005','otl-001','usr-001','bulanan', 5,2025, 9500000,  750000),
    ('lap-006','otl-001','usr-001','bulanan', 6,2025,10200000,  620000),
    ('lap-007','otl-001','usr-001','bulanan', 7,2025,11000000,  590000),
    ('lap-008','otl-001','usr-001','bulanan', 8,2025,10500000,  700000),
    ('lap-009','otl-001','usr-001','bulanan', 9,2025, 9300000,  670000),
    ('lap-010','otl-001','usr-001','bulanan',10,2025, 9700000,  610000),
    ('lap-011','otl-001','usr-001','bulanan',11,2025,10100000,  580000),
    ('lap-012','otl-001','usr-001','bulanan',12,2025,12500000,  790000),
    ('lap-013', NULL,    'usr-001','tahunan',NULL,2025,118000000,7570000)`,

  // 11. laporan_pengeluaran
  `INSERT IGNORE INTO laporan_pengeluaran (id_laporan, id_pengeluaran) VALUES
    ('lap-001','pel-001'),('lap-001','pel-002'),
    ('lap-002','pel-003'),('lap-002','pel-004'),
    ('lap-003','pel-005'),('lap-003','pel-006'),
    ('lap-004','pel-007'),('lap-004','pel-008'),
    ('lap-005','pel-009'),('lap-005','pel-010'),
    ('lap-006','pel-011'),
    ('lap-007','pel-012'),
    ('lap-008','pel-013'),
    ('lap-009','pel-014'),
    ('lap-010','pel-015'),
    ('lap-011','pel-016'),
    ('lap-012','pel-017'),('lap-012','pel-018'),
    ('lap-013','pel-001'),('lap-013','pel-002'),('lap-013','pel-003'),
    ('lap-013','pel-004'),('lap-013','pel-005'),('lap-013','pel-006'),
    ('lap-013','pel-007'),('lap-013','pel-008'),('lap-013','pel-009'),
    ('lap-013','pel-010'),('lap-013','pel-011'),('lap-013','pel-012'),
    ('lap-013','pel-013'),('lap-013','pel-014'),('lap-013','pel-015'),
    ('lap-013','pel-016'),('lap-013','pel-017'),('lap-013','pel-018')`,
];

const STATIC_LABELS = [
  "pengguna",
  "outlet",
  "kategori",
  "produk",
  "stok_outlet",
  "bahan_baku",
  "stok_bahan_baku",
  "pengeluaran",
  "penggunaan_bahan_baku",
  "laporan",
  "laporan_pengeluaran",
];

// ============================================================
//  INSERT BATCH — hindari query string terlalu besar
// ============================================================
async function insertBatch(connection, table, columns, rows, batchSize = 500) {
  let inserted = 0;
  for (let i = 0; i < rows.length; i += batchSize) {
    const chunk = rows.slice(i, i + batchSize);
    const sql = `INSERT IGNORE INTO ${table} (${columns}) VALUES ${chunk.join(",")}`;
    const [res] = await connection.query(sql);
    inserted += res.affectedRows;
  }
  return inserted;
}

// ============================================================
//  SEED FUNCTIONS
// ============================================================
async function seedStatic(connection) {
  console.log("\n[ SEED DATA STATIS ]");
  for (let i = 0; i < STATIC_SEED_QUERIES.length; i++) {
    const [result] = await connection.query(STATIC_SEED_QUERIES[i]);
    console.log(`  ✓ "${STATIC_LABELS[i]}" — ${result.affectedRows} baris`);
  }
}

async function seedTransaksi(connection, tahun = 2025) {
  console.log(`\n[ GENERATE TRANSAKSI TAHUN ${tahun} ]`);
  console.log("  ⏳ Generating data (harap tunggu)...");

  const { transaksiRows, detailRows } = generateTransaksiSetahun(tahun);

  console.log(
    `  ℹ  Generated: ${transaksiRows.length.toLocaleString()} transaksi, ` +
      `${detailRows.length.toLocaleString()} detail transaksi`,
  );

  const trxInserted = await insertBatch(
    connection,
    "transaksi",
    "id_transaksi, id_outlet, id_pengguna, tanggal, total_harga, metode_bayar, status",
    transaksiRows,
  );
  console.log(
    `  ✓ "transaksi"       — ${trxInserted.toLocaleString()} baris dimasukkan`,
  );

  const dtlInserted = await insertBatch(
    connection,
    "detail_transaksi",
    "id_detail, id_transaksi, id_produk, jumlah, harga_satuan, subtotal",
    detailRows,
  );
  console.log(
    `  ✓ "detail_transaksi"— ${dtlInserted.toLocaleString()} baris dimasukkan`,
  );
}

async function seedProduk(connection) {
  console.log("\n[ SEED KATEGORI & PRODUK SAJA ]");
  for (const i of [2, 3]) {
    const [result] = await connection.query(STATIC_SEED_QUERIES[i]);
    console.log(`  ✓ "${STATIC_LABELS[i]}" — ${result.affectedRows} baris`);
  }
}

// ============================================================
//  ENTRY POINT
// ============================================================
async function main() {
  const args = process.argv.slice(2);
  const onlyProduk = args.includes("--produk");
  const onlyTransaksi = args.includes("--transaksi");

  const tahunArg = args.find((a) => /^\d{4}$/.test(a));
  const tahun = tahunArg ? parseInt(tahunArg, 10) : 2025;

  const connection = await mysql.createConnection(DB_CONFIG);

  try {
    if (onlyProduk) {
      await seedProduk(connection);
    } else if (onlyTransaksi) {
      await seedTransaksi(connection, tahun);
    } else {
      await seedStatic(connection);
      await seedTransaksi(connection, tahun);
    }

    console.log("\n✅ Selesai.\n");
  } catch (err) {
    console.error("\n❌ Error:", err.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

main();
