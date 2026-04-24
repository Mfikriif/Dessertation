const pool = require("../../config/db");

class StokBahanBaku {
  constructor(id_stok_bb, id_bahan_baku, jumlah_stok, stok_minimum) {
    this.id_stok_bb = id_stok_bb;
    this.id_bahan_baku = id_bahan_baku;
    this.jumlah_stok = jumlah_stok;
    this.stok_minimum = stok_minimum;
  }

  async createInitialStok() {
    const [rows] = await pool.query(
      "INSERT INTO stok_bahan_baku ( id_stok_bb , id_bahan_baku, jumlah_stok, stok_minimum) VALUES (?, ?, ?, ?)",
      [
        this.id_stok_bb,
        this.id_bahan_baku,
        this.jumlah_stok,
        this.stok_minimum,
      ],
    );
    return rows;
  }

  async updateStok(jumlahStok, id_bahan_baku) {
    const [rows] = await pool.query(
      `UPDATE stok_bahan_baku SET jumlah_stok = jumlah_stok - ? WHERE id_bahan_baku = ?`,
      [jumlahStok, id_bahan_baku],
    );
    return rows;
  }

  async getAllStok() {
    const [rows] = await pool.query(
      `SELECT b.*, s.jumlah_stok, s.stok_minimum 
       FROM bahan_baku b 
       LEFT JOIN stok_bahan_baku s ON b.id_bahan_baku = s.id_bahan_baku`,
    );
    return rows;
  }
}

module.exports = StokBahanBaku;
