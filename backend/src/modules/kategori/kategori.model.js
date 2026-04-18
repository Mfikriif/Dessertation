const pool = require("../../config/db");

class kategori {
  constructor(id_kategori, kode_kategori, nama_kategori) {
    this.id_kategori = id_kategori;
    this.kode_kategori = kode_kategori;
    this.nama_kategori = nama_kategori;
  }

  async getAll() {
    const [rows] = await pool.query(`SELECT * FROM kategori`);
    return rows;
  }

  async create() {
    const rows = await pool.query(
      `INSERT INTO kategori (id_kategori, kode_kategori, nama_kategori) VALUES (?,?,?)`,
      [this.id_kategori, this.kode_kategori, this.nama_kategori],
    );
    return rows;
  }

  async update() {
    const [rows] = await pool.query(
      `UPDATE kategori SET kode_kategori = ? , nama_kategori = ? WHERE id_kategori = ?`,
      [this.kode_kategori, this.nama_kategori, this.id_kategori],
    );
    return rows;
  }

  async delete() {
    const [rows] = await pool.query(
      `DELETE FROM kategori WHERE id_kategori = ?`,
      [this.id_kategori],
    );
    return rows;
  }
}

module.exports = kategori;
