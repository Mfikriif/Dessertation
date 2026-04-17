const express = require("express");
const router = express.Router();
const { verifyToken, admin } = require("../auth/auth.middleware");

const {
  getAllProduk,
  getProdukById,
  createProduk,
  updateProduk,
  getProdukByIdKategori,
  deleteProduk,
} = require("./produk.controller");

router.get("/", verifyToken, admin, getAllProduk);
router.get("/id-produk/:Idproduk", verifyToken, admin, getProdukById);
router.get(
  "/id-kategori/:Idkategori",
  verifyToken,
  admin,
  getProdukByIdKategori,
);
router.post("/", verifyToken, admin, createProduk);
router.put("/update/:Idproduk", verifyToken, admin, updateProduk);
router.delete("/delete/:Idproduk", verifyToken, admin, deleteProduk);

module.exports = router;
