const Pengguna = require("./pengguna.model");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const getAllPengguna = async (req, res) => {
  try {
    const pengguna = await Pengguna.getAll();
    if (pengguna.length === 0) {
      return res
        .status(404)
        .json({ message: "Pengguna kosong silahkan buat pengguna baru" });
    }
    const data = pengguna.map((pgn) => {
      return new Pengguna(pgn.id_pengguna, pgn.nama, pgn.email, null, pgn.role);
    });

    return res.status(200).json({
      message: "Pengguna berhasil diambil",
      status: "success",
      data: data,
    });
  } catch (error) {
    console.error("Error getAllPengguna:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getPenggunaById = async (req, res) => {
  try {
    const { Idpengguna } = req.params;
    const penggunaInstance = new Pengguna(Idpengguna);
    const pengguna = await penggunaInstance.getPenggunaById();

    if (!pengguna) {
      return res.status(404).json({
        message: `Pengguna tidak ditemukan`,
      });
    }

    return res.status(200).json({
      message: `Pengguna berhasil diambil`,
      status: `Success`,
      data: pengguna,
    });
  } catch (error) {
    console.error("Error getPenggunaById:", error);
    res.status(500).json({
      message: `Internal server error`,
    });
  }
};

const getPenggunaByRole = async (req, res) => {
  try {
    const { role } = req.params;
    const penggunaInstance = new Pengguna(null, null, null, null, role);
    const pengguna = await penggunaInstance.getPenggunaByRole();
    if (pengguna.length === 0) {
      return res.status(404).json({
        message: `Pengguna dengan role yang anda pilih kosong`,
      });
    }
    const data = pengguna.map((pgn) => {
      return new Pengguna(
        pgn.id_pengguna,
        pgn.nama,
        pgn.email,
        pgn.password,
        pgn.role,
      );
    });

    return res.status(200).json({
      message: `Pengguna berhasil diambil`,
      status: `Success`,
      data: data,
    });
  } catch (error) {
    console.error("Error getPenggunaByRole:", error);
    res.status(500).json({
      message: `Internal server error`,
    });
  }
};

const createPengguna = async (req, res) => {
  const { nama, email, password, role } = req.body;
  if (!nama || !email || !password || !role) {
    return res.status(400).json({
      message: `Data yang anda masukkan tidak lengkap`,
      status: `Bad Request`,
    });
  }

  try {
    const Idpengguna = crypto.randomUUID();
    const hashedPassword = await bcrypt.hash(password, 10);
    const pengguna = new Pengguna(
      Idpengguna,
      nama,
      email,
      hashedPassword,
      role,
    );
    const data = await pengguna.create();

    return res.status(201).json({
      message: `Pengguna berhasil dibuat`,
      status: `Success`,
      data: {
        id_pengguna: Idpengguna,
        nama: nama,
        email: email,
        role: role,
      },
    });
  } catch (error) {
    console.error("Error createPengguna:", error);
    res.status(500).json({
      message: `Internal server error`,
    });
  }
};

const updatePenggunaById = async (req, res) => {
  try {
    const { Idpengguna } = req.params;
    const { nama, email, role } = req.body;
    const pengguna = new Pengguna(Idpengguna, nama, email, null, role);
    const data = await pengguna.update();

    if (data.affectedRows === 0) {
      return res.status(404).json({
        message: `Pengguna tidak ditemukan`,
      });
    }

    return res.status(200).json({
      message: `Pengguna berhasil diupdate`,
      status: `Success`,
      data: {
        id_pengguna: Idpengguna,
        nama: nama,
        email: email,
        role: role,
      },
    });
  } catch (error) {
    console.error("Error updatePenggunaById:", error);
    res.status(500).json({
      message: `Internal server error`,
    });
  }
};

const updatePassword = async (req, res) => {
  const { Idpengguna } = req.params;
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({
      message: `Password wajib diisi`,
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const pengguna = new Pengguna(Idpengguna, null, null, hashedPassword, null);
    const updatePassword = await pengguna.updatePassword();

    if (updatePassword.affectedRows === 0) {
      return res.status(404).json({
        message: `Pengguna tidak ditemukan`,
      });
    }

    return res.status(200).json({
      message: `Password berhasil diupdate`,
      status: `Success`,
    });
  } catch (error) {
    console.error("Error updatePassword:", error);
    res.status(500).json({
      message: `Internal server error`,
    });
  }
};

const deletePenggunaById = async (req, res) => {
  try {
    const { Idpengguna } = req.params;
    const penggunaInstance = new Pengguna();
    const pengguna = await penggunaInstance.delete(Idpengguna);
    if (pengguna.affectedRows === 0) {
      return res.status(404).json({
        message: `Pengguna tidak ditemukan`,
      });
    }

    return res.status(200).json({
      message: `Pengguna berhasil dihapus`,
    });
  } catch (error) {
    console.error("Error deletePenggunaByIdL", error);
    res.status(500).json({
      message: `Internal server error`,
    });
  }
};

module.exports = {
  getAllPengguna,
  getPenggunaByRole,
  getPenggunaById,
  createPengguna,
  updatePenggunaById,
  updatePassword,
  deletePenggunaById,
};
