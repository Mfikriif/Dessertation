const Outlet = require("./outlet.model");

const getAllOutlet = async (req, res) => {
  try {
    const outletInstance = new Outlet();
    const outlet = await outletInstance.getAll();
    if (outlet.length === 0) {
      return res.status(404).json({
        message: `Outlet tidak ditemukan. Silahkan buat outlet`,
      });
    }

    const outletMapping = outlet.map((otl) => {
      return new Outlet(otl.id_outlet, otl.nama_outlet, otl.alamat);
    });

    return res.status(200).json({
      message: `Daftar outlet berhasil diambil`,
      status: `Success`,
      data: outletMapping,
    });
  } catch (error) {
    console.error("Error getAllOutlet: ", error);
    return res.status(500).json({
      message: `Internal server error`,
    });
  }
};

const createOutlet = async (req, res) => {
  const { nama_outlet, alamat } = req.body;
  const id_outlet = crypto.randomUUID();
  try {
    const outletInstance = new Outlet(id_outlet, nama_outlet, alamat);
    const outlet = await outletInstance.create();

    return res.status(201).json({
      message: `Outlet berhasil dibuat`,
      status: `Success`,
      data: {
        id_outlet,
        nama_outlet,
        alamat,
      },
    });
  } catch (error) {
    console.error("Error createOutlet: ", error);
    return res.status(500).json({
      message: `Internal server error`,
    });
  }
};

const updateOutlet = async (req, res) => {
  const { nama_outlet, alamat } = req.body;
  const { Idoutlet } = req.params;
  try {
    const outletIntance = new Outlet(Idoutlet, nama_outlet, alamat);
    const outlet = await outletIntance.update();
    if (outlet.affectedRows === 0) {
      return res.status(404).json({
        message: `Data yang diperbarui tidak ditemukan`,
      });
    }

    return res.status(200).json({
      message: `Data berhasil diperbarui`,
      status: `Success`,
      data: {
        Idoutlet,
        nama_outlet,
        alamat,
      },
    });
  } catch (error) {
    console.error("Error updateOutlet: ", error);
    return res.status(500).json({
      message: `Internal server error`,
    });
  }
};

module.exports = { getAllOutlet, createOutlet, updateOutlet };
