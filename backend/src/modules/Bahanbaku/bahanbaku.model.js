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
      "SELECT + FROM bahan_baku WHERE nama_bahan = ?",
      [this.nama_bahan],
    );
    return rows;
  }
}

module.exports = Bahanbaku;
