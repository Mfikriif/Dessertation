const express = require("express");
const router = express.Router();
const { getAllBahanbaku } = require("./bahanbaku.controller");

router.get("/", getAllBahanbaku);

module.exports = router;
