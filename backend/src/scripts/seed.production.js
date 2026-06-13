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
//    node seed.production.js --stok-harian → hanya stok_outlet 3 hari (kemarin-kemarin, kemarin, hari ini)
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
//  DATA REFERENSI (MASTER)
// ============================================================

const OUTLETS = [
  { id: "otl-001", kasir: ["usr-002"], stokAwal: 25 },
  { id: "otl-002", kasir: ["usr-003"], stokAwal: 20 },
  { id: "otl-003", kasir: ["usr-002", "usr-003"], stokAwal: 15 },
  { id: "otl-004", kasir: ["usr-002", "usr-003"], stokAwal: 22 },
];

const PRODUK = [
  {
    id: "prd-001",
    kat: "kat-001",
    harga: 8000,
    nama: "Milo",
    desc: "Mochi dengan isian coklat milo",
  },
  {
    id: "prd-002",
    kat: "kat-001",
    harga: 8000,
    nama: "Choco Macha",
    desc: "Mochi dengan isian coklat dan matcha",
  },
  {
    id: "prd-003",
    kat: "kat-001",
    harga: 8000,
    nama: "Choco Cheese",
    desc: "Mochi dengan isian coklat dan keju",
  },
  {
    id: "prd-004",
    kat: "kat-002",
    harga: 8000,
    nama: "Matcha Berry",
    desc: "Mochi dengan cream matcha dan stroberi",
  },
  {
    id: "prd-005",
    kat: "kat-002",
    harga: 8000,
    nama: "Redbean Berry",
    desc: "Mochi dengan isian kacang merah dan stroberi",
  },
  {
    id: "prd-006",
    kat: "kat-003",
    harga: 8000,
    nama: "Cookies and Cream",
    desc: "Mochi dengan rasa cookies and cream",
  },
  {
    id: "prd-007",
    kat: "kat-003",
    harga: 8000,
    nama: "Cheese Oreo",
    desc: "Mochi dengan isian keju yang creamy dan oreo",
  },
  {
    id: "prd-008",
    kat: "kat-003",
    harga: 7000,
    nama: "Cream Biskuit",
    desc: "Mochi biskuit",
  },
  {
    id: "prd-009",
    kat: "kat-001",
    harga: 7000,
    nama: "Cream Matcha",
    desc: "Mochi dengan taburan matcha dan isian cream",
  },
  {
    id: "prd-010",
    kat: "kat-002",
    harga: 8000,
    nama: "Choco Berry",
    desc: "Mochi dengan isian coklat dan stroberi",
  },
  {
    id: "prd-011",
    kat: "kat-001",
    harga: 9000,
    nama: "Double Choco",
    desc: "Mochi dengan isian lelehan coklat dan potongan silverqueen",
  },
  {
    id: "prd-012",
    kat: "kat-001",
    harga: 8000,
    nama: "Choco Silverqueen",
    desc: "Mochi dengan isian coklat silverqueen",
  },
  {
    id: "prd-013",
    kat: "kat-001",
    harga: 8000,
    nama: "Choco Mallow",
    desc: "Mochi dengan isian coklat dan marshmallow",
  },
  {
    id: "prd-014",
    kat: "kat-001",
    harga: 8000,
    nama: "Tiramisu",
    desc: "Mochi dengan isian tiramisu yang creamy",
  },
  {
    id: "prd-015",
    kat: "kat-002",
    harga: 8000,
    nama: "Oreo Berry",
    desc: "Mochi dengan isian oreo dan stroberi",
  },
  {
    id: "prd-016",
    kat: "kat-002",
    harga: 7000,
    nama: "Cream Redvelvet",
    desc: "Mochi dengan isian cream dan kulit redvelvet",
  },
  {
    id: "prd-017",
    kat: "kat-003",
    harga: 7000,
    nama: "Cream Caramel",
    desc: "Mochi dengan isian cream dan caramel yang manis",
  },
];

