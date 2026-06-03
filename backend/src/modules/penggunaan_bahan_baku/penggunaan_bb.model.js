const pool = require("../../config/db");

class PenggunaanBahanBaku {
  constructor(
    id_penggunaan,
    id_bahan_baku,
    id_pengguna,
    jumlah_digunakan,
    catatan,
    tanggal,
  ) {
    this.id_penggunaan = id_penggunaan;
    this.id_bahan_baku = id_bahan_baku;
    this.id_pengguna = id_pengguna;
    this.jumlah_digunakan = jumlah_digunakan;
    this.catatan = catatan;
    this.tanggal = tanggal;
  }

  async create() {
    const [rows] = await pool.query(
      `INSERT INTO penggunaan_bahan_baku (id_penggunaan, id_bahan_baku, id_pengguna, jumlah_digunakan, catatan, tanggal) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        this.id_penggunaan,
        this.id_bahan_baku,
        this.id_pengguna,
        this.jumlah_digunakan,
        this.catatan,
        this.tanggal,
      ],
    );
    return rows;
  }

  async getPenggunaan() {
    const [rows] = await pool.query(
      `
      SELECT pb.jumlah_digunakan, pb.catatan, pb.created_at, b.nama_bahan, b.satuan
        FROM penggunaan_bahan_baku pb
        JOIN bahan_baku b ON b.id_bahan_baku = pb.id_bahan_baku
        ORDER BY pb.created_at DESC
      `,
    );
    return rows;
  }
}

module.exports = PenggunaanBahanBaku;
