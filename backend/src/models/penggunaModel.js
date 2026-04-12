const pool = require("../config/db");

class Pengguna {
  constructor(id_pengguna, nama, email, password, role) {
    this.id_pengguna = id_pengguna;
    this.nama = nama;
    this.email = email;
    this.password = password;
    this.role = role;
  }

  static async findByName(name) {
    const [rows] = await pool.query("SELECT * FROM pengguna WHERE nama = ?", [
      name,
    ]);
    return rows[0];
  }

  static async findByEmail(email) {
    const [rows] = await pool.query("SELECT * FROM pengguna WHERE email = ?", [
      email,
    ]);
    return rows[0];
  }

  static async create(pengguna) {
    const [result] = await pool.query(
      "INSERT INTO pengguna (id_pengguna, nama, email, password, role) VALUES (?, ?, ?, ?, ?)",
      [
        pengguna.id_pengguna,
        pengguna.nama,
        pengguna.email,
        pengguna.password,
        pengguna.role,
      ],
    );
    return result;
  }
}

module.exports = Pengguna;
