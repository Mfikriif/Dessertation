const Kategori = require("./kategori.model");
const { generatePrefix } = require("../../helper/helper");
const crypto = require("crypto");

const getAllKategori = async (req, res) => {
  try {
    const kategoriInstance = new Kategori();
    const kategori = await kategoriInstance.getAll();

    if (kategori.length === 0) {
      return res.status(404).json({
        message: `Kategori tidak ditemuka: Silahkan buat kategori terlebih dahulu`,
      });
    }

    const kategoriMapping = kategori.map((ktg) => {
      return new Kategori(
        ktg.id_kategori,
        ktg.kode_kategori,
        ktg.nama_kategori,
      );
    });
    return res.status(200).json({
      message: `Kategori berhasil diambil`,
      status: `Success`,
      data: kategoriMapping,
    });
  } catch (error) {
    console.error("Error getAllKategori: ", error);
    return res.status(500).json({
      message: `Internal server error`,
    });
  }
};

const createKategori = async (req, res) => {
  const { nama_kategori } = req.body;
  if (!nama_kategori) {
    return res.status(401).json({
      message: `Nama wajib diisi`,
    });
  }
  try {
    const Idkategori = crypto.randomUUID();
    const createPrefix = generatePrefix(nama_kategori);
    const randomHex = crypto.randomBytes(2).toString("hex").toUpperCase();
    const kodeKategori = `${createPrefix}-${randomHex}`;

    const kategoriInstance = new Kategori(
      Idkategori,
      kodeKategori,
      nama_kategori,
    );
    const kategori = await kategoriInstance.create();

    return res.status(201).json({
      message: `Kategori berhasil dibuat`,
      status: `Success`,
      data: kategoriInstance,
    });
  } catch (error) {
    console.error(`Error createKategori: `, error);
    return res.status(500).json({
      message: `Internal server error`,
    });
  }
};

const updateKategori = async (req, res) => {
  const { Idkategori } = req.params;
  const { nama_kategori } = req.body;
  try {
    const createPrefix = generatePrefix(nama_kategori);
    const randomHex = crypto.randomBytes(2).toString("hex").toUpperCase();
    const kodeKategori = `${createPrefix}-${randomHex}`;
    const kategoriInstance = new Kategori(
      Idkategori,
      kodeKategori,
      nama_kategori,
    );

    const kategori = kategoriInstance.update();
    if (kategori.affectedRows === 0) {
      return res.status(404).json({
        message: `Kategori yang anda cari tidak tersedia`,
      });
    }
    return res.status(200).json({
      message: `Kategori berhasil diperbarui`,
      status: `Success`,
      data: kategoriInstance,
    });
  } catch (error) {
    console.error("Error updateKategori: ", error);
    return res.status(500).json({
      message: `Internal server error`,
    });
  }
};

const deleteKategori = async (req, res) => {
  const { Idkategori } = req.params;
  console.log(Idkategori);
  try {
    const kategoriInstance = new Kategori(Idkategori);
    const kategori = await kategoriInstance.delete();
    if (kategori.affectedRows === 0) {
      return res.status(404).json({
        message: `Kategori yang anda hapus tidak tersedia`,
      });
    }

    return res.status(200).json({
      message: `Kategori berhasil dihapus`,
      status: `Success`,
    });
  } catch (error) {
    console.error("Error deleteKategori: ", error);
    return res.status(500).json({
      message: `Internal server error`,
    });
  }
};

module.exports = {
  getAllKategori,
  createKategori,
  updateKategori,
  deleteKategori,
};
