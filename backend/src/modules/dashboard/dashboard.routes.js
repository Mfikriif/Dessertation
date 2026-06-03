const express = require("express");
const router = express.Router();

const { dashboardInfo, performaBulanIni } = require("./dashboard.controller");
const { verifyToken, admin } = require("../auth/auth.middleware");

router.get("/info", verifyToken, admin, dashboardInfo);
router.get("/performa-bulan-ini", verifyToken, admin, performaBulanIni);

module.exports = router;
