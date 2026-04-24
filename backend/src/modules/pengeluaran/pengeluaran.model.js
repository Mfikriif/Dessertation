const pool = require("../../config/db");

class Pengeluaran {
  constructor(id_pengeluaran, id_pengguna, tanggal, biaya, deskripsi) {
    this.id_pengeluaran = id_pengeluaran;
    this.id_pengguna = id_pengguna;
    this.tanggal = tanggal;
    this.biaya = biaya;
    this.deskripsi = deskripsi;
  }

  async create() {
    const [rows] = await pool.query(
      `INSERT INTO pengeluaran (id_pengeluaran, id_pengguna, tanggal, biaya, deskripsi) VALUES (?,?,?,?,?)`,
      [
        this.id_pengeluaran,
        this.id_pengguna,
        this.tanggal,
        this.biaya,
        this.deskripsi,
      ],
    );
    return rows;
  }

  async getAll() {
    const [rows] = await pool.query(
      `
        SELECT p.*, pe.nama
        FROM pengeluaran p
        LEFT JOIN pengguna pe ON pe.id_pengguna = p.id_pengguna
          `,
    );
    return rows;
  }

  async update() {
    const [rows] = await pool.query(
      `
    UPDATE pengeluaran 
    SET tanggal = ?, biaya = ?, deskripsi = ?
    WHERE id_pengeluaran = ?
    `,
      [this.tanggal, this.biaya, this.deskripsi, this.id_pengeluaran],
    );

    return rows;
  }

  async delete() {
    const [rows] = await pool.query(
      `DELETE FROM pengeluaran WHERE id_pengeluaran = ?`,
      [this.id_pengeluaran],
    );
    return rows;
  }
}

module.exports = Pengeluaran;
