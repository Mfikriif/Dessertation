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

  async getOutletStats() {
    const id_outlet = this.#id_outlet;

    const [todayRows] = await pool.query(
      `SELECT COALESCE(SUM(dt.jumlah), 0) AS total
       FROM detail_transaksi dt
       JOIN transaksi t ON dt.id_transaksi = t.id_transaksi
       WHERE t.id_outlet = ? AND t.status = 'selesai' AND DATE(t.tanggal) = CURDATE()`,
      [id_outlet],
    );

    const [yesterdayRows] = await pool.query(
      `SELECT COALESCE(SUM(dt.jumlah), 0) AS total
       FROM detail_transaksi dt
       JOIN transaksi t ON dt.id_transaksi = t.id_transaksi
       WHERE t.id_outlet = ? AND t.status = 'selesai' AND DATE(t.tanggal) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)`,
      [id_outlet],
    );

    const [twoDaysAgoRows] = await pool.query(
      `SELECT COALESCE(SUM(dt.jumlah), 0) AS total
       FROM detail_transaksi dt
       JOIN transaksi t ON dt.id_transaksi = t.id_transaksi
       WHERE t.id_outlet = ? AND t.status = 'selesai' AND DATE(t.tanggal) = DATE_SUB(CURDATE(), INTERVAL 2 DAY)`,
      [id_outlet],
    );

    const [threeDaysAgoRows] = await pool.query(
      `SELECT COALESCE(SUM(dt.jumlah), 0) AS total
       FROM detail_transaksi dt
       JOIN transaksi t ON dt.id_transaksi = t.id_transaksi
       WHERE t.id_outlet = ? AND t.status = 'selesai' AND DATE(t.tanggal) = DATE_SUB(CURDATE(), INTERVAL 3 DAY)`,
      [id_outlet],
    );

    const [unsoldRows] = await pool.query(
      `SELECT COALESCE(SUM(latest.jumlah_stok), 0) AS total
       FROM (
         SELECT so.jumlah_stok,
           ROW_NUMBER() OVER (PARTITION BY so.id_produk ORDER BY so.created_at DESC) AS rn
         FROM stok_outlet so
         WHERE so.id_outlet = ?
       ) latest
       WHERE latest.rn = 1`,
      [id_outlet],
    );

    // Jenis produk yang tidak terjual HARI INI (existing)
    const [zeroSalesRows] = await pool.query(
      `SELECT COUNT(DISTINCT so.id_produk) AS total
       FROM stok_outlet so
       WHERE so.id_outlet = ? AND so.id_produk NOT IN (
         SELECT DISTINCT dt.id_produk
         FROM detail_transaksi dt
         JOIN transaksi t ON dt.id_transaksi = t.id_transaksi
         WHERE t.id_outlet = ? AND t.status = 'selesai' AND DATE(t.tanggal) = CURDATE()
       )`,
      [id_outlet, id_outlet],
    );

    // Jenis produk yang tidak terjual KEMARIN (count)
    const [zeroSalesYesterdayRows] = await pool.query(
      `SELECT COUNT(DISTINCT so.id_produk) AS total
       FROM stok_outlet so
       WHERE so.id_outlet = ? AND so.id_produk NOT IN (
         SELECT DISTINCT dt.id_produk
         FROM detail_transaksi dt
         JOIN transaksi t ON dt.id_transaksi = t.id_transaksi
         WHERE t.id_outlet = ? AND t.status = 'selesai' AND DATE(t.tanggal) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)
       )`,
      [id_outlet, id_outlet],
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
          WHERE dt.id_produk = p.id_produk AND t.id_outlet = ? AND t.status = 'selesai' AND DATE(t.tanggal) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)
         ) AS terjual_kemarin,
         (SELECT COALESCE(so2.jumlah_stok, 0)
          FROM stok_outlet so2
          WHERE so2.id_produk = p.id_produk AND so2.id_outlet = ?
          ORDER BY so2.created_at DESC
          LIMIT 1
         ) AS sisa_stok
       FROM stok_outlet so
       JOIN produk p ON so.id_produk = p.id_produk
       JOIN kategori k ON p.id_kategori = k.id_kategori
       WHERE so.id_outlet = ?
       ORDER BY k.nama_kategori, p.nama_produk`,
      [id_outlet, id_outlet, id_outlet],
    );

    // Daftar Total Stok Masuk (Semua produk dan jumlah_stok terbaru)
    const [daftarStokMasuk] = await pool.query(
      `SELECT DISTINCT
         p.id_produk,
         p.nama_produk,
         k.nama_kategori,
         p.harga,
         (SELECT COALESCE(so2.jumlah_stok, 0)
          FROM stok_outlet so2
          WHERE so2.id_produk = p.id_produk AND so2.id_outlet = ?
          ORDER BY so2.created_at DESC
          LIMIT 1
         ) AS total_stok
       FROM stok_outlet so
       JOIN produk p ON so.id_produk = p.id_produk
       JOIN kategori k ON p.id_kategori = k.id_kategori
       WHERE so.id_outlet = ?
       ORDER BY k.nama_kategori, p.nama_produk`,
      [id_outlet, id_outlet],
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
       WHERE t.id_outlet = ? AND t.status = 'selesai' AND DATE(t.tanggal) = CURDATE()
       GROUP BY p.id_produk, p.nama_produk, k.nama_kategori, p.harga
       ORDER BY total_terjual DESC`,
      [id_outlet],
    );

    // Daftar produk yang TIDAK TERJUAL HARI INI (detail list)
    const [unsoldProductsToday] = await pool.query(
      `SELECT DISTINCT
         p.id_produk,
         p.nama_produk,
         k.nama_kategori,
         p.harga,
         (SELECT COALESCE(so2.jumlah_stok, 0)
          FROM stok_outlet so2
          WHERE so2.id_produk = p.id_produk AND so2.id_outlet = ?
          ORDER BY so2.created_at DESC
          LIMIT 1
         ) AS sisa_stok
       FROM stok_outlet so
       JOIN produk p ON so.id_produk = p.id_produk
       JOIN kategori k ON p.id_kategori = k.id_kategori
       WHERE so.id_outlet = ? AND so.id_produk NOT IN (
         SELECT DISTINCT dt.id_produk
         FROM detail_transaksi dt
         JOIN transaksi t ON dt.id_transaksi = t.id_transaksi
         WHERE t.id_outlet = ? AND t.status = 'selesai' AND DATE(t.tanggal) = CURDATE()
       )
       ORDER BY k.nama_kategori, p.nama_produk`,
      [id_outlet, id_outlet, id_outlet],
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
      daftar_stok_masuk: daftarStokMasuk.map((row) => ({
        id_produk: row.id_produk,
        nama_produk: row.nama_produk,
        nama_kategori: row.nama_kategori,
        harga: Number(row.harga),
        total_stok: Number(row.total_stok),
      })),
    };
  }
}

module.exports = Outlet;
