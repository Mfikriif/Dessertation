const express = require("express");
const router = express.Router();
const { verifyToken, admin } = require("../auth/auth.middleware");

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

router.get("/", verifyToken, admin, getAllBahanbaku);
router.get("/id/:Idbahanbaku", verifyToken, admin, getBahanBakuById);
router.get("/search", verifyToken, admin, getBahanBakuByName);
router.post("/", verifyToken, admin, createBahanBaku);
router.put("/update/:Idbahanbaku", verifyToken, admin, updateBahanBaku);
router.delete("/delete/:Idbahanbaku", verifyToken, admin, deleteBahanBaku);
router.post(
  "/tambah-stok/:Idbahanbaku",
  verifyToken,
  admin,
  tambahStokBahanBaku,
);
router.post(
  "/kurang-stok/:Idbahanbaku",
  verifyToken,
  admin,
  kurangiStokBahanBaku,
);
module.exports = router;
