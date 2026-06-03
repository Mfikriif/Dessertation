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
    const ringkasanParams = [
      this.periode_bulan,
      this.periode_tahun,
      this.periode_bulan,
      this.periode_tahun,
      this.periode_bulan,
      this.periode_tahun,
    ];
    const ringkasanQuery = db.query(
      `
      SELECT 
        (SELECT COUNT(id_transaksi) 
         FROM transaksi 
         WHERE MONTH(tanggal) = ? AND YEAR(tanggal) = ? AND status = 'selesai'
        ) AS total_transaksi,
        (SELECT SUM(total_harga) 
         FROM transaksi 
         WHERE MONTH(tanggal) = ? AND YEAR(tanggal) = ? AND status = 'selesai'
        ) AS total_pendapatan,
        (SELECT SUM(biaya) 
         FROM pengeluaran 
         WHERE MONTH(tanggal) = ? AND YEAR(tanggal) = ?
        ) AS total_pengeluaran
      `,
      ringkasanParams,
    );

    const harianQuery = db.query(
      `
      SELECT
        DATE_FORMAT(tanggal, '%Y-%m-%d') AS tanggal_transaksi, 
        COUNT(id_transaksi) AS jumlah_transaksi,
        SUM(total_harga) AS total_pendapatan 
      FROM transaksi
      WHERE MONTH(tanggal) = ? AND YEAR(tanggal) = ? AND status = 'selesai'
      GROUP BY tanggal_transaksi
      ORDER BY tanggal_transaksi ASC
      `,
      params,
    );

    const riwayatQuery = db.query(
      `
     SELECT 
        t.id_transaksi, 
        DATE_FORMAT(t.tanggal, '%Y-%m-%d %H:%i:%s') AS waktu_transaksi, 
        t.total_harga, 
        t.metode_bayar,
        (
          SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
              'nama_produk', p.nama_produk,
              'jumlah', dt.jumlah,
              'harga_satuan', dt.harga_satuan,
              'subtotal', dt.subtotal
            )
          )
          FROM detail_transaksi dt
          JOIN produk p ON dt.id_produk = p.id_produk
          WHERE dt.id_transaksi = t.id_transaksi
        ) AS detail_pembelian

      FROM transaksi t
      WHERE MONTH(t.tanggal) = ? AND YEAR(t.tanggal) = ? AND t.status = 'selesai'
      ORDER BY t.tanggal DESC
      LIMIT ${limit} OFFSET ${offset}
      `,
      params,
    );

    const pengeluaranQuery = db.query(
      `
      SELECT 
        p.id_pengeluaran,
        DATE_FORMAT(p.tanggal, '%Y-%m-%d') AS tanggal,
        p.biaya,
        p.deskripsi,
        pe.nama AS nama_pengguna
      FROM pengeluaran p
      LEFT JOIN pengguna pe ON pe.id_pengguna = p.id_pengguna
      WHERE MONTH(p.tanggal) = ? AND YEAR(p.tanggal) = ?
      ORDER BY p.tanggal DESC
      `,
      params,
    );

    const [[hasilRingkasan], [hasilHarian], [hasilRiwayat], [hasilPengeluaran]] = await Promise.all(
      [ringkasanQuery, harianQuery, riwayatQuery, pengeluaranQuery],
    );

    // Parsing JSON String dari MySQL menjadi Array JavaScript
    const riwayatTerformat = hasilRiwayat.map((trx) => {
      let detail = [];
      try {
        detail =
          typeof trx.detail_pembelian === "string"
            ? JSON.parse(trx.detail_pembelian)
            : trx.detail_pembelian;
      } catch (err) {
        detail = [];
      }
      return {
        ...trx,
        detail_pembelian: detail || [],
      };
    });

    return {
      ringkasan: {
        total_transaksi: hasilRingkasan[0].total_transaksi || 0,
        total_pendapatan: hasilRingkasan[0].total_pendapatan || 0,
        total_pengeluaran: hasilRingkasan[0].total_pengeluaran || 0,
      },
      harian: hasilHarian,
      riwayat: riwayatTerformat,
      pengeluaran: hasilPengeluaran,
    };
  }

  async getLaporanTahunan() {
    const [ringkasan] = await db.query(
      `
      SELECT 
        COUNT(id_transaksi) AS total_transaksi,
        SUM(total_harga) AS total_pendapatan
      FROM transaksi
      WHERE YEAR(tanggal) = ?
      `,
      [this.periode_tahun],
    );

    const [detailOutlet] = await db.query(
      `
      SELECT 
        t.id_outlet,
        o.nama_outlet,
        COUNT(t.id_transaksi) AS jumlah_transaksi,
        SUM(t.total_harga) AS total_pendapatan
      FROM transaksi t
      JOIN outlet o ON t.id_outlet = o.id_outlet
      WHERE YEAR(t.tanggal) = ? AND t.status = 'selesai'
      GROUP BY t.id_outlet, o.nama_outlet
      ORDER BY total_pendapatan DESC
      `,
      [this.periode_tahun],
    );

    return {
      ringkasan: ringkasan[0],
      detail_outlet: detailOutlet,
    };
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

    const outletQuery = db.query(
      "SELECT nama_outlet FROM outlet WHERE id_outlet = ?",
      [this.id_outlet],
    );

    const ringkasanQuery = db.query(
      `
      SELECT 
        COUNT(id_transaksi) AS total_transaksi, 
        SUM(total_harga) AS total_pendapatan
      FROM transaksi
      WHERE id_outlet = ? AND MONTH(tanggal) = ? AND YEAR(tanggal) = ? AND status = 'selesai'
      `,
      params,
    );

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

    const riwayatQuery = db.query(
      `
      SELECT 
        t.id_transaksi, 
        DATE_FORMAT(t.tanggal, '%Y-%m-%d %H:%i:%s') AS waktu_transaksi, 
        t.total_harga, 
        t.metode_bayar,
        (
          SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
              'nama_produk', p.nama_produk,
              'jumlah', dt.jumlah,
              'harga_satuan', dt.harga_satuan,
              'subtotal', dt.subtotal
            )
          )
          FROM detail_transaksi dt
          JOIN produk p ON dt.id_produk = p.id_produk
          WHERE dt.id_transaksi = t.id_transaksi
        ) AS detail_pembelian

      FROM transaksi t
      WHERE t.id_outlet = ? AND MONTH(t.tanggal) = ? AND YEAR(t.tanggal) = ? AND t.status = 'selesai'
      ORDER BY t.tanggal DESC
      LIMIT ${limit} OFFSET ${offset}
      `,
      params,
    );

    const [[hasilOutlet], [hasilRingkasan], [hasilHarian], [hasilRiwayat]] =
      await Promise.all([
        outletQuery,
        ringkasanQuery,
        harianQuery,
        riwayatQuery,
      ]);

    const riwayatTerformat = hasilRiwayat.map((trx) => {
      let detail = [];
      try {
        detail =
          typeof trx.detail_pembelian === "string"
            ? JSON.parse(trx.detail_pembelian)
            : trx.detail_pembelian;
      } catch (err) {
        detail = [];
      }

      return {
        ...trx,
        detail_pembelian: detail || [],
      };
    });

    return {
      nama_outlet: hasilOutlet.length > 0 ? hasilOutlet[0].nama_outlet : null,
      ringkasan: {
        total_transaksi: hasilRingkasan[0].total_transaksi || 0,
        total_pendapatan: hasilRingkasan[0].total_pendapatan || 0,
      },
      harian: hasilHarian,
      riwayat: riwayatTerformat,
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
