const Bahanbaku = require("./bahanbaku.model");
const StokBahanBaku = require("../stokbahanbaku/stokbahanbaku.model");
const crypto = require("crypto");

const getAllBahanbaku = async (req, res) => {
  try {
    const bahanBakuInstance = new Bahanbaku();
    const bahanBaku = await bahanBakuInstance.getAll();
    console.log(bahanBaku);
    if (bahanBaku.length === 0) {
      return res.status(404).json({
        message: `Bahan baku kosong, silahkan masukan data bahan baku`,
      });
    }

    const data = bahanBaku.map((bb) => {
      return new Bahanbaku(bb.id_bahan_baku, bb.nama_bahan, bb.satuan);
    });
    return res.status(200).json({
      message: `Data bahan baku berhasil diambil`,
      status: `Success`,
      data: data,
    });
  } catch (error) {
    console.error("Error getAllBahanbaku: ", error);
    return res.status(500).json({
      message: `Internal server error`,
    });
  }
};

const getBahanBakuById = async (req, res) => {
  const { Idbahanbaku } = req.params;

  try {
    const bahanBakuInstance = new Bahanbaku(Idbahanbaku);
    const bahanBaku = await bahanBakuInstance.getById();
    if (!bahanBaku) {
      return res.status(404).json({
        message: `Data tidak tersedia`,
      });
    }
    return res.status(200).json({
      message: `Data berhasil diambil`,
      status: `Success`,
      data: bahanBaku,
    });
  } catch (error) {
    console.error("Error getBahanBakuById: ", error);
    return res.status(500).json({
      message: `Internal server error`,
    });
  }
};

const getBahanBakuByName = async (req, res) => {
  const { bahanbaku } = req.query;

  if (!bahanbaku) {
    return res.status(400).json({
      message: `Masukan nama bahan baku yang dicari`,
    });
  }
  try {
    const bahanBakuInstance = new Bahanbaku(null, bahanbaku, null);
    const bahanBaku = await bahanBakuInstance.findByName();
    if (bahanBaku.length === 0) {
      return res.status(404).json({
        message: `Bahan baku yang anda cari tidak tersedia`,
      });
    }

    const data = bahanBaku.map((bb) => {
      return new Bahanbaku(bb.id_bahan_baku, bb.nama_bahan, bb.satuan);
    });
    return res.status(200).json({
      message: `Data berhasil diambil`,
      status: `Success`,
      data: data,
    });
  } catch (error) {
    console.error("Error getBahanBakuByName: ", error);
    return res.status(500).json({
      message: `Internal server error`,
    });
  }
};

const createBahanBaku = async (req, res) => {
  const { nama_bahan, satuan, stok_minimum } = req.body;
  const initialJumlahStok = 0;
  if (!nama_bahan || !satuan || !stok_minimum) {
    return res.status(401).json({
      message: `Data yang anda masukan tidak lengkap`,
    });
  }

  try {
    const Idbahanbaku = crypto.randomUUID();
    const bahanBakuInstance = new Bahanbaku(Idbahanbaku, nama_bahan, satuan);
    const bahanBaku = await bahanBakuInstance.create();

    const Idstokbahanbaku = crypto.randomUUID();
    const stokInstance = new StokBahanBaku(
      Idstokbahanbaku,
      Idbahanbaku,
      initialJumlahStok,
      stok_minimum,
    );

    const stokBahanBaku = await stokInstance.createInitialStok();
    return res.status(200).json({
      message: `Berhasil membuat bahan baku`,
      status: `Success`,
      data: {
        id_bahan_baku: Idbahanbaku,
        id_stok_bb: Idstokbahanbaku,
        nama_bahan,
        jumlah_stok: initialJumlahStok,
        satuan,
        stok_minimum,
      },
    });
  } catch (error) {
    console.error("Error createBahanBaku: ", error);
    return res.status(500).json({
      message: `Internal server error`,
    });
  }
};

const updateBahanBaku = async (req, res) => {
  const { nama_bahan, satuan } = req.body;
  const { Idbahanbaku } = req.params;

  if (!nama_bahan || !satuan) {
    return res.status(401).json({
      message: `Data yang anda masukan tidak lengkap`,
    });
  }

  try {
    const bahanBakuInstance = new Bahanbaku(Idbahanbaku, nama_bahan, satuan);
    const bahanBaku = await bahanBakuInstance.update();
    if (bahanBaku.length === 0) {
      return res.status(404).json({
        message: `Data yang anda ubah tidak tersedia`,
      });
    }

    return res.status(200).json({
      message: `Data bahan baku berhasil diperbarui`,
      status: `Success`,
      data: {
        id_bahan_baku: Idbahanbaku,
        nama_bahan,
        satuan,
      },
    });
  } catch (error) {
    console.error("Error updateBahanBaku: ", error);
    return res.status(500).json({
      message: `Internal server error`,
    });
  }
};

const deleteBahanBaku = async (req, res) => {
  const { Idbahanbaku } = req.params;

  try {
    const bahanBakuInstance = new Bahanbaku(Idbahanbaku);
    const bahanBaku = await bahanBakuInstance.delete();
    if (bahanBaku.affectedRows === 0) {
      return res.status(404).json({
        message: `Bahan baku yang anda hapus tidak ada`,
      });
    }

    return res.status(200).json({
      message: `Bahan baku berhasil dihapus`,
      status: `Success`,
    });
  } catch (error) {
    console.error("Error deleteBahanBaku: ", error);
    return res.status(500).json({
      message: `Internal server error`,
    });
  }
};

module.exports = {
  getAllBahanbaku,
  getBahanBakuById,
  getBahanBakuByName,
  createBahanBaku,
  updateBahanBaku,
  deleteBahanBaku,
};
