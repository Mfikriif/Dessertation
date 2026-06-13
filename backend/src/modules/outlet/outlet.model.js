const pool = require("../../config/db");

class Outlet {
  #id_outlet;
  #nama_outlet;
  #alamat;

  constructor(id_outlet, nama_outlet, alamat) {
    this.#id_outlet = id_outlet;
    this.#nama_outlet = nama_outlet;
    this.#alamat = alamat;
  }

  // toJSON serialization helper
  toJSON() {
    return {
      id_outlet: this.#id_outlet,
      nama_outlet: this.#nama_outlet,
      alamat: this.#alamat,
    };
  }

  async getAll() {
    const [rows] = await pool.query("SELECT * FROM outlet");
    return rows;
  }

  async create() {
    const [rows] = await pool.query(
      "INSERT INTO outlet (id_outlet, nama_outlet, alamat) VALUES (?, ?, ?)",
      [this.#id_outlet, this.#nama_outlet, this.#alamat],
    );
    return rows;
  }

  async createOutletAndInitiateStok() {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      await connection.query(
        `INSERT INTO outlet (id_outlet, nama_outlet, alamat) VALUES (?,?,?)`,
        [this.#id_outlet, this.#nama_outlet, this.#alamat],
      );

      const [produklist] = await connection.query(
        `SELECT id_produk FROM produk`,
      );

      if (produklist.length > 0) {
        const insertProduk = produklist.map((prdk) => {
          const IdstokOutlet = crypto.randomUUID();
          const stokAwal = 0;

          return connection.query(
            `INSERT INTO stok_outlet (id_stok_outlet, id_produk, id_outlet, jumlah_stok) VALUES (?, ?, ?, ?)`,
            [IdstokOutlet, prdk.id_produk, this.#id_outlet, stokAwal],
          );
        });

        await Promise.all(insertProduk);
      }

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async update() {
    const [rows] = await pool.query(
      "UPDATE outlet SET nama_outlet = ?, alamat = ? WHERE id_outlet = ?",
      [this.#nama_outlet, this.#alamat, this.#id_outlet],
    );

    return rows;
  }

  async delete() {
    const [rows] = await pool.query(`DELETE FROM outlet WHERE id_outlet = ?`, [
      this.#id_outlet,
    ]);
    return rows;
  }

  async getOutletStats(targetDate = null) {
    const id_outlet = this.#id_outlet;

    const formatDate = (dateObj) => {
      const y = dateObj.getFullYear();
      const m = String(dateObj.getMonth() + 1).padStart(2, "0");
      const d = String(dateObj.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    };

    let baseDate = new Date();
    if (targetDate) {
      baseDate = new Date(targetDate);
    }
    const strToday = formatDate(baseDate);
    
    const dMinus1 = new Date(baseDate); dMinus1.setDate(dMinus1.getDate() - 1);
    const strMinus1 = formatDate(dMinus1);

    const dMinus2 = new Date(baseDate); dMinus2.setDate(dMinus2.getDate() - 2);
    const strMinus2 = formatDate(dMinus2);

    const dMinus3 = new Date(baseDate); dMinus3.setDate(dMinus3.getDate() - 3);
    const strMinus3 = formatDate(dMinus3);

    const [todayRows] = await pool.query(
      `SELECT COALESCE(SUM(dt.jumlah), 0) AS total
       FROM detail_transaksi dt
       JOIN transaksi t ON dt.id_transaksi = t.id_transaksi
       WHERE t.id_outlet = ? AND t.status = 'selesai' AND DATE(t.tanggal) = ?`,
      [id_outlet, strToday],
    );

    const [yesterdayRows] = await pool.query(
      `SELECT COALESCE(SUM(dt.jumlah), 0) AS total
       FROM detail_transaksi dt
       JOIN transaksi t ON dt.id_transaksi = t.id_transaksi
       WHERE t.id_outlet = ? AND t.status = 'selesai' AND DATE(t.tanggal) = ?`,
      [id_outlet, strMinus1],
    );

    const [twoDaysAgoRows] = await pool.query(
      `SELECT COALESCE(SUM(dt.jumlah), 0) AS total
       FROM detail_transaksi dt
       JOIN transaksi t ON dt.id_transaksi = t.id_transaksi
       WHERE t.id_outlet = ? AND t.status = 'selesai' AND DATE(t.tanggal) = ?`,
      [id_outlet, strMinus2],
    );

    const [threeDaysAgoRows] = await pool.query(
      `SELECT COALESCE(SUM(dt.jumlah), 0) AS total
       FROM detail_transaksi dt
       JOIN transaksi t ON dt.id_transaksi = t.id_transaksi
       WHERE t.id_outlet = ? AND t.status = 'selesai' AND DATE(t.tanggal) = ?`,
      [id_outlet, strMinus3],
    );

    const [unsoldRows] = await pool.query(
      `SELECT COALESCE(SUM(latest.jumlah_stok), 0) AS total
       FROM (
         SELECT so.jumlah_stok,
           ROW_NUMBER() OVER (PARTITION BY so.id_produk ORDER BY so.tanggal DESC, so.created_at DESC) AS rn
         FROM stok_outlet so
         WHERE so.id_outlet = ? AND DATE(so.tanggal) <= ?
       ) latest
       WHERE latest.rn = 1`,
      [id_outlet, strToday],
    );

    // Jenis produk yang tidak terjual HARI INI (existing)
    const [zeroSalesRows] = await pool.query(
      `SELECT COUNT(DISTINCT so.id_produk) AS total
       FROM stok_outlet so
       WHERE so.id_outlet = ? AND so.id_produk NOT IN (
         SELECT DISTINCT dt.id_produk
         FROM detail_transaksi dt
         JOIN transaksi t ON dt.id_transaksi = t.id_transaksi
         WHERE t.id_outlet = ? AND t.status = 'selesai' AND DATE(t.tanggal) = ?
       )`,
      [id_outlet, id_outlet, strToday],
    );

    // Jenis produk yang tidak terjual KEMARIN (count)
    const [zeroSalesYesterdayRows] = await pool.query(
      `SELECT COUNT(DISTINCT so.id_produk) AS total
       FROM stok_outlet so
       WHERE so.id_outlet = ? AND so.id_produk NOT IN (
         SELECT DISTINCT dt.id_produk
         FROM detail_transaksi dt
         JOIN transaksi t ON dt.id_transaksi = t.id_transaksi
         WHERE t.id_outlet = ? AND t.status = 'selesai' AND DATE(t.tanggal) = ?
       )`,
      [id_outlet, id_outlet, strMinus1],
    );

    // Daftar Evaluasi Stok Kemarin (semua produk dengan jumlah terjual kemarin dan sisa stok)
    const [evaluasiStokKemarin] = await pool.query(
      `SELECT DISTINCT
         p.id_produk,
         p.nama_produk,
         k.nama_kategori,
         p.harga,
         (SELECT COALESCE(SUM(dt.jumlah), 0)
          FROM detail_transaksi dt
          JOIN transaksi t ON dt.id_transaksi = t.id_transaksi
          WHERE dt.id_produk = p.id_produk AND t.id_outlet = ? AND t.status = 'selesai' AND DATE(t.tanggal) = ?
         ) AS terjual_kemarin,
         (SELECT COALESCE(so2.jumlah_stok, 0)
          FROM stok_outlet so2
          WHERE so2.id_produk = p.id_produk AND so2.id_outlet = ? AND DATE(so2.tanggal) <= ?
          ORDER BY so2.tanggal DESC, so2.created_at DESC
          LIMIT 1
         ) AS sisa_stok
       FROM stok_outlet so
       JOIN produk p ON so.id_produk = p.id_produk
       JOIN kategori k ON p.id_kategori = k.id_kategori
       WHERE so.id_outlet = ?
       ORDER BY k.nama_kategori, p.nama_produk`,
      [id_outlet, strMinus1, id_outlet, strMinus1, id_outlet],
    );

    // Daftar produk yang TERJUAL HARI INI (detail list)
    const [soldProductsToday] = await pool.query(
      `SELECT 
         p.id_produk,
         p.nama_produk,
         k.nama_kategori,
         p.harga,
         SUM(dt.jumlah) AS total_terjual,
         SUM(dt.subtotal) AS total_pendapatan
       FROM detail_transaksi dt
       JOIN transaksi t ON dt.id_transaksi = t.id_transaksi
       JOIN produk p ON dt.id_produk = p.id_produk
       JOIN kategori k ON p.id_kategori = k.id_kategori
       WHERE t.id_outlet = ? AND t.status = 'selesai' AND DATE(t.tanggal) = ?
       GROUP BY p.id_produk, p.nama_produk, k.nama_kategori, p.harga
       ORDER BY total_terjual DESC`,
      [id_outlet, strToday],
    );

    // Daftar Rekap Keseluruhan HARI INI (Riwayat Stok)
    const [unsoldProductsToday] = await pool.query(
      `SELECT DISTINCT
         p.id_produk,
         p.nama_produk,
         k.nama_kategori,
         p.harga,
         (
           (SELECT COALESCE(so2.jumlah_stok, 0)
            FROM stok_outlet so2
            WHERE so2.id_produk = p.id_produk AND so2.id_outlet = ? AND DATE(so2.tanggal) <= ?
            ORDER BY so2.tanggal DESC, so2.created_at DESC
            LIMIT 1)
           +
           (SELECT COALESCE(SUM(dt.jumlah), 0)
            FROM detail_transaksi dt
            JOIN transaksi t ON dt.id_transaksi = t.id_transaksi
            WHERE dt.id_produk = p.id_produk AND t.id_outlet = ? AND t.status = 'selesai' AND DATE(t.tanggal) = ?)
         ) AS stok_masuk,
         (SELECT COALESCE(SUM(dt.jumlah), 0)
          FROM detail_transaksi dt
          JOIN transaksi t ON dt.id_transaksi = t.id_transaksi
          WHERE dt.id_produk = p.id_produk AND t.id_outlet = ? AND t.status = 'selesai' AND DATE(t.tanggal) = ?
         ) AS terjual,
         (SELECT COALESCE(so2.jumlah_stok, 0)
          FROM stok_outlet so2
          WHERE so2.id_produk = p.id_produk AND so2.id_outlet = ? AND DATE(so2.tanggal) <= ?
          ORDER BY so2.tanggal DESC, so2.created_at DESC
          LIMIT 1
         ) AS sisa_stok
       FROM stok_outlet so
       JOIN produk p ON so.id_produk = p.id_produk
       JOIN kategori k ON p.id_kategori = k.id_kategori
       WHERE so.id_outlet = ?
       ORDER BY k.nama_kategori, p.nama_produk`,
      [
        id_outlet, strToday,
        id_outlet, strToday,
        id_outlet, strToday,
        id_outlet, strToday,
        id_outlet
      ],
    );

    return {
      terjual_hari_ini: Number(todayRows[0].total),
      terjual_kemarin: Number(yesterdayRows[0].total),
      terjual_2_hari_lalu: Number(twoDaysAgoRows[0].total),
      terjual_3_hari_lalu: Number(threeDaysAgoRows[0].total),
      tidak_terjual: Number(unsoldRows[0].total),
      jenis_produk_tidak_terjual: Number(zeroSalesRows[0].total),
      jenis_produk_tidak_terjual_kemarin: Number(
        zeroSalesYesterdayRows[0].total,
      ),
      daftar_produk_terjual_hari_ini: soldProductsToday.map((row) => ({
        id_produk: row.id_produk,
        nama_produk: row.nama_produk,
        nama_kategori: row.nama_kategori,
        harga: Number(row.harga),
        total_terjual: Number(row.total_terjual),
        total_pendapatan: Number(row.total_pendapatan),
      })),
      daftar_produk_tidak_terjual_hari_ini: unsoldProductsToday.map((row) => ({
        id_produk: row.id_produk,
        nama_produk: row.nama_produk,
        nama_kategori: row.nama_kategori,
        harga: Number(row.harga),
        stok_masuk: Number(row.stok_masuk),
        terjual: Number(row.terjual),
        sisa_stok: Number(row.sisa_stok),
      })),
      daftar_evaluasi_kemarin: evaluasiStokKemarin.map((row) => ({
        id_produk: row.id_produk,
        nama_produk: row.nama_produk,
        nama_kategori: row.nama_kategori,
        harga: Number(row.harga),
        terjual_kemarin: Number(row.terjual_kemarin),
        sisa_stok: Number(row.sisa_stok),
      })),
    };
  }
}

module.exports = Outlet;
