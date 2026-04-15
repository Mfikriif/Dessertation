const express = require("express");
const router = express.Router();
const { verifyToken } = require("./auth.middleware");

const { register, login, logout } = require("./auth.controller");

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

module.exports = router;
