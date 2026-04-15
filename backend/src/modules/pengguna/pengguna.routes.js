const express = require("express");
const router = express.Router();
const { verifyToken } = require("../auth/auth.middleware");
const { admin } = require("../auth/auth.middleware");

const {
  getAllPengguna,
  getPenggunaByRole,
  getPenggunaById,
  deletePenggunaById,
  updatePenggunaById,
  updatePassword,
  createPengguna,
} = require("./pengguna.controller");

router.get("/", verifyToken, admin, getAllPengguna);
router.post("/", verifyToken, admin, createPengguna);
router.get("/role/:role", verifyToken, admin, getPenggunaByRole);
router.get("/id/:Idpengguna", verifyToken, admin, getPenggunaById);
router.delete("/delete/:Idpengguna", verifyToken, admin, deletePenggunaById);
router.put("/update/:Idpengguna", verifyToken, admin, updatePenggunaById);
router.put("/update-password/:Idpengguna", verifyToken, admin, updatePassword);

module.exports = router;
