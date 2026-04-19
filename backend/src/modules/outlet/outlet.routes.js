const express = require("express");
const router = express.Router();
const { verifyToken, admin } = require("../auth/auth.middleware");

const {
  getAllOutlet,
  createOutlet,
  updateOutlet,
  deleteOutlet,
} = require("./outlet.control");

router.get("/", verifyToken, admin, getAllOutlet);
router.post("/create/", verifyToken, admin, createOutlet);
router.put("/update/:Idoutlet", verifyToken, admin, updateOutlet);
router.delete("/delete/:Idoutlet", verifyToken, admin, deleteOutlet);

module.exports = router;
