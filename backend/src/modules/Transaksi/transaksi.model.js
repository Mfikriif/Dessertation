const db = require("../../config/db");
const { v4: uuidv4 } = require("uuid");
const formatDate = (date) => {
  const d = new Date(date);
  return d.toISOString().slice(0, 19).replace("T", " ");
};

exports.insertTransaksi = async (data) => {
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    const id_transaksi = uuidv4();
    let total_harga = 0;

    // 1. Insert transaksi
    await connection.execute(
      `INSERT INTO transaksi 
      (id_transaksi, id_outlet, id_pengguna, total_harga, metode_bayar)
      VALUES (?, ?, ?, ?, ?)`,
      [id_transaksi, data.id_outlet, data.id_pengguna, 0, data.metode_bayar],
    );

    // 2. Loop items
    for (const item of data.items) {
      const [produk] = await connection.execute(
        `SELECT p.harga, so.jumlah_stok
     FROM produk p
     JOIN stok_outlet so ON p.id_produk = so.id_produk
     WHERE p.id_produk = ? AND so.id_outlet = ?`,
        [item.id_produk, data.id_outlet],
      );

      if (produk.length === 0) {
        throw new Error("Produk tidak tersedia di outlet ini");
      }

      const dataProduk = produk[0];

      if (dataProduk.jumlah_stok < item.jumlah) {
        throw new Error(`Stok tidak cukup untuk produk ${item.id_produk}`);
      }

      const harga_satuan = dataProduk.harga;
      const subtotal = harga_satuan * item.jumlah;

      total_harga += subtotal;

      // 🔻 update stok
      await connection.execute(
        `UPDATE stok_outlet 
     SET jumlah_stok = jumlah_stok - ? 
     WHERE id_produk = ? AND id_outlet = ?`,
        [item.jumlah, item.id_produk, data.id_outlet],
      );

      const id_detail = uuidv4();

      await connection.execute(
        `INSERT INTO detail_transaksi
    (id_detail, id_transaksi, id_produk, jumlah, harga_satuan, subtotal)
    VALUES (?, ?, ?, ?, ?, ?)`,
        [
          id_detail,
          id_transaksi,
          item.id_produk,
          item.jumlah,
          harga_satuan,
          subtotal,
        ],
      );
    }

    // 3. Update total transaksi
    await connection.execute(
      `UPDATE transaksi SET total_harga = ? WHERE id_transaksi = ?`,
      [total_harga, id_transaksi],
    );

    await connection.commit();

    return {
      id_transaksi,
      total_harga,
      items: data.items,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

exports.getAllTransaksi = async (filter) => {
  let query = `
    SELECT 
      t.id_transaksi,
      t.tanggal,
      t.total_harga,
      t.metode_bayar,
      t.status,
      dt.id_detail,
      dt.id_produk,
      p.nama_produk,
      dt.jumlah,
      dt.harga_satuan,
      dt.subtotal
    FROM transaksi t
    JOIN detail_transaksi dt ON t.id_transaksi = dt.id_transaksi
    JOIN produk p ON dt.id_produk = p.id_produk
  `;

  let conditions = [];
  let values = [];

  // 🔍 filter metode bayar
  if (filter.metode_bayar) {
    conditions.push("t.metode_bayar = ?");
    values.push(filter.metode_bayar);
  }

  // 🔍 filter tanggal (per hari)
  if (filter.tanggal) {
    conditions.push("DATE(t.tanggal) = ?");
    values.push(filter.tanggal);
  }

  // gabungkan WHERE kalau ada filter
  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  query += " ORDER BY t.tanggal DESC";

  const [rows] = await db.execute(query, values);

  // 🔁 grouping (tetap sama)
  const transaksiMap = {};

  for (const row of rows) {
    if (!transaksiMap[row.id_transaksi]) {
      transaksiMap[row.id_transaksi] = {
        id_transaksi: row.id_transaksi,
        tanggal: formatDate(row.tanggal),
        total_harga: Number(row.total_harga),
        metode_bayar: row.metode_bayar,
        status: row.status,
        items: [],
      };
    }

    transaksiMap[row.id_transaksi].items.push({
      id_detail: row.id_detail,
      id_produk: row.id_produk,
      nama_produk: row.nama_produk,
      jumlah: row.jumlah,
      harga_satuan: Number(row.harga_satuan),
      subtotal: Number(row.subtotal),
    });
  }

  return Object.values(transaksiMap);
};

exports.getTransaksiById = async (id) => {
  const [rows] = await db.execute(
    `
    SELECT 
      t.id_transaksi,
      t.tanggal,
      t.total_harga,
      t.metode_bayar,
      t.status,
      dt.id_detail,
      dt.id_produk,
      p.nama_produk,
      dt.jumlah,
      dt.harga_satuan,
      dt.subtotal
    FROM transaksi t
    JOIN detail_transaksi dt ON t.id_transaksi = dt.id_transaksi
    JOIN produk p ON dt.id_produk = p.id_produk
    WHERE t.id_transaksi = ?
    `,
    [id],
  );

  if (rows.length === 0) {
    return null;
  }

  const transaksi = {
    id_transaksi: rows[0].id_transaksi,
    tanggal: formatDate(rows[0].tanggal),
    total_harga: Number(rows[0].total_harga),
    metode_bayar: rows[0].metode_bayar,
    status: rows[0].status,
    items: [],
  };

  for (const row of rows) {
    transaksi.items.push({
      id_detail: row.id_detail,
      id_produk: row.id_produk,
      nama_produk: row.nama_produk,
      jumlah: row.jumlah,
      harga_satuan: Number(row.harga_satuan),
      subtotal: Number(row.subtotal),
    });
  }

  return transaksi;
};
