const pool = require("../../config/db");

class Produk {
  constructor(id_produk, id_kategori, nama_produk, deskripsi, harga) {
    this.id_produk = id_produk;
    this.id_kategori = id_kategori;
    this.nama_produk = nama_produk;
    this.deskripsi = deskripsi;
    this.harga = harga;
  }

  async getAll() {
    const [rows] = await pool.query("SELECT * FROM produk");
    return rows;
  }

  async getById() {
    const [rows] = await pool.query(
      "SELECT * FROM produk WHERE id_produk = ?",
      [this.id_produk],
    );
    return rows[0];
  }

  async getByKategori() {
    const [rows] = await pool.query(
      "SELECT * FROM produk WHERE id_kategori = ?",
      [this.id_kategori],
    );
    return rows;
  }

  async create() {
    const [result] = await pool.query(
      "INSERT INTO produk (id_produk,id_kategori, nama_produk, deskripsi, harga) VALUES (?,?, ?, ?, ?)",
      [
        this.id_produk,
        this.id_kategori,
        this.nama_produk,
        this.deskripsi,
        this.harga,
      ],
    );
    return result.insertId;
  }

  async update() {
    const [result] = await pool.query(
      "UPDATE produk SET id_kategori = ?, nama_produk = ?, deskripsi = ?, harga = ? WHERE id_produk = ? ",
      [
        this.id_kategori,
        this.nama_produk,
        this.deskripsi,
        this.harga,
        this.id_produk,
      ],
    );
    return result.affectedRows;
  }

  async delete() {
    const [rows] = await pool.query("DELETE FROM produk WHERE id_produk = ?", [
      this.id_produk,
    ]);
    return rows.affectedRows;
  }
  async tambahStok(id_outlet, jumlah) {
    const [rows] = await pool.query(
      `SELECT jumlah_stok FROM stok_outlet 
     WHERE id_produk = ? AND id_outlet = ?`,
      [this.id_produk, id_outlet],
    );

    if (rows.length === 0) {
      const crypto = require("crypto");
      const id_stok = crypto.randomUUID();

      await pool.query(
        `INSERT INTO stok_outlet (id_stok_outlet, id_produk, id_outlet, jumlah_stok)
       VALUES (?, ?, ?, ?)`,
        [id_stok, this.id_produk, id_outlet, jumlah],
      );
    } else {
      await pool.query(
        `UPDATE stok_outlet
       SET jumlah_stok = jumlah_stok + ?, updated_at = NOW()
       WHERE id_produk = ? AND id_outlet = ?`,
        [jumlah, this.id_produk, id_outlet],
      );
    }

    return true;
  }
}

module.exports = Produk;
