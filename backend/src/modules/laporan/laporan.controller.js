const laporanModel = require("./laporan.model");

exports.getLaporanHarian = async (req, res) => {
  try {
    const filter = {
      tanggal: req.query.tanggal,
      id_outlet: req.query.id_outlet,
    };

    const data = await laporanModel.getLaporanHarian(filter);

    res.status(200).json({
      message: "Laporan harian berhasil diambil",
      data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.getTopProdukHarian = async (req, res) => {
  try {
    const filter = {
      tanggal: req.query.tanggal,
      id_outlet: req.query.id_outlet,
      limit: req.query.limit || 5,
    };

    const data = await laporanModel.getTopProdukHarian(filter);

    res.status(200).json({
      message: "Top produk harian berhasil diambil",
      data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: error.message,
    });
  }
};
