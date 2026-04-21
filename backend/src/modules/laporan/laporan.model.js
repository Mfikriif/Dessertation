const db = require("../../config/db");

exports.getLaporanHarian = async (filter) => {
  let query = `
    SELECT 
      DATE(t.tanggal) as tanggal,
      t.id_outlet,
      COUNT(*) as total_transaksi,
      SUM(t.total_harga) as total_pendapatan
    FROM transaksi t
    WHERE t.status = 'selesai'
  `;

  let values = [];

  if (filter.tanggal) {
    query += " AND DATE(t.tanggal) = ?";
    values.push(filter.tanggal);
  }

  if (filter.id_outlet) {
    query += " AND t.id_outlet = ?";
    values.push(filter.id_outlet);
  }

  query += " GROUP BY DATE(t.tanggal), t.id_outlet";

  const [rows] = await db.execute(query, values);

  return rows.map((row) => ({
    tanggal: row.tanggal,
    id_outlet: row.id_outlet,
    total_transaksi: Number(row.total_transaksi),
    total_pendapatan: Number(row.total_pendapatan),
  }));
};

exports.getTopProdukHarian = async (filter) => {
  let query = `
    SELECT 
      p.id_produk,
      p.nama_produk,
      SUM(dt.jumlah) as total_terjual
    FROM transaksi t
    JOIN detail_transaksi dt ON t.id_transaksi = dt.id_transaksi
    JOIN produk p ON dt.id_produk = p.id_produk
    WHERE t.status = 'selesai'
  `;

  let values = [];

  if (filter.tanggal) {
    query += " AND DATE(t.tanggal) = ?";
    values.push(filter.tanggal);
  }

  if (filter.id_outlet) {
    query += " AND t.id_outlet = ?";
    values.push(filter.id_outlet);
  }

  query += `
    GROUP BY p.id_produk, p.nama_produk
    ORDER BY total_terjual DESC
  `;

  // FIX LIMIT
  if (filter.limit) {
    query += ` LIMIT ${parseInt(filter.limit)}`;
  }

  const [rows] = await db.execute(query, values);

  return rows;
};
