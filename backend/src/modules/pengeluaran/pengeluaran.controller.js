const Pengeluaran = require(`./pengeluaran.model`);
const crypto = require(`crypto`);

const createPengeluaran = async (req, res) => {
  const { tanggal, biaya, deskripsi } = req.body;
  const Idpengguna = req.user.id_pengguna;
  const Idpengeluaran = crypto.randomUUID();
  console.log(deskripsi);
  try {
    if (!tanggal || !biaya || !deskripsi) {
      return res.status(401).json({
        message: `Tanggal, biaya, deskripsi wajib diisi`,
        status: `Bad request`,
      });
    }

    const pengeluaranInstance = new Pengeluaran(
      Idpengeluaran,
      Idpengguna,
      tanggal,
      biaya,
      deskripsi,
    );
    const pengeluaran = await pengeluaranInstance.create();
    if (pengeluaran.affectedRows === 0) {
      return res.status(400).json({
        message: `Gagal membuat catatan pengeluaran`,
        status: `Failed`,
      });
    }

    return res.status(201).json({
      message: `Catatan pengeluaran berhasi dibuat`,
      status: `Success`,
      data: pengeluaranInstance,
    });
  } catch (error) {
    console.error(`Error createPengeluaran: `, error);
    return res.status(500).json({
      message: `Internal server error`,
    });
  }
};

const getAllPengeluaran = async (req, res) => {
  try {
    const pengeluaranInstance = new Pengeluaran();
    const pengeluaran = await pengeluaranInstance.getAll();
    console.log(pengeluaran);
    if (pengeluaran.length === 0) {
      return res.status(404).json({
        message: `Data pengeluaran tidak ditemukan`,
      });
    }

    return res.status(200).json({
      message: `Data pengeluaran berhasil diambil`,
      status: `Success`,
      data: pengeluaran,
    });
  } catch (error) {
    console.error(`Error getAllPengeluaran: `, error);
    return res.status(500).json({
      message: `Internal server error`,
    });
  }
};

const updatePengeluaran = async (req, res) => {
  const { tanggal, biaya, deskripsi } = req.body;
  const { Idpengeluaran } = req.params;
  const Idpengguna = req.user.id;
  try {
    if (!tanggal || !biaya || !deskripsi) {
      return res.status(401).json({
        message: `tanggal, biaya, dan deskripsi wajib diisi`,
        status: `Bad request`,
      });
    }

    const pengeluaranInstance = new Pengeluaran(
      Idpengeluaran,
      Idpengguna,
      tanggal,
      biaya,
      deskripsi,
    );
    const pengeluaran = await pengeluaranInstance.update();
    if (pengeluaran.affectedRows === 0) {
      return res.status(404).json({
        message: `Pengeluaran tidak ditemukan`,
        status: `Not Found`,
      });
    }

    return res.status(200).json({
      message: `Pengeluaran berhasil diperbarui`,
      status: `Success`,
      data: pengeluaranInstance,
    });
  } catch (error) {
    console.error(`Error updatePengeluaran: `, error);
    return res.status(500).json({
      message: `Internal server error`,
    });
  }
};

const deletePengeluaran = async (req, res) => {
  const { Idpengeluaran } = req.params;
  try {
    const pengeluaranInstance = new Pengeluaran(Idpengeluaran);
    const pengeluaran = pengeluaranInstance.delete();
    if (pengeluaran.affectedRows === 0) {
      return res.status(404).json({
        message: `Pengeluaran tidak ditemukan`,
        status: `Not Found`,
      });
    }

    return res.status(200).json({
      message: `Pengeluaran berhasil dihapus`,
      status: `Success`,
    });
  } catch (error) {
    console.error(`Error deletePengeluaran: `, error);
    return res.status(500).json({
      message: `Internal server error`,
    });
  }
};

module.exports = {
  createPengeluaran,
  getAllPengeluaran,
  updatePengeluaran,
  deletePengeluaran,
};
