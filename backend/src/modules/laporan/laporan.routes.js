const express = require("express");
const router = express.Router();
// const laporanController = require("./laporan.controller");
const {
  getLaporanBulanan,
  getLaporanHarian,
  getTopProdukHarian,
  getLaporanTahunan,
  getDetailBulanan,
  getDetailTahunan,
  getDetailBulananOutlet,
  getDetailTahunanOutlet,
} = require("./laporan.controller");

router.get("/harian", getLaporanHarian);
router.get("/top-produk", getTopProdukHarian);
router.get("/bulanan/:bulan/:tahun", getLaporanBulanan);
router.get("/tahunan/:tahun", getLaporanTahunan);
router.get("/bulanan-detail/:bulan/:tahun", getDetailBulanan);
router.get("/tahunan-detail/:tahun", getDetailTahunan);
router.get(
  "/bulanan-detail/outlet/:bulan/:tahun/:Idoutlet",
  getDetailBulananOutlet,
);
router.get("/tahunan-detail/outlet/:tahun/:Idoutlet", getDetailTahunanOutlet);

module.exports = router;
