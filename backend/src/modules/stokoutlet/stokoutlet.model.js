const pool = require("../../config/db");

class StokOutlet {
  #id_stok_outlet;
  #id_produk;
  #id_outlet;
  #jumlah_stok;

  constructor(id_stok_outlet, id_produk, id_outlet, jumlah_stok) {
    this.#id_stok_outlet = id_stok_outlet;
    this.#id_produk = id_produk;
    this.#id_outlet = id_outlet;
    this.#jumlah_stok = jumlah_stok;
  }

  // toJSON serialization helper
  toJSON() {
    return {
      id_stok_outlet: this.#id_stok_outlet,
      id_produk: this.#id_produk,
      id_outlet: this.#id_outlet,
      jumlah_stok: this.#jumlah_stok,
    };
  }

  async createInitiateStokOutlet() {
    const [rows] = await pool.query(
      "INSERT INTO stok_outlet (id_stok_outlet, id_produk, id_outlet, jumlah_stok) VALUES (?, ?, ?, ?)",
      [
        this.#id_stok_outlet,
        this.#id_produk,
        this.#id_outlet,
        this.#jumlah_stok,
      ],
    );
    return rows;
  }
}

module.exports = StokOutlet;
