const db = require("../../config/db");

class Laporan {
  constructor(
    id_laporan,
    id_outlet,
    id_pengguna,
    jenis_laporan,
    periode_bulan,
    periode_tahun,
    total_pendapatan,
    total_pengeluaran,
  ) {
    this.id_laporan = id_laporan;
    this.id_outlet = id_outlet;
    this.id_pengguna = id_pengguna;
    this.jenis_laporan = jenis_laporan;
    this.periode_bulan = periode_bulan;
    this.periode_tahun = periode_tahun;
    this.total_pendapatan = total_pendapatan;
    this.total_pengeluaran = total_pengeluaran;
  }

  async getLaporanBulanan(limit = 10, offset = 0) {
    const params = [this.periode_bulan, this.periode_tahun];
    const ringkasanQuery = db.query(
      `
      SELECT 
      COUNT(id_transaksi) AS total_transaksi,
      SUM(total_harga) AS total_pendapatan
      FROM transaksi
      WHERE MONTH(tanggal) = ? AND YEAR(tanggal) = ? 
      `,
      params,
    );

    const riwayatQuery = db.query(
      `
      SELECT
        id_transaksi,
        DATE_FORMAT(tanggal, '%Y-%m-%d %H:%i:%s') AS waktu_transaksi, 
        total_harga, 
        metode_bayar 
      FROM transaksi
      WHERE MONTH(tanggal) = ? AND YEAR(tanggal) = ? AND status = 'selesai'
      ORDER BY tanggal DESC
      LIMIT ${limit} OFFSET ${offset}
      `,
      params,
    );

    const [[hasilRingkasan], [hasilRiwayat]] = await Promise.all([
      ringkasanQuery,
      riwayatQuery,
    ]);

    return {
      ringkasan: {
        total_transaksi: hasilRingkasan[0].total_transaksi || 0,
        total_pendapatan: hasilRingkasan[0].total_pendapatan || 0,
      },
      riwayat: hasilRiwayat,
    };
  }

  async getLaporanTahunan() {
    const [rows] = await db.query(
      `
      SELECT 
      COUNT(id_transaksi) AS total_transaksi,
      SUM(total_harga) AS total_pendapatan
      FROM transaksi
      WHERE YEAR(tanggal) = ?
      `,
      [this.periode_tahun],
    );
    return rows;
  }

  async getDetailLaporanBulanan() {
    const [rows] = await db.query(
      `
      SELECT
        DATE_FORMAT(tanggal, '%Y-%m-%d') AS tanggal_transaksi, 
        COUNT(id_transaksi) AS jumlah_transaksi,
        SUM(total_harga) AS total_pendapatan 
      FROM transaksi
      WHERE MONTH(tanggal) = ? AND YEAR(tanggal) = ? AND status = 'selesai'
      GROUP BY tanggal_transaksi
      ORDER BY tanggal_transaksi ASC;
      `,
      [this.periode_bulan, this.periode_tahun],
    );
    return rows;
  }

  async getDetailLaporanTahunan() {
    const [rows] = await db.query(
      `
      SELECT
        MONTH(tanggal) AS bulan,
        COUNT(id_transaksi) AS jumlah_transaksi,
        SUM(total_harga) AS total_pendapatan
      FROM transaksi
      WHERE YEAR(tanggal) = ? AND status = 'selesai'
      GROUP BY MONTH(tanggal)
      ORDER BY bulan ASC
      `,
      [this.periode_tahun],
    );
    return rows;
  }