const BAHAN_BAKU = [
  {
    id: "bb-001",
    nama: "Tepung Ketan",
    satuan: "kg",
    harga: 15000,
    min: 10.0,
    stok: 50.0,
  },
  {
    id: "bb-002",
    nama: "Gula Pasir",
    satuan: "kg",
    harga: 17000,
    min: 5.0,
    stok: 30.0,
  },
  {
    id: "bb-003",
    nama: "Susu UHT",
    satuan: "liter",
    harga: 20000,
    min: 5.0,
    stok: 20.0,
  },
  {
    id: "bb-004",
    nama: "Coklat Batang",
    satuan: "kg",
    harga: 55000,
    min: 3.0,
    stok: 15.0,
  },
  {
    id: "bb-005",
    nama: "Keju Cheddar",
    satuan: "kg",
    harga: 60000,
    min: 2.0,
    stok: 10.0,
  },
  {
    id: "bb-006",
    nama: "Matcha Powder",
    satuan: "gram",
    harga: 500,
    min: 100.0,
    stok: 500.0,
  },
  {
    id: "bb-007",
    nama: "Kacang Merah",
    satuan: "kg",
    harga: 25000,
    min: 2.0,
    stok: 10.0,
  },
  {
    id: "bb-008",
    nama: "Stroberi",
    satuan: "kg",
    harga: 40000,
    min: 3.0,
    stok: 15.0,
  },
  {
    id: "bb-009",
    nama: "Oreo",
    satuan: "pcs",
    harga: 2000,
    min: 20.0,
    stok: 100.0,
  },
  {
    id: "bb-010",
    nama: "Cream Cheese",
    satuan: "kg",
    harga: 80000,
    min: 2.0,
    stok: 10.0,
  },
  {
    id: "bb-011",
    nama: "Marshmallow",
    satuan: "gram",
    harga: 100,
    min: 100.0,
    stok: 500.0,
  },
  {
    id: "bb-012",
    nama: "Biskuit",
    satuan: "pcs",
    harga: 1500,
    min: 50.0,
    stok: 200.0,
  },
  {
    id: "bb-013",
    nama: "Coklat Silverqueen",
    satuan: "kg",
    harga: 150000,
    min: 2.0,
    stok: 10.0,
  },
  {
    id: "bb-014",
    nama: "Milo Powder",
    satuan: "gram",
    harga: 150,
    min: 100.0,
    stok: 500.0,
  },
  {
    id: "bb-015",
    nama: "Pasta Tiramisu",
    satuan: "gram",
    harga: 300,
    min: 100.0,
    stok: 500.0,
  },
  {
    id: "bb-016",
    nama: "Pasta Redvelvet",
    satuan: "gram",
    harga: 300,
    min: 100.0,
    stok: 500.0,
  },
  {
    id: "bb-017",
    nama: "Caramel Sauce",
    satuan: "gram",
    harga: 200,
    min: 100.0,
    stok: 500.0,
  },
];

const METODE_BAYAR = ["tunai", "qris", "transfer"];

