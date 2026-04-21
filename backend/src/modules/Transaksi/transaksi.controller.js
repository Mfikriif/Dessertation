const transaksiModel = require("./transaksi.model");

exports.createTransaksi = async (req, res) => {
  try {
    const result = await transaksiModel.insertTransaksi(req.body);

    res.status(201).json({
      message: "Transaksi berhasil dibuat",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.getAllTransaksi = async (req, res) => {
  try {
    const filter = {
      metode_bayar: req.query.metode_bayar,
      tanggal: req.query.tanggal,
    };

    const data = await transaksiModel.getAllTransaksi(filter);

    res.status(200).json({
      message: "Data transaksi berhasil diambil",
      data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.getTransaksiById = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await transaksiModel.getTransaksiById(id);

    if (!data) {
      return res.status(404).json({
        message: "Transaksi tidak ditemukan",
      });
    }

    res.status(200).json({
      message: "Detail transaksi berhasil diambil",
      data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: error.message,
    });
  }
};