  async getDetailBulananOutlet(limit = 10, offset = 0) {
    const params = [this.id_outlet, this.periode_bulan, this.periode_tahun];

    // 1. Query Ringkasan (Total sebulan untuk outlet ini)
    const ringkasanQuery = db.query(
      `
      SELECT 
        o.nama_outlet, 
        COUNT(t.id_transaksi) AS total_transaksi, 
        SUM(t.total_harga) AS total_pendapatan
      FROM transaksi t
      JOIN outlet o ON t.id_outlet = o.id_outlet
      WHERE t.id_outlet = ? AND MONTH(t.tanggal) = ? AND YEAR(t.tanggal) = ? AND t.status = 'selesai'
      GROUP BY o.nama_outlet
      `,
      params,
    );

    // 2. Query Grafik Harian (Untuk Line Chart)
    const harianQuery = db.query(
      `
      SELECT
        DATE_FORMAT(tanggal, '%Y-%m-%d') AS tanggal_transaksi, 
        COUNT(id_transaksi) AS jumlah_transaksi,
        SUM(total_harga) AS total_pendapatan 
      FROM transaksi
      WHERE id_outlet = ? AND MONTH(tanggal) = ? AND YEAR(tanggal) = ? AND status = 'selesai'
      GROUP BY tanggal_transaksi
      ORDER BY tanggal_transaksi ASC
      `,
      params,
    );

    // 3. Query Riwayat Transaksi (Dengan Paginasi LIMIT & OFFSET)
    const riwayatQuery = db.query(
      `
      SELECT 
        id_transaksi, 
        DATE_FORMAT(tanggal, '%Y-%m-%d %H:%i:%s') AS waktu_transaksi, 
        total_harga, 
        metode_bayar 
      FROM transaksi
      WHERE id_outlet = ? AND MONTH(tanggal) = ? AND YEAR(tanggal) = ? AND status = 'selesai'
      ORDER BY tanggal DESC
      LIMIT ${limit} OFFSET ${offset}
      `,
      params,
    );

    // Eksekusi ketiga query secara paralel
    const [[hasilRingkasan], [hasilHarian], [hasilRiwayat]] = await Promise.all(
      [ringkasanQuery, harianQuery, riwayatQuery],
    );

    // Format kembalian
    return {
      nama_outlet:
        hasilRingkasan.length > 0 ? hasilRingkasan[0].nama_outlet : null,
      ringkasan: {
        total_transaksi:
          hasilRingkasan.length > 0 ? hasilRingkasan[0].total_transaksi : 0,
        total_pendapatan:
          hasilRingkasan.length > 0 ? hasilRingkasan[0].total_pendapatan : 0,
      },
      harian: hasilHarian, // Data mentah grafik, nanti di-padding di controller
      riwayat: hasilRiwayat, // Array riwayat transaksi berhalaman
    };
  }

  async getDetailTahunanOutlet() {
    const [rows] = await db.query(
      `
      SELECT
        o.nama_outlet,
        MONTH(t.tanggal) AS bulan, 
        COUNT(t.id_transaksi) AS jumlah_transaksi,
        SUM(t.total_harga) AS total_pendapatan 
      FROM transaksi t
      JOIN outlet o ON t.id_outlet = o.id_outlet
      WHERE 
        t.id_outlet = ? 
        AND YEAR(t.tanggal) = ? 
        AND t.status = 'selesai'
      GROUP BY o.nama_outlet, bulan
      ORDER BY bulan ASC;
      `,
      [this.id_outlet, this.periode_tahun],
    );
    return rows;
  }

  async getTopProdukHarian(filter) {
    let query = `
    SELECT 
      p.id_produk,
      p.nama_produk,
      SUM(dt.jumlah) as total_terjual
    FROM transaksi t
    JOIN detail_transaksi dt ON t.id_transaksi = dt.id_transaksi
    JOIN produk p ON dt.id_produk = p.id_produk
    WHERE t.status = 'selesai'
  `;

    let values = [];

    if (filter.tanggal) {
      query += " AND DATE(t.tanggal) = ?";
      values.push(filter.tanggal);
    }

    if (filter.id_outlet) {
      query += " AND t.id_outlet = ?";
      values.push(filter.id_outlet);
    }

    query += `
    GROUP BY p.id_produk, p.nama_produk
    ORDER BY total_terjual DESC
  `;

    // FIX LIMIT
    if (filter.limit) {
      query += ` LIMIT ${parseInt(filter.limit)}`;
    }

    const [rows] = await db.execute(query, values);

    return rows;
  }

  async getLaporanHarian(filter) {
    let query = `
    SELECT 
      DATE(t.tanggal) as tanggal,
      t.id_outlet,
      COUNT(*) as total_transaksi,
      SUM(t.total_harga) as total_pendapatan
    FROM transaksi t
    WHERE t.status = 'selesai'
  `;

    let values = [];

    if (filter.tanggal) {
      query += " AND DATE(t.tanggal) = ?";
      values.push(filter.tanggal);
    }

    if (filter.id_outlet) {
      query += " AND t.id_outlet = ?";
      values.push(filter.id_outlet);
    }

    query += " GROUP BY DATE(t.tanggal), t.id_outlet";

    const [rows] = await db.execute(query, values);

    return rows.map((row) => ({
      tanggal: row.tanggal,
      id_outlet: row.id_outlet,
      total_transaksi: Number(row.total_transaksi),
      total_pendapatan: Number(row.total_pendapatan),
    }));
  }
}

module.exports = Laporan;
