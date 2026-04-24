const express = require("express");
const router = express.Router();
const { verifyToken, admin } = require("../auth/auth.middleware");

const {
  createPengeluaran,
  getAllPengeluaran,
  updatePengeluaran,
  deletePengeluaran,
} = require(`./pengeluaran.controller`);
const { getAll } = require("../pengguna/pengguna.model");

router.post("/", verifyToken, admin, createPengeluaran);
router.get("/", verifyToken, admin, getAllPengeluaran);
router.put("/update/:Idpengeluaran", verifyToken, admin, updatePengeluaran);
router.delete("/delete/:Idpengeluaran", verifyToken, admin, deletePengeluaran);

module.exports = router;
