const pool = require("../../config/db");

class Bahanbaku {
  constructor(id_bahan_baku, nama_bahan, satuan) {
    this.id_bahan_baku = id_bahan_baku;
    this.nama_bahan = nama_bahan;
    this.satuan = satuan;
  }

  async getAll() {
    const [rows] = await pool.query("SELECT * FROM bahan_baku");
    return rows;
  }

  async getById() {
    const [rows] = await pool.query(
      "SELECT * FROM bahan_baku WHERE id_bahan_baku = ? ",
      [this.id_bahan_baku],
    );
    return rows[0];
  }

  async findByName() {
    const [rows] = await pool.query(
      "SELECT * FROM bahan_baku WHERE nama_bahan LIKE ?",
      [this.nama_bahan],
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
    const [rows] = await pool.query(
      "DELETE FROM bahan_baku WHERE id_bahan_baku = ?",
      [this.id_bahan_baku],
    );
    return rows;
  }
}

module.exports = Bahanbaku;
