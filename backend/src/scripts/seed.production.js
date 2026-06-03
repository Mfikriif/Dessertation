// ============================================================
//  seed.production.js
//  Seeder data produksi — transaksi di-generate otomatis 1 tahun
//  Stack: Node.js + mysql2
//
//  Cara pakai:
//    node seed.production.js               → seed semua tabel (tahun berjalan)
//    node seed.production.js --produk      → hanya kategori + produk
//    node seed.production.js --transaksi   → hanya transaksi + detail (tahun berjalan)
//    node seed.production.js --transaksi 2024 → tahun tertentu
//
//  Catatan:
//    - Jika tidak ada argumen tahun, default = tahun saat ini
//    - Jika dijalankan di tengah tahun, transaksi hanya di-generate
//      s.d. bulan & hari saat seed dijalankan (bukan sampai Desember)
//    - Password semua pengguna: 123456 (di-hash bcrypt)
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
  { id: "otl-004", kasir: ["usr-002", "usr-003"] },
];

// Distribusi produk ke 3 kategori yang tepat:
//   kat-001 → Mochi Choco Series  (produk berbasis coklat, matcha choco, silverqueen, tiramisu, dll.)
//   kat-002 → Mochi Fresh Series  (produk berbasis buah segar / berry / redvelvet)
//   kat-003 → Mochi Cream Series  (produk berbasis cream / biskuit / caramel)
const PRODUK = [
  { id: "prd-001", harga: 8000 }, // Milo              → kat-001
  { id: "prd-002", harga: 8000 }, // Choco Macha       → kat-001
  { id: "prd-003", harga: 8000 }, // Choco Cheese      → kat-001
  { id: "prd-004", harga: 8000 }, // Matcha Berry      → kat-002
  { id: "prd-005", harga: 8000 }, // Redbean Berry     → kat-002
  { id: "prd-006", harga: 8000 }, // Cookies and Cream → kat-003
  { id: "prd-007", harga: 8000 }, // Cheese Oreo       → kat-003
  { id: "prd-008", harga: 7000 }, // Cream Biskuit     → kat-003
  { id: "prd-009", harga: 7000 }, // Cream Matcha      → kat-001
  { id: "prd-010", harga: 8000 }, // Choco Berry       → kat-002
  { id: "prd-011", harga: 9000 }, // Double Choco      → kat-001
  { id: "prd-012", harga: 8000 }, // Choco Silverqueen → kat-001
  { id: "prd-013", harga: 8000 }, // Choco Mallow      → kat-001
  { id: "prd-014", harga: 8000 }, // Tiramisu          → kat-001
  { id: "prd-015", harga: 8000 }, // Oreo Berry        → kat-002
  { id: "prd-016", harga: 7000 }, // Cream Redvelvet   → kat-002
  { id: "prd-017", harga: 7000 }, // Cream Caramel     → kat-003
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
const fmtDate = (d) => d.toISOString().slice(0, 10);

// ============================================================
//  GENERATOR TRANSAKSI SETAHUN
//  - Jika tahun == tahun berjalan, generate hanya s.d. hari ini
//  - Jika tahun lalu / tahun lain, generate penuh Jan–Des
//
//  ID di-offset per tahun agar tidak collision saat multi-tahun:
//    trx: tahun 2024 → trx-000001..N, tahun 2025 → trx-200001..N, dst.
//    dtl: offset sama × 10 untuk ruang detail yang cukup
// ============================================================
function generateTransaksiSetahun(tahun) {
  const rng = makePrng(tahun * 7 + 42);

  const transaksiRows = [];
  const detailRows = [];

  // Offset ID unik per tahun — setiap tahun max ~15 trx × 3 outlet × 366 hari
  // = ~16.470 trx, dan detail max ~5 item × 16.470 = ~82.350
  // Offset 100.000 per tahun untuk trx dan 500.000 per tahun untuk dtl
  // Base tahun referensi = 2023 (tahun sebelum data mulai)
  const BASE_TAHUN = 2023;
  const TRX_OFFSET_PER_TAHUN = 100000;
  const DTL_OFFSET_PER_TAHUN = 500000;
  let trxCounter = (tahun - BASE_TAHUN) * TRX_OFFSET_PER_TAHUN;
  let dtlCounter = (tahun - BASE_TAHUN) * DTL_OFFSET_PER_TAHUN;

  const now = new Date();
  const tahunSekarang = now.getFullYear();

  // Batas akhir: kalau tahun berjalan → hari ini, kalau tidak → 31 Des
  const end =
    tahun === tahunSekarang
      ? new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
      : new Date(`${tahun}-12-31T23:59:59`);

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
//  GENERATOR PENGELUARAN & LAPORAN DINAMIS
//
//  Aturan per kondisi tahun:
//    tahun < sekarang  → pengeluaran + laporan bulanan full Jan–Des
//                        + laporan tahunan
//    tahun = sekarang  → pengeluaran s.d. bulan ini,
//                        laporan bulanan s.d. bulan lalu,
//                        belum ada laporan tahunan
//    tahun > sekarang  → tidak ada pengeluaran / laporan
//
//  ID di-offset per tahun agar tidak collision:
//    pengeluaran: BASE 2023, offset 100 per tahun (max 72 baris/tahun — 6 per bulan × 12)
//    laporan    : BASE 2023, offset 20 per tahun  (max 13 baris/tahun)
// ============================================================
function generatePengeluaranDanLaporan(tahun) {
  const now = new Date();
  const tahunSekarang = now.getFullYear();
  const bulanSekarang = now.getMonth() + 1; // 1–12

  const BASE_TAHUN = 2023;
  const PEL_OFFSET = (tahun - BASE_TAHUN) * 100;
  const LAP_OFFSET = (tahun - BASE_TAHUN) * 20;

  // Tentukan rentang bulan yang di-generate
  let maxBulanPengeluaran, maxBulanLaporan;
  if (tahun < tahunSekarang) {
    maxBulanPengeluaran = 12; // tahun lalu → full Jan–Des
    maxBulanLaporan = 12;
  } else if (tahun === tahunSekarang) {
    maxBulanPengeluaran = bulanSekarang; // s.d. bulan ini
    maxBulanLaporan = bulanSekarang > 1 ? bulanSekarang - 1 : 0; // s.d. bulan lalu
  } else {
    maxBulanPengeluaran = 0; // tahun depan → belum ada data
    maxBulanLaporan = 0;
  }

  // Template bahan pengeluaran per bulan — dirotasi tiap bulan
  // Setiap bulan menghasilkan 6 baris: 3 bahan baku + 3 operasional
  const templateBahanBaku = [
    { biaya: 500000, desc: "Pembelian tepung ketan 10kg" },
    { biaya: 200000, desc: "Pembelian gula pasir 10kg" },
    { biaya: 300000, desc: "Pembelian coklat batang" },
    { biaya: 250000, desc: "Pembelian keju cheddar" },
    { biaya: 150000, desc: "Pembelian matcha powder" },
    { biaya: 180000, desc: "Pembelian stroberi segar" },
    { biaya: 400000, desc: "Pembelian tepung ketan 10kg (restok)" },
    { biaya: 350000, desc: "Pembelian coklat silverqueen" },
    { biaya: 200000, desc: "Pembelian cream cheese" },
    { biaya: 120000, desc: "Pembelian marshmallow" },
    { biaya: 160000, desc: "Pembelian oreo & biskuit" },
    { biaya: 130000, desc: "Pembelian pasta tiramisu" },
  ];

  const templateOperasional = [
    { biayaBase: 80000, desc: (bln) => `Biaya listrik outlet bulan ${bln}` },
    { biayaBase: 50000, desc: (bln) => `Biaya air & kebersihan bulan ${bln}` },
    { biayaBase: 70000, desc: (bln) => `Biaya kemasan & plastik bulan ${bln}` },
    {
      biayaBase: 100000,
      desc: (bln) => `Biaya sewa tempat produksi bulan ${bln}`,
    },
    {
      biayaBase: 45000,
      desc: (bln) => `Biaya transportasi & pengiriman bulan ${bln}`,
    },
    {
      biayaBase: 60000,
      desc: (bln) => `Biaya perlengkapan produksi bulan ${bln}`,
    },
    {
      biayaBase: 90000,
      desc: (bln) => `Biaya internet & komunikasi bulan ${bln}`,
    },
    {
      biayaBase: 55000,
      desc: (bln) => `Biaya alat kebersihan outlet bulan ${bln}`,
    },
    { biayaBase: 75000, desc: (bln) => `Biaya servis peralatan bulan ${bln}` },
    {
      biayaBase: 40000,
      desc: (bln) => `Biaya promosi & sosial media bulan ${bln}`,
    },
    {
      biayaBase: 65000,
      desc: (bln) => `Biaya stiker & label produk bulan ${bln}`,
    },
    { biayaBase: 85000, desc: (bln) => `Biaya gas LPG produksi bulan ${bln}` },
  ];

  // Estimasi pendapatan bulanan per outlet (realistis)
  const estimasiPendapatan = [
    8500000, 9200000, 9800000, 8700000, 9500000, 10200000, 11000000, 10500000,
    9300000, 9700000, 10100000, 12500000,
  ];

  const pengeluaranRows = [];
  const pengeluaranIds = []; // { id, bulan, biaya }
  let pelCounter = PEL_OFFSET;

  for (let bln = 1; bln <= maxBulanPengeluaran; bln++) {
    // Baris 1–3: bahan baku (dirotasi dari templateBahanBaku)
    for (let i = 0; i < 3; i++) {
      const tpl =
        templateBahanBaku[((bln - 1) * 3 + i) % templateBahanBaku.length];
      pelCounter++;
      const pelId = `pel-${pad(pelCounter, 3)}`;
      const tgl = `${tahun}-${String(bln).padStart(2, "0")}-${String(3 + i * 4).padStart(2, "0")}`;
      pengeluaranRows.push(
        `('${pelId}','usr-001','${tgl}',${tpl.biaya},'${tpl.desc}')`,
      );
      pengeluaranIds.push({ id: pelId, bulan: bln, biaya: tpl.biaya });
    }

    // Baris 4–6: operasional (dirotasi dari templateOperasional)
    for (let i = 0; i < 3; i++) {
      const tpl =
        templateOperasional[((bln - 1) * 3 + i) % templateOperasional.length];
      pelCounter++;
      const pelId = `pel-${pad(pelCounter, 3)}`;
      const tgl = `${tahun}-${String(bln).padStart(2, "0")}-${String(15 + i * 4).padStart(2, "0")}`;
      const biaya = tpl.biayaBase + bln * 2000;
      pengeluaranRows.push(
        `('${pelId}','usr-001','${tgl}',${biaya},'${tpl.desc(bln)}')`,
      );
      pengeluaranIds.push({ id: pelId, bulan: bln, biaya });
    }
  }

  // Laporan bulanan
  const laporanRows = [];
  const laporanPengeluaranRows = [];
  let lapCounter = LAP_OFFSET;

  for (let bln = 1; bln <= maxBulanLaporan; bln++) {
    lapCounter++;
    const lapId = `lap-${pad(lapCounter, 3)}`;
    const pendapatan = estimasiPendapatan[bln - 1] || 9000000;

    // Hitung total pengeluaran bulan ini langsung dari biaya yang sudah disimpan
    const pengeluaranBulanIni = pengeluaranIds.filter((p) => p.bulan === bln);
    const totalPengeluaran = pengeluaranBulanIni.reduce(
      (acc, p) => acc + p.biaya,
      0,
    );

    laporanRows.push(
      `('${lapId}','otl-001','usr-001','bulanan',${bln},${tahun},${pendapatan},${totalPengeluaran})`,
    );

    for (const p of pengeluaranBulanIni) {
      laporanPengeluaranRows.push(`('${lapId}','${p.id}')`);
    }
  }

  // Laporan tahunan hanya jika tahun sudah lewat
  let laporanTahunanRow = null;
  let laporanTahunanPengeluaranRows = [];
  if (tahun < tahunSekarang) {
    lapCounter++;
    const lapIdTahunan = `lap-${pad(lapCounter, 3)}`;
    const totalTahunan = estimasiPendapatan.reduce((a, b) => a + b, 0);
    const totalPengeluaranTahunan = pengeluaranIds.reduce(
      (a, p) => a + p.biaya,
      0,
    );
    laporanTahunanRow = `('${lapIdTahunan}',NULL,'usr-001','tahunan',NULL,${tahun},${totalTahunan},${totalPengeluaranTahunan})`;
    for (const p of pengeluaranIds) {
      laporanTahunanPengeluaranRows.push(`('${lapIdTahunan}','${p.id}')`);
    }
  }

  return {
    pengeluaranRows,
    laporanRows,
    laporanPengeluaranRows,
    laporanTahunanRow,
    laporanTahunanPengeluaranRows,
    maxBulanPengeluaran,
    maxBulanLaporan,
  };
}

// ============================================================
//  STATIC SEED QUERIES
// ============================================================
function buildStaticSeedQueries(tahun) {
  const now = new Date();
  const {
    pengeluaranRows,
    laporanRows,
    laporanPengeluaranRows,
    laporanTahunanRow,
    laporanTahunanPengeluaranRows,
    maxBulanPengeluaran,
    maxBulanLaporan,
  } = generatePengeluaranDanLaporan(tahun);

  const allLaporanRows = laporanTahunanRow
    ? [...laporanRows, laporanTahunanRow]
    : laporanRows;

  const allLaporanPengeluaranRows = [
    ...laporanPengeluaranRows,
    ...laporanTahunanPengeluaranRows,
  ];

  // Filter query kosong (bisa terjadi dari IIFE jika semua baris di-skip)
  return [
    // 1. pengguna — password semua: 123456 (bcrypt hash, salt=10)
    //    Hash di-generate saat build seeder ini; regenerate jika perlu
    //    dengan: node -e "require('bcrypt').hash('123456',10).then(console.log)"
    `INSERT IGNORE INTO pengguna (id_pengguna, nama, email, password, role) VALUES
      ('usr-001', 'Admin Utama',        'admin@mochi.com',  '$2b$10$MyCh.tRGWtXvnJym6shaZ.D4/vk8I2XlUbHxEn7/FgJ.zJCekYvRG', 'admin'),
      ('usr-002', 'Kasir Satu',         'kasir1@mochi.com', '$2b$10$Cx6eqnhnhojOTzNvD4Pav.8cvOstTd10DiynVkETNlRdbSncabMB.', 'kasir'),
      ('usr-003', 'Kasir Dua',          'kasir2@mochi.com', '$2b$10$stpAB1og.wP4BT2kLDN9A.Wgj7Gtu06l3qwbd.M5nPJRTq4wY3se2', 'kasir'),
      ('usr-004', 'Staff Produksi Satu','prod1@mochi.com',  '$2b$10$IGOo4cser7STGkRbssnwKeOg6XvaZOxSm2quNhvoCqE7GGfqOU/.O', 'staff_produksi'),
      ('usr-005', 'Staff Produksi Dua', 'prod2@mochi.com',  '$2b$10$56DV13rhPMB.Fd5NxjAEiu2njVSHL2mUP/tRmQdPRVt8uvHNaj6za', 'staff_produksi')`,

    // 2. outlet
    `INSERT IGNORE INTO outlet (id_outlet, nama_outlet, alamat) VALUES
      ('otl-001', 'Outlet Tembalang',   'Jl. Timoho Raya No. 1'),
      ('otl-002', 'Outlet Klipang',     'Jl. Klipang Raya No. 2'),
      ('otl-003', 'Outlet Sambiroto',   'Jl. Sambiroto Raya No. 3'),
      ('otl-004', 'Outlet Pedurungan',  'Jl. Pedurungan No. 4')`,

    // 3. kategori
    `INSERT IGNORE INTO kategori (id_kategori, kode_kategori, nama_kategori) VALUES
      ('kat-001', 'MCHC', 'Mochi Choco Series'),
      ('kat-002', 'MCHF', 'Mochi Fresh Series'),
      ('kat-003', 'MCS',  'Mochi Cream Series')`,

    // 4. produk — disesuaikan dengan kategori yang benar
    //
    //   kat-001 (Mochi Choco Series):
    //     Produk berbasis coklat, matcha-choco, silverqueen, tiramisu, milo
    //   kat-002 (Mochi Fresh Series):
    //     Produk berbasis buah segar (berry, stroberi), redvelvet, matcha-berry, redbean-berry, oreo-berry
    //   kat-003 (Mochi Cream Series):
    //     Produk berbasis cream, biskuit, caramel, cookies & cream, cheese oreo
    `INSERT IGNORE INTO produk (id_produk, id_kategori, nama_produk, deskripsi, harga) VALUES
      ('prd-001','kat-001','Milo',             'Mochi dengan isian coklat milo',                                                8000.00),
      ('prd-002','kat-001','Choco Macha',      'Mochi dengan isian coklat dan matcha',                                          8000.00),
      ('prd-003','kat-001','Choco Cheese',     'Mochi dengan isian coklat dan keju',                                            8000.00),
      ('prd-004','kat-002','Matcha Berry',     'Mochi dengan cream matcha dan stroberi',                                        8000.00),
      ('prd-005','kat-002','Redbean Berry',    'Mochi dengan isian kacang merah dan stroberi',                                  8000.00),
      ('prd-006','kat-003','Cookies and Cream','Mochi dengan rasa cookies and cream',                                           8000.00),
      ('prd-007','kat-003','Cheese Oreo',      'Mochi dengan isian keju yang creamy dan oreo',                                  8000.00),
      ('prd-008','kat-003','Cream Biskuit',    'Mochi biskuit',                                                                 7000.00),
      ('prd-009','kat-001','Cream Matcha',     'Mochi dengan taburan matcha dan isian cream',                                   7000.00),
      ('prd-010','kat-002','Choco Berry',      'Mochi dengan isian coklat dan stroberi',                                        8000.00),
      ('prd-011','kat-001','Double Choco',     'Mochi dengan isian lelehan coklat silverqueen dan potongan coklat silverqueen', 9000.00),
      ('prd-012','kat-001','Choco Silverqueen','Mochi dengan isian coklat silverqueen',                                         8000.00),
      ('prd-013','kat-001','Choco Mallow',     'Mochi dengan isian coklat dan marshmallow',                                     8000.00),
      ('prd-014','kat-001','Tiramisu',         'Mochi dengan isian tiramisu yang creamy',                                       8000.00),
      ('prd-015','kat-002','Oreo Berry',       'Mochi dengan isian oreo dan stroberi',                                          8000.00),
      ('prd-016','kat-002','Cream Redvelvet',  'Mochi dengan isian cream dan kulit redvelvet',                                  7000.00),
      ('prd-017','kat-003','Cream Caramel',    'Mochi dengan isian cream dan caramel yang manis',                               7000.00)`,

    // 5. stok_outlet (17 produk × 4 outlet)
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
      ('stok-051','prd-017','otl-003',30),
      ('stok-052','prd-001','otl-004',25),('stok-053','prd-002','otl-004',25),
      ('stok-054','prd-003','otl-004',25),('stok-055','prd-004','otl-004',25),
      ('stok-056','prd-005','otl-004',25),('stok-057','prd-006','otl-004',25),
      ('stok-058','prd-007','otl-004',25),('stok-059','prd-008','otl-004',25),
      ('stok-060','prd-009','otl-004',25),('stok-061','prd-010','otl-004',25),
      ('stok-062','prd-011','otl-004',25),('stok-063','prd-012','otl-004',25),
      ('stok-064','prd-013','otl-004',25),('stok-065','prd-014','otl-004',25),
      ('stok-066','prd-015','otl-004',25),('stok-067','prd-016','otl-004',25),
      ('stok-068','prd-017','otl-004',25)`,

    // 6. bahan_baku
    `INSERT IGNORE INTO bahan_baku (id_bahan_baku, nama_bahan, satuan) VALUES
      ('bb-001','Tepung Ketan',      'kg'),
      ('bb-002','Gula Pasir',        'kg'),
      ('bb-003','Susu UHT',          'liter'),
      ('bb-004','Coklat Batang',     'kg'),
      ('bb-005','Keju Cheddar',      'kg'),
      ('bb-006','Matcha Powder',     'gram'),
      ('bb-007','Kacang Merah',      'kg'),
      ('bb-008','Stroberi',          'kg'),
      ('bb-009','Oreo',              'pcs'),
      ('bb-010','Cream Cheese',      'kg'),
      ('bb-011','Marshmallow',       'gram'),
      ('bb-012','Biskuit',           'pcs'),
      ('bb-013','Coklat Silverqueen','kg'),
      ('bb-014','Milo Powder',       'gram'),
      ('bb-015','Pasta Tiramisu',    'gram'),
      ('bb-016','Pasta Redvelvet',   'gram'),
      ('bb-017','Caramel Sauce',     'gram')`,

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

    // 8. pengeluaran — di-generate dinamis sesuai kondisi tahun
    ...(pengeluaranRows.length > 0
      ? [
          `INSERT IGNORE INTO pengeluaran (id_pengeluaran, id_pengguna, tanggal, biaya, deskripsi) VALUES
      ${pengeluaranRows.join(",\n      ")}`,
        ]
      : []),

    // 9. penggunaan_bahan_baku
    //    Hanya insert baris yang tanggalnya sudah lewat atau sama dengan hari ini
    (() => {
      const now = new Date();
      const semuaBaris = [
        {
          id: "pgu-001",
          bb: "bb-001",
          usr: "usr-004",
          jml: 5.0,
          cat: "Produksi mochi batch pagi",
          tgl: `${tahun}-01-01`,
        },
        {
          id: "pgu-002",
          bb: "bb-002",
          usr: "usr-004",
          jml: 2.0,
          cat: "Produksi mochi batch pagi",
          tgl: `${tahun}-01-01`,
        },
        {
          id: "pgu-003",
          bb: "bb-004",
          usr: "usr-004",
          jml: 1.5,
          cat: "Produksi isian coklat",
          tgl: `${tahun}-02-01`,
        },
        {
          id: "pgu-004",
          bb: "bb-006",
          usr: "usr-005",
          jml: 200.0,
          cat: "Produksi isian matcha",
          tgl: `${tahun}-03-01`,
        },
        {
          id: "pgu-005",
          bb: "bb-007",
          usr: "usr-005",
          jml: 2.0,
          cat: "Produksi isian kacang merah",
          tgl: `${tahun}-04-01`,
        },
        {
          id: "pgu-006",
          bb: "bb-008",
          usr: "usr-005",
          jml: 3.0,
          cat: "Produksi isian stroberi",
          tgl: `${tahun}-05-01`,
        },
        {
          id: "pgu-007",
          bb: "bb-001",
          usr: "usr-004",
          jml: 4.0,
          cat: "Produksi mochi batch siang",
          tgl: `${tahun}-06-01`,
        },
        {
          id: "pgu-008",
          bb: "bb-013",
          usr: "usr-004",
          jml: 2.0,
          cat: "Produksi double choco",
          tgl: `${tahun}-07-01`,
        },
        {
          id: "pgu-009",
          bb: "bb-011",
          usr: "usr-005",
          jml: 300.0,
          cat: "Produksi choco mallow",
          tgl: `${tahun}-08-01`,
        },
        {
          id: "pgu-010",
          bb: "bb-015",
          usr: "usr-004",
          jml: 250.0,
          cat: "Produksi tiramisu",
          tgl: `${tahun}-09-01`,
        },
      ];
      const valid = semuaBaris.filter((b) => new Date(b.tgl) <= now);
      if (valid.length === 0) return "";
      const values = valid
        .map(
          (b) =>
            `('${b.id}','${b.bb}','${b.usr}',${b.jml},'${b.cat}','${b.tgl}')`,
        )
        .join(",\n      ");
      return `INSERT IGNORE INTO penggunaan_bahan_baku
      (id_penggunaan, id_bahan_baku, id_pengguna, jumlah_digunakan, catatan, tanggal) VALUES
      ${values}`;
    })(),

    // 10. laporan — di-generate dinamis s.d. bulan lalu
    ...(allLaporanRows.length > 0
      ? [
          `INSERT IGNORE INTO laporan
            (id_laporan, id_outlet, id_pengguna, jenis_laporan,
             periode_bulan, periode_tahun, total_pendapatan, total_pengeluaran) VALUES
            ${allLaporanRows.join(",\n            ")}`,
        ]
      : []),

    // 11. laporan_pengeluaran
    ...(allLaporanPengeluaranRows.length > 0
      ? [
          `INSERT IGNORE INTO laporan_pengeluaran (id_laporan, id_pengeluaran) VALUES
            ${allLaporanPengeluaranRows.join(",\n            ")}`,
        ]
      : []),
  ].filter(Boolean); // buang string kosong (misal dari IIFE yang return '')
}

const STATIC_LABELS_BASE = [
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
async function seedStatic(connection, tahun) {
  const queries = buildStaticSeedQueries(tahun);
  const now = new Date();
  const bulanSekarang = now.getMonth() + 1;
  const tahunSekarang = now.getFullYear();

  console.log("\n[ SEED DATA STATIS ]");
  if (tahun < tahunSekarang) {
    console.log(
      `  ℹ  Tahun lalu (${tahun}) — pengeluaran & laporan full Jan–Des + laporan tahunan`,
    );
  } else if (tahun === tahunSekarang) {
    console.log(
      `  ℹ  Tahun berjalan (${tahun}) — pengeluaran s.d. bulan ${bulanSekarang}, laporan s.d. bulan ${bulanSekarang > 1 ? bulanSekarang - 1 : "-"}`,
    );
  }

  for (const query of queries) {
    if (!query) continue; // skip query kosong
    const [result] = await connection.query(query);
    // Deteksi nama tabel dari query untuk label log
    const matchTabel = query.match(/INTO\s+(\w+)/i);
    const label = matchTabel ? matchTabel[1] : "query";
    console.log(`  ✓ "${label}" — ${result.affectedRows} baris`);
  }
}

async function seedTransaksi(connection, tahun) {
  const now = new Date();
  const tahunSekarang = now.getFullYear();
  const keterangan =
    tahun === tahunSekarang ? `s.d. ${fmtDate(now)}` : `penuh Jan–Des ${tahun}`;

  console.log(`\n[ GENERATE TRANSAKSI TAHUN ${tahun} (${keterangan}) ]`);
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
    `  ✓ "transaksi"        — ${trxInserted.toLocaleString()} baris dimasukkan`,
  );

  const dtlInserted = await insertBatch(
    connection,
    "detail_transaksi",
    "id_detail, id_transaksi, id_produk, jumlah, harga_satuan, subtotal",
    detailRows,
  );
  console.log(
    `  ✓ "detail_transaksi" — ${dtlInserted.toLocaleString()} baris dimasukkan`,
  );
}

async function seedProduk(connection, tahun) {
  console.log("\n[ SEED KATEGORI & PRODUK SAJA ]");
  const queries = buildStaticSeedQueries(tahun);
  // index 2 = kategori, 3 = produk
  for (const i of [2, 3]) {
    const [result] = await connection.query(queries[i]);
    console.log(
      `  ✓ "${STATIC_LABELS_BASE[i]}" — ${result.affectedRows} baris`,
    );
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
  // Default: tahun berjalan
  const tahun = tahunArg ? parseInt(tahunArg, 10) : new Date().getFullYear();

  const connection = await mysql.createConnection(DB_CONFIG);

  try {
    if (onlyProduk) {
      await seedProduk(connection, tahun);
    } else if (onlyTransaksi) {
      await seedTransaksi(connection, tahun);
    } else {
      await seedStatic(connection, tahun);
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
