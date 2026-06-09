const express = require("express");
const router = express.Router();
const { verifyToken, admin } = require("../auth/auth.middleware");

const {
  getAllOutlet,
  createOutlet,
  updateOutlet,
  deleteOutlet,
  getOutletStats,
} = require("./outlet.control");

router.get("/", verifyToken, admin, getAllOutlet);
router.post("/create/", verifyToken, admin, createOutlet);
router.get("/:Idoutlet/stats", verifyToken, admin, getOutletStats);
router.put("/update/:Idoutlet", verifyToken, admin, updateOutlet);
router.delete("/delete/:Idoutlet", verifyToken, admin, deleteOutlet);

module.exports = router;
