const pool = require("../../config/db");

class Pengeluaran {
  #id_pengeluaran;
  #id_pengguna;
  #kategori;
  #tanggal;
  #biaya;
  #deskripsi;

  constructor(id_pengeluaran, id_pengguna, kategori, tanggal, biaya, deskripsi) {
    this.#id_pengeluaran = id_pengeluaran;
    this.#id_pengguna = id_pengguna;
    this.#kategori = kategori;
    this.#tanggal = tanggal;
    this.#biaya = biaya;
    this.#deskripsi = deskripsi;
  }

  // toJSON serialization helper
  toJSON() {
    return {
      id_pengeluaran: this.#id_pengeluaran,
      id_pengguna: this.#id_pengguna,
      kategori: this.#kategori,
      tanggal: this.#tanggal,
      biaya: this.#biaya,
      deskripsi: this.#deskripsi,
    };
  }

  async create() {
    const [rows] = await pool.query(
      `INSERT INTO pengeluaran (id_pengeluaran, id_pengguna, kategori, tanggal, biaya, deskripsi) VALUES (?,?,?,?,?,?)`,
      [
        this.#id_pengeluaran,
        this.#id_pengguna,
        this.#kategori,
        this.#tanggal,
        this.#biaya,
        this.#deskripsi,
      ],
    );
    return rows;
  }

  async getAll(month, year) {
    let query = `
      SELECT p.*, pe.nama
      FROM pengeluaran p
      LEFT JOIN pengguna pe ON pe.id_pengguna = p.id_pengguna
    `;
    const queryParams = [];

    if (month && year) {
      query += ` WHERE MONTH(p.tanggal) = ? AND YEAR(p.tanggal) = ?`;
      queryParams.push(month, year);
    }

    query += ` ORDER BY p.tanggal DESC, p.created_at DESC`;

    const [rows] = await pool.query(query, queryParams);
    return rows;
  }

  async update() {
    const [rows] = await pool.query(
      `
    UPDATE pengeluaran 
    SET kategori = ?, tanggal = ?, biaya = ?, deskripsi = ?
    WHERE id_pengeluaran = ?
    `,
      [this.#kategori, this.#tanggal, this.#biaya, this.#deskripsi, this.#id_pengeluaran],
    );

    return rows;
  }

  async delete() {
    const [rows] = await pool.query(
      `DELETE FROM pengeluaran WHERE id_pengeluaran = ?`,
      [this.#id_pengeluaran],
    );
    return rows;
  }
}

module.exports = Pengeluaran;
