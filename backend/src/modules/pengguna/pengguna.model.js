const pool = require("../../config/db");

class Pengguna {
  constructor(id_pengguna, nama, email, password = null, role) {
    this.id_pengguna = id_pengguna;
    this.nama = nama;
    this.email = email;
    this.password = password;
    this.role = role;
  }

  static async findByName(nama) {
    const [rows] = await pool.query(
      "SELECT * FROM pengguna WHERE nama = ? AND is_active = 1",
      [nama],
    );
    return rows[0];
  }

  static async findByEmail(email) {
    const [rows] = await pool.query(
      "SELECT * FROM pengguna WHERE email = ? AND is_active = 1",
      [email],
    );
    return rows[0];
  }

  async getPenggunaById() {
    const [rows] = await pool.query(
      "SELECT nama, email, role FROM pengguna WHERE id_pengguna = ?",
      [this.id_pengguna],
    );
    return rows[0];
  }

  async getPenggunaByRole() {
    const [rows] = await pool.query(
      "SELECT id_pengguna, nama, email, role FROM pengguna WHERE role = ? AND is_active = 1",
      [this.role],
    );
    return rows;
  }

  static async getAll() {
    const [rows] = await pool.query(
      "SELECT id_pengguna, nama, email, role FROM pengguna WHERE is_active = 1",
    );
    return rows;
  }

  // INSTANCE METHOD
  async create() {
    const [result] = await pool.query(
      "INSERT INTO pengguna (id_pengguna, nama, email, password, role) VALUES (?, ?, ?, ?, ?)",
      [this.id_pengguna, this.nama, this.email, this.password, this.role],
    );
    return result;
  }

  async updatePassword() {
    const [rows] = await pool.query(
      "UPDATE pengguna SET password = ? WHERE id_pengguna = ?",
      [this.password, this.id_pengguna],
    );
    return rows;
  }

  async update() {
    const [rows] = await pool.query(
      "UPDATE pengguna SET nama = ?, email = ?, role = ? WHERE id_pengguna = ?",
      [this.nama, this.email, this.role, this.id_pengguna],
    );
    return rows;
  }

  async delete() {
    const [rows] = await pool.query(
      "UPDATE pengguna SET is_active = 0 WHERE id_pengguna = ?",
      [this.id_pengguna],
    );
    return rows;
  }
}

module.exports = Pengguna;
