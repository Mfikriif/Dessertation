const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const Pengguna = require("../pengguna/pengguna.model");
require("dotenv").config();

const register = async (req, res) => {
  const { nama, email, password, role } = req.body;

  if (!nama || !email || !password || !role) {
    return res.status(400).json({ message: "Semua field wajib diisi" });
  }

  if (role !== "admin" && role !== "kasir" && role !== "staff_admin") {
    return res.status(400).json({ message: "Role tidak valid" });
  }

  try {
    const pengguna = await Pengguna.findByEmail(email);
    if (pengguna) {
      return res.status(400).json({ message: "Email sudah terdaftar" });
    }

    const id_pengguna = crypto.randomUUID();
    const hashedPassword = await bcrypt.hash(password, 10);
    const insertPengguna = await Pengguna.create({
      id_pengguna,
      nama,
      email,
      password: hashedPassword,
      role,
    });
    res.status(201).json({
      message: "Pengguna berhasil ditambahkan",
      status: "success",
      data: {
        nama: nama,
        email: email,
        role: role,
        id_pengguna: id_pengguna,
      },
    });
  } catch (error) {
    console.error("Error register:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email dan password wajib diisi" });
  }

  try {
    const pengguna = await Pengguna.findByEmail(email);
    if (!pengguna) {
      return res.status(401).json({ message: "Email atau password salah" });
    }
    const isPasswordValid = await bcrypt.compare(password, pengguna.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Email atau password salah" });
    }

    const token = jwt.sign(
      { id_pengguna: pengguna.id_pengguna, role: pengguna.role },
      process.env.JWT_SECRET,
      { expiresIn: "5h" },
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 5 * 60 * 60 * 1000,
    });

    res.json({
      message: "Login berhasil",
      status: "success",
      token,
      user: {
        id_pengguna: pengguna.id_pengguna,
        nama: pengguna.nama,
        email: pengguna.email,
        role: pengguna.role,
      },
    });
  } catch (error) {
    console.error("Error login:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const logout = async (req, res) => {
  try {
    res.clearCookie("token");
    return res.status(200).json({
      message: "Logout berhasil",
      status: "success",
    });
  } catch (error) {
    console.error("Error logOut:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { register, login, logout };
