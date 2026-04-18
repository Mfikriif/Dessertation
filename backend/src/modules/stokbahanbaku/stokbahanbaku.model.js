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
}

module.exports = StokBahanBaku;