// ============================================================
//  HELPER
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
// ============================================================
function generateTransaksiSetahun(tahun) {
  const rng = makePrng(tahun * 7 + 42);

  const transaksiRows = [];
  const detailRows = [];

  const BASE_TAHUN = 2023;
  const TRX_OFFSET_PER_TAHUN = 100000;
  const DTL_OFFSET_PER_TAHUN = 500000;
  let trxCounter = (tahun - BASE_TAHUN) * TRX_OFFSET_PER_TAHUN;
  let dtlCounter = (tahun - BASE_TAHUN) * DTL_OFFSET_PER_TAHUN;

  const now = new Date();
  const tahunSekarang = now.getFullYear();

  const end =
    tahun === tahunSekarang
      ? new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
      : new Date(`${tahun}-12-31T23:59:59`);

  for (
    let d = new Date(`${tahun}-01-01`);
    d <= end;
    d.setDate(d.getDate() + 1)
  ) {
    const dow = d.getDay();
    const isWeekend = dow === 0 || dow === 6;

    const minTrx = isWeekend ? 15 : 8;
    const maxTrx = isWeekend ? 22 : 14;

    for (const outlet of OUTLETS) {
      const jumlahTrx = minTrx + Math.floor(rng() * (maxTrx - minTrx + 1));

      for (let t = 0; t < jumlahTrx; t++) {
        trxCounter++;
        const trxId = `trx-${pad(trxCounter)}`;

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

        const jumlahItem = 2 + Math.floor(rng() * 4);
        const shuffled = [...PRODUK].sort(() => rng() - 0.5);
        const items = shuffled.slice(0, jumlahItem);

        let totalHarga = 0;
        for (const p of items) {
          dtlCounter++;
          const qty = 1 + Math.floor(rng() * 4);
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
//  GENERATOR PENGELUARAN & LAPORAN
// ============================================================
function generatePengeluaranDanLaporan(tahun) {
  const now = new Date();
  const tahunSekarang = now.getFullYear();
  const bulanSekarang = now.getMonth() + 1;

  const prng = makePrng(tahun * 9 + 11);

  const BASE_TAHUN = 2023;
  const PEL_OFFSET = (tahun - BASE_TAHUN) * 100;
  const LAP_OFFSET = (tahun - BASE_TAHUN) * 20;

  let maxBulanPengeluaran, maxBulanLaporan;
  if (tahun < tahunSekarang) {
    maxBulanPengeluaran = 12;
    maxBulanLaporan = 12;
  } else if (tahun === tahunSekarang) {
    maxBulanPengeluaran = bulanSekarang;
    maxBulanLaporan = bulanSekarang > 1 ? bulanSekarang - 1 : 0;
  } else {
    maxBulanPengeluaran = 0;
    maxBulanLaporan = 0;
  }

  const templateBahanBaku = [
    {
      biaya: 500000,
      kat: "Biaya Operasional",
      desc: "Pembelian tepung ketan 10kg",
    },
    {
      biaya: 200000,
      kat: "Biaya Operasional",
      desc: "Pembelian gula pasir 10kg",
    },
    {
      biaya: 300000,
      kat: "Biaya Operasional",
      desc: "Pembelian coklat batang",
    },
    { biaya: 250000, kat: "Biaya Operasional", desc: "Pembelian keju cheddar" },
    {
      biaya: 150000,
      kat: "Biaya Operasional",
      desc: "Pembelian matcha powder",
    },
    {
      biaya: 180000,
      kat: "Biaya Operasional",
      desc: "Pembelian stroberi segar",
    },
    {
      biaya: 400000,
      kat: "Biaya Operasional",
      desc: "Pembelian tepung ketan 10kg (restok)",
    },
    {
      biaya: 350000,
      kat: "Biaya Operasional",
      desc: "Pembelian coklat silverqueen",
    },
    { biaya: 200000, kat: "Biaya Operasional", desc: "Pembelian cream cheese" },
    { biaya: 120000, kat: "Biaya Operasional", desc: "Pembelian marshmallow" },
    {
      biaya: 160000,
      kat: "Biaya Operasional",
      desc: "Pembelian oreo & biskuit",
    },
    {
      biaya: 130000,
      kat: "Biaya Operasional",
      desc: "Pembelian pasta tiramisu",
    },
  ];

  const templateOperasional = [
    {
      biayaBase: 80000,
      kat: "Biaya Operasional",
      desc: (bln) => `Biaya listrik outlet bulan ${bln}`,
    },
    {
      biayaBase: 50000,
      kat: "Biaya Operasional",
      desc: (bln) => `Biaya air & kebersihan bulan ${bln}`,
    },
    {
      biayaBase: 70000,
      kat: "Biaya Pengemasan",
      desc: (bln) => `Biaya kemasan & plastik bulan ${bln}`,
    },
    {
      biayaBase: 100000,
      kat: "Biaya Operasional",
      desc: (bln) => `Biaya sewa tempat produksi bulan ${bln}`,
    },
    {
      biayaBase: 45000,
      kat: "Biaya Operasional",
      desc: (bln) => `Biaya transportasi & pengiriman bulan ${bln}`,
    },
    {
      biayaBase: 60000,
      kat: "Biaya Operasional",
      desc: (bln) => `Biaya perlengkapan produksi bulan ${bln}`,
    },
    {
      biayaBase: 90000,
      kat: "Biaya Operasional",
      desc: (bln) => `Biaya internet & komunikasi bulan ${bln}`,
    },
    {
      biayaBase: 55000,
      kat: "Biaya Operasional",
      desc: (bln) => `Biaya alat kebersihan outlet bulan ${bln}`,
    },
    {
      biayaBase: 75000,
      kat: "Beban Penyusutan",
      desc: (bln) => `Biaya servis peralatan bulan ${bln}`,
    },
    {
      biayaBase: 40000,
      kat: "Biaya Pemasaran",
      desc: (bln) => `Biaya promosi & sosial media bulan ${bln}`,
    },
    {
      biayaBase: 65000,
      kat: "Biaya Pengemasan",
      desc: (bln) => `Biaya stiker & label produk bulan ${bln}`,
    },
    {
      biayaBase: 85000,
      kat: "Lain-lain",
      desc: (bln) => `Biaya tak terduga bulan ${bln}`,
    },
  ];

  const estimasiPendapatan = [
    18500000, 19200000, 19800000, 18700000, 19500000, 20200000, 21000000,
    20500000, 19300000, 19700000, 20100000, 22500000,
  ];

  const pengeluaranRows = [];
  const pengeluaranIds = [];
  let pelCounter = PEL_OFFSET;

  for (let bln = 1; bln <= maxBulanPengeluaran; bln++) {
    // 1. Bahan Baku
    for (let i = 0; i < 3; i++) {
      const tpl =
        templateBahanBaku[((bln - 1) * 3 + i) % templateBahanBaku.length];
      pelCounter++;
      const pelId = `pel-${pad(pelCounter, 3)}`;
      const tgl = `${tahun}-${String(bln).padStart(2, "0")}-${String(3 + i * 4).padStart(2, "0")}`;

      const variasi = 0.85 + prng() * 0.3;
      const biayaFinal = Math.floor(tpl.biaya * variasi);

      pengeluaranRows.push(
        `('${pelId}','usr-001','${tpl.kat}','${tgl}',${biayaFinal},'${tpl.desc}')`,
      );
      pengeluaranIds.push({ id: pelId, bulan: bln, biaya: biayaFinal });
    }

    // 2. Operasional
    for (let i = 0; i < 3; i++) {
      const tpl =
        templateOperasional[((bln - 1) * 3 + i) % templateOperasional.length];
      pelCounter++;
      const pelId = `pel-${pad(pelCounter, 3)}`;
      const tgl = `${tahun}-${String(bln).padStart(2, "0")}-${String(15 + i * 4).padStart(2, "0")}`;

      const variasi = 0.8 + prng() * 0.4;
      const biayaFinal = Math.floor(tpl.biayaBase * variasi);

      pengeluaranRows.push(
        `('${pelId}','usr-001','${tpl.kat}','${tgl}',${biayaFinal},'${tpl.desc(bln)}')`,
      );
      pengeluaranIds.push({ id: pelId, bulan: bln, biaya: biayaFinal });
    }

    // 3. Gaji Karyawan
    pelCounter++;
    const pelIdGaji = `pel-${pad(pelCounter, 3)}`;
    const tglGaji = `${tahun}-${String(bln).padStart(2, "0")}-28`;

    const lembur = Math.floor(prng() * 6) * 150000;
    const gajiTotal = 5000000 + lembur;

    pengeluaranRows.push(
      `('${pelIdGaji}','usr-001','Gaji Karyawan','${tglGaji}',${gajiTotal},'Pembayaran gaji bulanan karyawan + lembur')`,
    );
    pengeluaranIds.push({ id: pelIdGaji, bulan: bln, biaya: gajiTotal });
  }

  const laporanRows = [];
  const laporanPengeluaranRows = [];
  let lapCounter = LAP_OFFSET;

  for (let bln = 1; bln <= maxBulanLaporan; bln++) {
    lapCounter++;
    const lapId = `lap-${pad(lapCounter, 3)}`;
    const pendapatan = estimasiPendapatan[bln - 1] || 19000000;
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
  };
}

// ============================================================
//  STATIC SEED QUERIES
// ============================================================
function buildStaticSeedQueries(tahun) {
  const now = new Date();
  const tahunSekarang = now.getFullYear();
  const bulanSekarang = now.getMonth() + 1;
  const maxBulan = tahun < tahunSekarang ? 12 : bulanSekarang;

  const {
    pengeluaranRows,
    laporanRows,
    laporanPengeluaranRows,
    laporanTahunanRow,
    laporanTahunanPengeluaranRows,
  } = generatePengeluaranDanLaporan(tahun);

  const allLaporanRows = laporanTahunanRow
    ? [...laporanRows, laporanTahunanRow]
    : laporanRows;
  const allLaporanPengeluaranRows = [
    ...laporanPengeluaranRows,
    ...laporanTahunanPengeluaranRows,
  ];

  // --- Dynamic String Generation for Products & Materials ---
  const produkVals = PRODUK.map(
    (p) => `('${p.id}','${p.kat}','${p.nama}','${p.desc}',${p.harga})`,
  ).join(",\n      ");
  const bahanBakuVals = BAHAN_BAKU.map(
    (b) => `('${b.id}','${b.nama}','${b.satuan}',${b.harga})`,
  ).join(",\n      ");
  const stokBahanBakuVals = BAHAN_BAKU.map(
    (b, i) => `('stk-${pad(i + 1, 3)}','${b.id}',${b.stok},${b.min})`,
  ).join(",\n      ");

  // --- 1. Stok Outlet (Historical bulanan untuk memicu kalkulasi Waste) ---
  const stokOutletRows = [];
  let stokId = 1;

  // A. Stok Awal Tahun
  const baseDate = `${tahun}-01-01`;
  for (const out of OUTLETS) {
    for (const p of PRODUK) {
      stokOutletRows.push(
        `('stok-${pad(stokId)}','${p.id}','${out.id}',${out.stokAwal},${p.harga},'${baseDate}')`,
      );
      stokId++;
    }
  }

  // B. Stok Opname setiap akhir bulan
  for (let bln = 1; bln <= maxBulan; bln++) {
    const tglAkhirBulan = new Date(tahun, bln, 0);
    const tglStr = fmtDate(tglAkhirBulan);

    for (const out of OUTLETS) {
      for (const p of PRODUK) {
        // Sisa stok yang tidak terjual (menjadi waste) diset 1-5 pcs
        const sisaStok = 1 + Math.floor(Math.random() * 5);
        stokOutletRows.push(
          `('stok-${pad(stokId)}','${p.id}','${out.id}',${sisaStok},${p.harga},'${tglStr}')`,
        );
        stokId++;
      }
    }
  }

  // --- 2. Penggunaan Bahan Baku Bulanan (Historical untuk memicu kalkulasi HPP) ---
  const penggunaanBahanBakuRows = [];
  let pguCounter = 1;
  for (let bln = 1; bln <= maxBulan; bln++) {
    for (let i = 0; i < 6; i++) {
      const bb = BAHAN_BAKU[Math.floor(Math.random() * 5)];
      const jml = (Math.random() * 4 + 1).toFixed(2);
      const tgl = `${tahun}-${String(bln).padStart(2, "0")}-${String(i * 4 + 2).padStart(2, "0")}`;

      penggunaanBahanBakuRows.push(
        `('pgu-${pad(pguCounter)}','${bb.id}','usr-004',${jml},${bb.harga},'Produksi rutin bulanan','${tgl}')`,
      );
      pguCounter++;
    }
  }

  return [
    `INSERT IGNORE INTO pengguna (id_pengguna, nama, email, password, role) VALUES
      ('usr-001', 'Admin Utama',        'admin@mochi.com',  '$2b$10$MyCh.tRGWtXvnJym6shaZ.D4/vk8I2XlUbHxEn7/FgJ.zJCekYvRG', 'admin'),
      ('usr-002', 'Kasir Satu',         'kasir1@mochi.com', '$2b$10$Cx6eqnhnhojOTzNvD4Pav.8cvOstTd10DiynVkETNlRdbSncabMB.', 'kasir'),
      ('usr-003', 'Kasir Dua',          'kasir2@mochi.com', '$2b$10$stpAB1og.wP4BT2kLDN9A.Wgj7Gtu06l3qwbd.M5nPJRTq4wY3se2', 'kasir'),
      ('usr-004', 'Staff Produksi Satu','prod1@mochi.com',  '$2b$10$IGOo4cser7STGkRbssnwKeOg6XvaZOxSm2quNhvoCqE7GGfqOU/.O', 'staff_produksi'),
      ('usr-005', 'Staff Produksi Dua', 'prod2@mochi.com',  '$2b$10$56DV13rhPMB.Fd5NxjAEiu2njVSHL2mUP/tRmQdPRVt8uvHNaj6za', 'staff_produksi')`,

    `INSERT IGNORE INTO outlet (id_outlet, nama_outlet, alamat) VALUES
      ('otl-001', 'Outlet Tembalang',   'Jl. Timoho Raya No. 1'),
      ('otl-002', 'Outlet Klipang',     'Jl. Klipang Raya No. 2'),
      ('otl-003', 'Outlet Sambiroto',   'Jl. Sambiroto Raya No. 3'),
      ('otl-004', 'Outlet Pedurungan',  'Jl. Pedurungan No. 4')`,

    `INSERT IGNORE INTO kategori (id_kategori, kode_kategori, nama_kategori) VALUES
      ('kat-001', 'MCHC', 'Mochi Choco Series'),
      ('kat-002', 'MCHF', 'Mochi Fresh Series'),
      ('kat-003', 'MCS',  'Mochi Cream Series')`,

    `INSERT IGNORE INTO produk (id_produk, id_kategori, nama_produk, deskripsi, harga) VALUES
      ${produkVals}`,

    `INSERT IGNORE INTO stok_outlet (id_stok_outlet, id_produk, id_outlet, jumlah_stok, harga_produk, tanggal) VALUES
      ${stokOutletRows.join(",\n      ")}`,

    `INSERT IGNORE INTO bahan_baku (id_bahan_baku, nama_bahan, satuan, harga_bahan_baku) VALUES
      ${bahanBakuVals}`,

    `INSERT IGNORE INTO stok_bahan_baku (id_stok_bb, id_bahan_baku, jumlah_stok, stok_minimum) VALUES
      ${stokBahanBakuVals}`,

    ...(pengeluaranRows.length > 0
      ? [
          `INSERT IGNORE INTO pengeluaran (id_pengeluaran, id_pengguna, kategori, tanggal, biaya, deskripsi) VALUES
      ${pengeluaranRows.join(",\n      ")}`,
        ]
      : []),

    ...(penggunaanBahanBakuRows.length > 0
      ? [
          `INSERT IGNORE INTO penggunaan_bahan_baku (id_penggunaan, id_bahan_baku, id_pengguna, jumlah_digunakan, harga_bahan_baku, catatan, tanggal) VALUES
      ${penggunaanBahanBakuRows.join(",\n      ")}`,
        ]
      : []),

    ...(allLaporanRows.length > 0
      ? [
          `INSERT IGNORE INTO laporan (id_laporan, id_outlet, id_pengguna, jenis_laporan, periode_bulan, periode_tahun, total_pendapatan, total_pengeluaran) VALUES
            ${allLaporanRows.join(",\n            ")}`,
        ]
      : []),

    ...(allLaporanPengeluaranRows.length > 0
      ? [
          `INSERT IGNORE INTO laporan_pengeluaran (id_laporan, id_pengeluaran) VALUES
            ${allLaporanPengeluaranRows.join(",\n            ")}`,
        ]
      : []),
  ].filter(Boolean);
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
//  INSERT BATCH
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
    if (!query) continue;
    const [result] = await connection.query(query);
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
    `  ℹ  Generated: ${transaksiRows.length.toLocaleString()} transaksi, ${detailRows.length.toLocaleString()} detail transaksi`,
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
  for (const i of [2, 3]) {
    const [result] = await connection.query(queries[i]);
    console.log(
      `  ✓ "${STATIC_LABELS_BASE[i]}" — ${result.affectedRows} baris`,
    );
  }
}

// ============================================================
//  GENERATOR STOK HARIAN
// ============================================================
function generateStokHarianRows() {
  const hariList = [-2, -1, 0].map((offset) => {
    const d = new Date();
    d.setHours(23, 0, 0, 0);
    d.setDate(d.getDate() + offset);
    return d;
  });

  const rows = [];
  let counter = OUTLETS.length * PRODUK.length;

  for (const hari of hariList) {
    const dayKey =
      hari.getFullYear() * 10000 + (hari.getMonth() + 1) * 100 + hari.getDate();
    const rng = makePrng(dayKey);
    const tglStr = fmtDate(hari);

    for (const outlet of OUTLETS) {
      for (const produk of PRODUK) {
        counter++;
        const id = `stok-${pad(counter, 3)}`;

        // Sisa stok harian diset 1-5 pcs
        const sisaStok = 1 + Math.floor(rng() * 5);

        rows.push(
          `('${id}','${produk.id}','${outlet.id}',${sisaStok},${produk.harga},'${tglStr}')`,
        );
      }
    }
  }
  return rows;
}

async function seedStokHarian(connection) {
  console.log("\n[ SEED STOK HARIAN — 3 HARI TERAKHIR ]");
  console.log("  ⏳ Generating data...");

  const rows = generateStokHarianRows();

  const now = new Date();
  const tgl = [-2, -1, 0].map((o) => {
    const d = new Date(now);
    d.setDate(d.getDate() + o);
    return fmtDate(d);
  });
  console.log(`    Tanggal: ${tgl.join(", ")}`);
  console.log(
    `    Total rows: ${rows.length} (${PRODUK.length} produk x ${OUTLETS.length} outlet > 3 hari)`,
  );

  const inserted = await insertBatch(
    connection,
    "stok_outlet",
    "id_stok_outlet, id_produk, id_outlet, jumlah_stok, harga_produk, tanggal",
    rows,
  );

  console.log(`  ✓ "stok_outlet" — ${inserted} baris dimasukkan`);
}

// ============================================================
//  ENTRY POINT
// ============================================================
async function main() {
  const args = process.argv.slice(2);
  const onlyProduk = args.includes("--produk");
  const onlyTransaksi = args.includes("--transaksi");
  const onlyStokHarian = args.includes("--stok-harian");

  const tahunArg = args.find((a) => /^\d{4}$/.test(a));
  const tahun = tahunArg ? parseInt(tahunArg, 10) : new Date().getFullYear();

  const connection = await mysql.createConnection(DB_CONFIG);

  try {
    if (onlyProduk) {
      await seedProduk(connection, tahun);
    } else if (onlyTransaksi) {
      await seedTransaksi(connection, tahun);
    } else if (onlyStokHarian) {
      await seedStokHarian(connection);
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
