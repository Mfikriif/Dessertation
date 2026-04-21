const express = require("express");
const router = express.Router();

const { createPenggunaan } = require("./penggunaan_bb.controller");
const { verifyToken, admin } = require("../auth/auth.middleware");

router.post("/", verifyToken, admin, createPenggunaan);

module.exports = router;
