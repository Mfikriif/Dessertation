const Produk = require("./produk.model");
const StokOutlet = require("../stokoutlet/stokoutlet.model");
const Outlet = require("../outlet/outlet.model");
const crypto = require("crypto");

const getAllProduk = async (req, res) => {
  try {
    const produkInstance = new Produk();
    const data = await produkInstance.getAll();
    if (data.length === 0) {
      return res.status(404).json({
        message: `Produk kosong silahkan buat produk baru`,
      });
    }

    const produkMapping = data.map((pdk) => {
      return new Produk(
        pdk.id_produk,
        pdk.id_kategori,
        pdk.nama_produk,
        pdk.deskripsi,
        pdk.harga,
      );
    });
    return res.status(200).json({
      message: `Data berhasil diambil`,
      status: `Sukses`,
      data: produkMapping,
    });
  } catch (error) {
    console.error("Error getAllProduk: ", error);
    return res.status(500).json({
      message: `Internal server error`,
    });
  }
};

const getProdukById = async (req, res) => {
  try {
    const { Idproduk } = req.params;
    const produkInstance = new Produk(Idproduk);
    const produk = await produkInstance.getById();
    console.log(produk);
    if (!produk) {
      return res.status(404).json({
        message: `Produk tersebut tidak ada`,
      });
    }

    return res.status(200).json({
      message: `Data produk berhasil diambil`,
      status: `Success`,
      data: produk,
    });
  } catch (error) {
    console.error("Error getProdukById: ", error);
    return res.status(500).json({
      message: `Internal server error`,
    });
  }
};

const getProdukByIdKategori = async (req, res) => {
  console.log("Start");
  const { Idkategori } = req.params;
  console.log("id_kategori:", Idkategori);
  try {
    const produkInstance = new Produk(null, Idkategori, null, null, null);
    const produk = await produkInstance.getByKategori();
    console.log(produkInstance);
    if (produk.length === 0) {
      return res.status(404).json({
        message: `Data tidak tersedia`,
      });
    }

    const produkMapping = produk.map((pdk) => {
      return new Produk(
        pdk.id_produk,
        pdk.id_kategori,
        pdk.nama_produk,
        pdk.deskripsi,
        pdk.harga,
      );
    });
    console.log(produkMapping);

    return res.status(200).json({
      message: `Data berhasil diambil`,
      status: `Success`,
      data: produkMapping,
    });
  } catch (error) {
    console.error("Error getProdukByIdKategori: ", error);
    return res.status(500).json({
      message: `Internal server error`,
    });
  }
};

const createProduk = async (req, res) => {
  const { id_kategori, nama_produk, deskripsi, harga } = req.body;
  if (!id_kategori || !nama_produk || !deskripsi || !harga) {
    return res.status(400).json({
      message: `Semua kolom wajib diisi!`,
      status: `Bad Request`,
    });
  }
  try {
    const Idproduk = crypto.randomUUID();
    const IdStok = crypto.randomUUID();

    const produkInstance = new Produk(
      Idproduk,
      id_kategori,
      nama_produk,
      deskripsi,
      harga,
    );
    const data = await produkInstance.create();
    console.log(produkInstance);

    const outletInstance = new Outlet();
    const getOutlet = await outletInstance.getAll();
    if (!getOutlet || getOutlet.length === 0) {
      return res.status(400).json({
        message: `Gagal membuat stok: Data outlet kosong`,
      });
    }

    const outletMapping = getOutlet.map((otl) => {
      const uuid = crypto.randomUUID();
      console.log("Random uuid:", uuid);
      const stokInstance = [
        (id_stok = uuid),
        (outletId = otl.id_outlet),
        (nama = otl.nama_outlet),
      ];
      const stokProdukInstance = new StokOutlet(
        uuid,
        Idproduk,
        otl.id_outlet,
        0,
      );

      const result = stokProdukInstance.createInitialStokOutlet();
      console.log(stokInstance);
      console.log("instance: ", stokProdukInstance);
      console.log("hasil: ", result);
      // return new Outlet(otl.id_outlet, otl.nama_outlet, otl.alamat);
    });

    // console.log(outletMapping);

    console.log(getOutlet.length);

    // const stokPromises = getOutlet.map((outlet) => {
    //   const Idstok = crypto.randomUUID();
    //   const stokAwal = 0;
    //   const stokInstance = new StokOutlet(
    //     IdStok,
    //     Idproduk,
    //     outlet.id_outlet,
    //     stokAwal,
    //   );

    //   const stokCreate = stokInstance.createInitialStokOutlet();
    // });

    // await Promise.all(stokPromises);

    return res.status(201).json({
      message: `Produk berhasil dibuat`,
      status: `Success`,
      data: {
        id_produk: Idproduk,
        id_kategori,
        nama_produk,
        deskripsi,
        harga,
      },
    });
  } catch (error) {
    console.error("Error createProduk: ", error);
    return res.status(500).json({
      message: `Internal server error`,
    });
  }
};

const updateProduk = async (req, res) => {
  const { id_kategori, nama_produk, deskripsi, harga } = req.body;
  const { Idproduk } = req.params;

  if (!id_kategori || !nama_produk || !deskripsi || !harga) {
    return res.status(400).json({
      message: `Semua kolom wajib diisi`,
      status: `Bad Request`,
    });
  }

  try {
    const produkInstance = new Produk(
      Idproduk,
      id_kategori,
      nama_produk,
      deskripsi,
      harga,
    );
    const produk = await produkInstance.update();
    if (produk.affectedRows === 0) {
      return res.status(404).json({
        message: `Produk tidak ditemukan`,
      });
    }

    return res.status(200).json({
      message: `Produk berhasil diperbarui`,
      status: `Success`,
      data: {
        Idproduk,
        id_kategori,
        nama_produk,
        deskripsi,
        harga,
      },
    });
  } catch (error) {
    console.error("Error produkController: ", error);
    return res.status(500).json({
      message: `Internal server error`,
    });
  }
};

const deleteProduk = async (req, res) => {
  const { Idproduk } = req.params;
  console.log(Idproduk);

  try {
    const produkInstance = new Produk(Idproduk);
    const produk = await produkInstance.delete();
    if (!produk) {
      return res.status(400).json({
        message: `Produk yang ingin anda hapus tidak ada`,
      });
    }
    return res.status(200).json({
      message: `Produk berhasil dihapus`,
      status: `Success`,
    });
  } catch (error) {
    console.error("Error deleteProduk: ", error);
    return res.status(500).json({
      message: `Internal server error`,
    });
  }
};

module.exports = {
  getAllProduk,
  getProdukById,
  getProdukByIdKategori,
  createProduk,
  updateProduk,
  deleteProduk,
};
