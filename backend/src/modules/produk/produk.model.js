const pool = require("../../config/db");

class Produk {
  constructor(
    id_produk,
    id_kategori,
    nama_produk,
    deskripsi,
    harga,
    nama_kategori,
  ) {
    this.id_produk = id_produk;
    this.id_kategori = id_kategori;
    this.nama_produk = nama_produk;
    this.deskripsi = deskripsi;
    this.harga = harga;
  }

  async getAll() {
    const [rows] = await pool.query(
      `SELECT p.id_produk, p.id_kategori, p.nama_produk, p.deskripsi, p.harga, k.nama_kategori 
       FROM produk p 
       JOIN kategori k ON p.id_kategori = k.id_kategori`,
    );
    return rows;
  }

  async getById() {
    const [rows] = await pool.query(
      `SELECT p.id_produk, p.id_kategori, p.nama_produk, p.deskripsi, p.harga, k.nama_kategori 
       FROM produk p 
       JOIN kategori k ON p.id_kategori = k.id_kategori
       WHERE p.id_produk = ?`,
      [this.id_produk],
    );
    return rows[0];
  }

  async getByKategori() {
    const [rows] = await pool.query(
      `SELECT p.id_produk, p.id_kategori, p.nama_produk, p.deskripsi, p.harga, k.nama_kategori 
       FROM produk p 
       JOIN kategori k ON p.id_kategori = k.id_kategori
       WHERE p.id_kategori = ?`,
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
}

module.exports = Produk;
