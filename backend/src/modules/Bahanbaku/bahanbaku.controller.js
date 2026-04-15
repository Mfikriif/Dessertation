const Bahanbaku = require("./bahanbaku.model");

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

module.exports = {
  getAllBahanbaku,
};
