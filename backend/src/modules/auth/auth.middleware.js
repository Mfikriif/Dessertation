const jwt = require("jsonwebtoken");
require("dotenv").config();

const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({
      message: "Sesi habis, silahkan login kembali",
      status: "error",
    });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Error verify token:", error);
    res.status(401).json({ message: "Token tidak valid" });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role !== "admin") {
    return res.status(403).json({ message: "Akses ditolak" });
  }
  next();
};

const kasir = (req, res, next) => {
  if (req.user && req.user.role !== "kasir") {
    return res.status(403).json({ message: "Akses ditolak" });
  }
  next();
};

const staffProduksi = (req, res, next) => {
  if (req.user && req.user.role !== "staff_produksi") {
    return res.status(403).json({ message: "Akses ditolak" });
  }
  next();
};

module.exports = { verifyToken, admin, kasir, staffProduksi };
