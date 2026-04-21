const pool = require("../../config/db");

class Bahanbaku {
  constructor(id_bahan_baku, nama_bahan, satuan) {
    this.id_bahan_baku = id_bahan_baku;
    this.nama_bahan = nama_bahan;
    this.satuan = satuan;
  }

  async getAll() {
    const [rows] = await pool.query(
      `SELECT b.*, s.jumlah_stok, s.stok_minimum 
       FROM bahan_baku b 
       LEFT JOIN stok_bahan_baku s ON b.id_bahan_baku = s.id_bahan_baku`
    );
    return rows;
  }

  async getById() {
    const [rows] = await pool.query(
      `SELECT b.*, s.jumlah_stok, s.stok_minimum 
       FROM bahan_baku b 
       LEFT JOIN stok_bahan_baku s ON b.id_bahan_baku = s.id_bahan_baku 
       WHERE b.id_bahan_baku = ? `,
      [this.id_bahan_baku],
    );
    return rows[0];
  }

  async findByName() {
    const [rows] = await pool.query(
      `SELECT b.*, s.jumlah_stok, s.stok_minimum 
       FROM bahan_baku b 
       LEFT JOIN stok_bahan_baku s ON b.id_bahan_baku = s.id_bahan_baku 
       WHERE b.nama_bahan LIKE ?`,
      [`%${this.nama_bahan}%`],
    );
    return rows;
  }

  async create() {
    const [rows] = await pool.query(
      "INSERT INTO bahan_baku (id_bahan_baku, nama_bahan, satuan) VALUES (?, ?, ?)",
      [this.id_bahan_baku, this.nama_bahan, this.satuan],
    );
    return rows;
  }

  async update() {
    const [rows] = await pool.query(
      "UPDATE bahan_baku SET nama_bahan = ?, satuan = ? WHERE id_bahan_baku = ?",
      [this.nama_bahan, this.satuan, this.id_bahan_baku],
    );
    return rows;
  }

  async delete() {
    // Delete child rows first since they might have RESTRICT constraints
    await pool.query(
      "DELETE FROM penggunaan_bahan_baku WHERE id_bahan_baku = ?",
      [this.id_bahan_baku],
    );
    await pool.query(
      "DELETE FROM stok_bahan_baku WHERE id_bahan_baku = ?",
      [this.id_bahan_baku],
    );
    const [rows] = await pool.query(
      "DELETE FROM bahan_baku WHERE id_bahan_baku = ?",
      [this.id_bahan_baku],
    );
    return rows;
  }

  // ➕ TAMBAH STOK
  async tambahStok(jumlah) {
    const [rows] = await pool.query(
      `SELECT jumlah_stok FROM stok_bahan_baku WHERE id_bahan_baku = ?`,
      [this.id_bahan_baku],
    );

    if (rows.length === 0) {
      // kalau belum ada → insert
      await pool.query(
        `INSERT INTO stok_bahan_baku (id_bahan_baku, jumlah_stok)
       VALUES (?, ?)`,
        [this.id_bahan_baku, jumlah],
      );
    } else {
      // kalau sudah ada → update
      await pool.query(
        `UPDATE stok_bahan_baku
       SET jumlah_stok = jumlah_stok + ?
       WHERE id_bahan_baku = ?`,
        [jumlah, this.id_bahan_baku],
      );
    }

    return true;
  }

  // ➖ KURANGI STOK
  async kurangiStok(jumlah) {
    const [rows] = await pool.query(
      `SELECT jumlah_stok FROM stok_bahan_baku WHERE id_bahan_baku = ?`,
      [this.id_bahan_baku],
    );

    if (rows.length === 0) {
      throw new Error("Data stok tidak ditemukan");
    }

    const stok = rows[0].jumlah_stok;

    if (stok < jumlah) {
      throw new Error("Stok tidak cukup");
    }

    await pool.query(
      `UPDATE stok_bahan_baku
     SET jumlah_stok = jumlah_stok - ?
     WHERE id_bahan_baku = ?`,
      [jumlah, this.id_bahan_baku],
    );

    return true;
  }
}

module.exports = Bahanbaku;
