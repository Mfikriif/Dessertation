const db = require("../../config/db");

class Laporan {
  #id_laporan;
  #id_outlet;
  #id_pengguna;
  #jenis_laporan;
  #periode_bulan;
  #periode_tahun;
  #total_pendapatan;
  #total_pengeluaran;

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
    this.#id_laporan = id_laporan;
    this.#id_outlet = id_outlet;
    this.#id_pengguna = id_pengguna;
    this.#jenis_laporan = jenis_laporan;
    this.#periode_bulan = periode_bulan;
    this.#periode_tahun = periode_tahun;
    this.#total_pendapatan = total_pendapatan;
    this.#total_pengeluaran = total_pengeluaran;
  }

  // toJSON serialization helper
  toJSON() {
    return {
      id_laporan: this.#id_laporan,
      id_outlet: this.#id_outlet,
      id_pengguna: this.#id_pengguna,
      jenis_laporan: this.#jenis_laporan,
      periode_bulan: this.#periode_bulan,
      periode_tahun: this.#periode_tahun,
      total_pendapatan: this.#total_pendapatan,
      total_pengeluaran: this.#total_pengeluaran,
    };
  }

    async getLaporanBulanan(limit = 10, offset = 0, startDate = null, endDate = null) {
    let whereClauseTrans = `MONTH(tanggal) = ? AND YEAR(tanggal) = ?`;
    let whereClausePengeluaran = `MONTH(tanggal) = ? AND YEAR(tanggal) = ?`;
    let whereClauseTransRiwayat = `MONTH(t.tanggal) = ? AND YEAR(t.tanggal) = ?`;
    let whereClausePengeluaranRiwayat = `MONTH(p.tanggal) = ? AND YEAR(p.tanggal) = ?`;
    let params = [this.#periode_bulan, this.#periode_tahun];

    if (startDate && endDate) {
      whereClauseTrans = `DATE(tanggal) >= ? AND DATE(tanggal) <= ?`;
      whereClausePengeluaran = `DATE(tanggal) >= ? AND DATE(tanggal) <= ?`;
      whereClauseTransRiwayat = `DATE(t.tanggal) >= ? AND DATE(t.tanggal) <= ?`;
      whereClausePengeluaranRiwayat = `DATE(p.tanggal) >= ? AND DATE(p.tanggal) <= ?`;
      params = [startDate, endDate];
    } else if (startDate) {
      whereClauseTrans = `DATE(tanggal) = ?`;
      whereClausePengeluaran = `DATE(tanggal) = ?`;
      whereClauseTransRiwayat = `DATE(t.tanggal) = ?`;
      whereClausePengeluaranRiwayat = `DATE(p.tanggal) = ?`;
      params = [startDate];
    }

    const ringkasanParams = [
      ...params,
      ...params,
      ...params,
    ];
    const ringkasanQuery = db.query(
      `
      SELECT 
        (SELECT COUNT(id_transaksi) 
         FROM transaksi 
         WHERE ${whereClauseTrans} AND status = 'selesai'
        ) AS total_transaksi,
        (SELECT SUM(total_harga) 
         FROM transaksi 
         WHERE ${whereClauseTrans} AND status = 'selesai'
        ) AS total_pendapatan,
        (SELECT SUM(biaya) 
         FROM pengeluaran 
         WHERE ${whereClausePengeluaran}
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
      WHERE ${whereClauseTrans} AND status = 'selesai'
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
      WHERE ${whereClauseTransRiwayat} AND t.status = 'selesai'
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
      WHERE ${whereClausePengeluaranRiwayat}
      ORDER BY p.tanggal DESC
      `,
      params,
    );

    const [
      [hasilRingkasan],
      [hasilHarian],
      [hasilRiwayat],
      [hasilPengeluaran],
    ] = await Promise.all([
      ringkasanQuery,
      harianQuery,
      riwayatQuery,
      pengeluaranQuery,
    ]);

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
      [this.#periode_tahun],
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
      [this.#periode_tahun],
    );

    return {
      ringkasan: ringkasan[0],
      detail_outlet: detailOutlet,
    };
  }

    async getDetailLaporanBulanan(startDate = null, endDate = null) {
    let whereClause = `MONTH(tanggal) = ? AND YEAR(tanggal) = ?`;
    let params = [this.#periode_bulan, this.#periode_tahun];

    if (startDate && endDate) {
      whereClause = `DATE(tanggal) >= ? AND DATE(tanggal) <= ?`;
      params = [startDate, endDate];
    } else if (startDate) {
      whereClause = `DATE(tanggal) = ?`;
      params = [startDate];
    }

    const [rows] = await db.query(
      `
      SELECT
        DATE_FORMAT(tanggal, '%Y-%m-%d') AS tanggal_transaksi, 
        COUNT(id_transaksi) AS jumlah_transaksi,
        SUM(total_harga) AS total_pendapatan 
      FROM transaksi
      WHERE ${whereClause} AND status = 'selesai'
      GROUP BY tanggal_transaksi
      ORDER BY tanggal_transaksi ASC;
      `,
      params,
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
      [this.#periode_tahun],
    );
    return rows;
  }

    async getDetailBulananOutlet(limit = 10, offset = 0, startDate = null, endDate = null) {
    let whereClause = `MONTH(tanggal) = ? AND YEAR(tanggal) = ?`;
    let whereClauseRiwayat = `MONTH(t.tanggal) = ? AND YEAR(t.tanggal) = ?`;
    let params = [this.#id_outlet, this.#periode_bulan, this.#periode_tahun];

    if (startDate && endDate) {
      whereClause = `DATE(tanggal) >= ? AND DATE(tanggal) <= ?`;
      whereClauseRiwayat = `DATE(t.tanggal) >= ? AND DATE(t.tanggal) <= ?`;
      params = [this.#id_outlet, startDate, endDate];
    } else if (startDate) {
      whereClause = `DATE(tanggal) = ?`;
      whereClauseRiwayat = `DATE(t.tanggal) = ?`;
      params = [this.#id_outlet, startDate];
    }

    const outletQuery = db.query(
      "SELECT nama_outlet FROM outlet WHERE id_outlet = ?",
      [this.#id_outlet],
    );

    const ringkasanQuery = db.query(
      `
      SELECT 
        COUNT(id_transaksi) AS total_transaksi, 
        SUM(total_harga) AS total_pendapatan
      FROM transaksi
      WHERE id_outlet = ? AND ${whereClause} AND status = 'selesai'
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
      WHERE id_outlet = ? AND ${whereClause} AND status = 'selesai'
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
      WHERE t.id_outlet = ? AND ${whereClauseRiwayat} AND t.status = 'selesai'
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
      [this.#id_outlet, this.#periode_tahun],
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

  async getLabaRugi(bulan, tahun, id_outlet = null, startDate = null, endDate = null) {
    const outletTarget = id_outlet === 'all' ? null : id_outlet;
    const useRange = startDate && endDate;
    const useSingleDate = startDate && !endDate;
    const isTahunan = !useRange && !useSingleDate && (bulan === 'all' || !bulan);

    // Helper untuk membangun klausa WHERE berdasarkan filter tanggal aktif
    const buildQuery = (baseQuery, hasWhere = false) => {
      let q = baseQuery;
      let params = [];
      if (useRange) {
        q += hasWhere ? ` AND DATE(tanggal) >= ? AND DATE(tanggal) <= ?` : ` WHERE DATE(tanggal) >= ? AND DATE(tanggal) <= ?`;
        params.push(startDate, endDate);
      } else if (useSingleDate) {
        q += hasWhere ? ` AND DATE(tanggal) = ?` : ` WHERE DATE(tanggal) = ?`;
        params.push(startDate);
      } else if (isTahunan) {
        q += hasWhere ? ` AND YEAR(tanggal) = ?` : ` WHERE YEAR(tanggal) = ?`;
        params.push(tahun);
      } else {
        q += hasWhere ? ` AND MONTH(tanggal) = ? AND YEAR(tanggal) = ?` : ` WHERE MONTH(tanggal) = ? AND YEAR(tanggal) = ?`;
        params.push(bulan, tahun);
      }
      return { query: q, params };
    };


    // 1. Total Pendapatan Seluruh Outlet
    const pendapatanAll = buildQuery(`SELECT SUM(total_harga) AS total FROM transaksi WHERE status = 'selesai'`, true);
    const [semuaPendapatan] = await db.query(pendapatanAll.query, pendapatanAll.params);
    const totalPendapatanSeluruh = parseFloat(semuaPendapatan[0].total) || 0;

    // 1.1 Total Pendapatan Target
    let totalPendapatanTarget = totalPendapatanSeluruh;
    if (outletTarget) {
      const pendapatanOutlet = buildQuery(`SELECT SUM(total_harga) AS total FROM transaksi WHERE id_outlet = ? AND status = 'selesai'`, true);
      pendapatanOutlet.params.unshift(outletTarget);
      const [outletPendapatan] = await db.query(pendapatanOutlet.query, pendapatanOutlet.params);
      totalPendapatanTarget = parseFloat(outletPendapatan[0].total) || 0;
    }

    // Proporsi (0 s.d. 1)
    const proporsi = totalPendapatanSeluruh > 0 ? (totalPendapatanTarget / totalPendapatanSeluruh) : 0;

    // 2. Total HPP Pusat (kolom tanggal di tabel penggunaan_bahan_baku)
    const hppQ = buildQuery(`SELECT SUM(jumlah_digunakan * harga_bahan_baku) AS total FROM penggunaan_bahan_baku`, false);
    const [hpp] = await db.query(hppQ.query, hppQ.params);
    const hppPusat = parseFloat(hpp[0].total) || 0;
    const hppTarget = hppPusat * proporsi;

    // 3. Total Pengeluaran Pusat (berdasarkan tanggal)
    const pengeluaranQ = buildQuery(`SELECT kategori, SUM(biaya) AS total FROM pengeluaran`, false);
    pengeluaranQ.query += ` GROUP BY kategori`;
    const [pengeluaran] = await db.query(pengeluaranQ.query, pengeluaranQ.params);
    
    const pengeluaranKategori = {};
    let totalPengeluaranOperasionalTarget = 0;
    pengeluaran.forEach(row => {
      const biayaTarget = (parseFloat(row.total) || 0) * proporsi;
      pengeluaranKategori[row.kategori] = biayaTarget;
      totalPengeluaranOperasionalTarget += biayaTarget;
    });

    // 4. Beban Waste (sisa stok yang tidak terjual)
    // Gunakan snapshot stok terakhir pada/sebelum tanggal target
    // (sama seperti pendekatan di outlet stats)
    let wasteEndDate;
    if (useRange) {
      wasteEndDate = endDate;
    } else if (useSingleDate) {
      wasteEndDate = startDate;
    } else if (isTahunan) {
      // Akhir tahun atau hari ini jika tahun berjalan
      const now = new Date();
      const currentYear = now.getFullYear();
      wasteEndDate = parseInt(tahun) >= currentYear
        ? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
        : `${tahun}-12-31`;
    } else {
      // Akhir bulan
      const lastDay = new Date(tahun, bulan, 0).getDate();
      wasteEndDate = `${tahun}-${String(bulan).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    }

    let wasteQ = `
      SELECT COALESCE(SUM(latest.jumlah_stok * latest.harga_produk), 0) AS total
      FROM (
        SELECT so.jumlah_stok, so.harga_produk,
          ROW_NUMBER() OVER (PARTITION BY so.id_produk, so.id_outlet ORDER BY so.tanggal DESC, so.created_at DESC) AS rn
        FROM stok_outlet so
        WHERE DATE(so.tanggal) <= ?`;
    let wParams = [wasteEndDate];
    
    if (outletTarget) {
      wasteQ += ` AND so.id_outlet = ?`;
      wParams.push(outletTarget);
    }
    
    wasteQ += `
      ) latest
      WHERE latest.rn = 1`;
    
    const [waste] = await db.query(wasteQ, wParams);
    const totalWasteTarget = parseFloat(waste[0].total) || 0;

    const totalPengeluaranTarget = hppTarget + totalPengeluaranOperasionalTarget + totalWasteTarget;
    const labaRugiBersih = totalPendapatanTarget - totalPengeluaranTarget;

    return {
      pendapatan: parseFloat(totalPendapatanTarget),
      proporsi: parseFloat(proporsi),
      pengeluaran: {
        hpp: parseFloat(hppTarget),
        waste: parseFloat(totalWasteTarget),
        operasional: pengeluaranKategori,
        total_operasional: parseFloat(totalPengeluaranOperasionalTarget)
      },
      total_pengeluaran: parseFloat(totalPengeluaranTarget),
      laba_rugi_bersih: parseFloat(labaRugiBersih)
    };
  }
}

module.exports = Laporan;
