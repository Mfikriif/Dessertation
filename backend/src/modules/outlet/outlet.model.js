const pool = require("../../config/db");

class Outlet {
  constructor(id_outlet, nama_outlet, alamat) {
    this.id_outlet = id_outlet;
    this.nama_outlet = nama_outlet;
    this.alamat = alamat;
  }

  async getAll() {
    const [rows] = await pool.query("SELECT * FROM outlet");
    return rows;
  }

  async create() {
    const [rows] = await pool.query(
      "INSERT INTO outlet (id_outlet, nama_outlet, alamat) VALUES (?, ?, ?)",
      [this.id_outlet, this.nama_outlet, this.alamat],
    );
    return rows;
  }

  async update() {
    const [rows] = await pool.query(
      "UPDATE outlet SET nama_outlet = ?, alamat = ? WHERE id_outlet = ?",
      [this.nama_outlet, this.alamat, this.id_outlet],
    );

    return rows;
  }
}

module.exports = Outlet;
