const express = require("express");
const router = express.Router();
const { verifyToken, admin } = require("../auth/auth.middleware");

const {
  getAllKategori,
  createKategori,
  updateKategori,
  deleteKategori,
} = require("./kategori.controller");

router.get("/", verifyToken, admin, getAllKategori);
router.post("/create", verifyToken, admin, createKategori);
router.put("/update/:Idkategori", verifyToken, admin, updateKategori);
router.delete("/delete/:Idkategori", verifyToken, admin, deleteKategori);

module.exports = router;
