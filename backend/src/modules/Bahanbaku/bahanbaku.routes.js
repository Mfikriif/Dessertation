const express = require("express");
const router = express.Router();

const {
  getAllBahanbaku,
  getBahanBakuById,
  getBahanBakuByName,
  createBahanBaku,
  updateBahanBaku,
  deleteBahanBaku,
  tambahStokBahanBaku,
  kurangiStokBahanBaku,
} = require("./bahanbaku.controller");

router.get("/", getAllBahanbaku);
router.get("/id/:Idbahanbaku", getBahanBakuById);
router.get("/search", getBahanBakuByName);
router.post("/", createBahanBaku);
router.put("/update/:Idbahanbaku", updateBahanBaku);
router.delete("/delete/:Idbahanbaku", deleteBahanBaku);
router.post("/tambah-stok/:Idbahanbaku", tambahStokBahanBaku);
router.post("/kurang-stok/:Idbahanbaku", kurangiStokBahanBaku);
module.exports = router;
