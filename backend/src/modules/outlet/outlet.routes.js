const express = require("express");
const router = express.Router();

const {
  getAllOutlet,
  createOutlet,
  updateOutlet,
} = require("./outlet.control");

router.get("/", getAllOutlet);
router.post("/create/", createOutlet);
router.put("/update/:Idoutlet", updateOutlet);

module.exports = router;
