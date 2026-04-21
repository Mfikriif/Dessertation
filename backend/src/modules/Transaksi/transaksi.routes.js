const express = require("express");
const router = express.Router();
const transaksiController = require("./transaksi.controller");

router.get("/", transaksiController.getAllTransaksi);
router.get("/:id", transaksiController.getTransaksiById);

module.exports = router;
