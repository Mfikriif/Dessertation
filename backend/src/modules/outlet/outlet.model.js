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

  async createOutletAndInitilizeStock() {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      await connection.query(
        `INSERT INTO outlet (id_outlet, nama_outlet, alamat) VALUES (?,?,?)`,
        [this.id_outlet, this.nama_outlet, this.alamat],
      );

      const [produklist] = await connection.query(
        `SELECT id_produk FROM produk`,
      );

      if (produklist.length > 0) {
        const insertProduk = produklist.map((prdk) => {
          const IdstokOutlet = crypto.randomUUID();
          const stokAwal = 0;

          return connection.query(
            `INSERT INTO stok_outlet (id_stok_outlet, id_produk, id_outlet, jumlah_stok) VALUES (?, ?, ?, ?)`,
            [IdstokOutlet, prdk.id_produk, this.id_outlet, stokAwal],
          );
        });

        await Promise.all(insertProduk);
      }

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      await connection.release();
    }
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
