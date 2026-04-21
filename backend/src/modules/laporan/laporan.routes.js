const express = require("express");
const router = express.Router();
const laporanController = require("./laporan.controller");

router.get("/harian", laporanController.getLaporanHarian);
router.get("/top-produk", laporanController.getTopProdukHarian);

module.exports = router;
