const express = require("express");
const router = express.Router();
const { verifyToken } = require("../auth/auth.middleware");

const {
  getAllProduk,
  getProdukById,
  createProduk,
  updateProduk,
  getProdukByIdKategori,
  deleteProduk,
} = require("./produk.controller");

router.get("/", verifyToken, getAllProduk);
router.get("/id/:Idproduk", getProdukById);
router.get("/id-kategori/:Idkategori", getProdukByIdKategori);
router.post("/", createProduk);
router.put("/update/:Idproduk", updateProduk);
router.delete("/delete/:Idproduk", deleteProduk);

module.exports = router;
