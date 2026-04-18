const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

require("dotenv").config();

const app = express();
app.use(cookieParser());

// IMPORT ROUTE
const authRoutes = require("./modules/auth/auth.routes");
const penggunaRoutes = require("./modules/pengguna/pengguna.routes");
const produkRoutes = require("./modules/produk/produk.routes");
const bahanBakuRoutes = require("./modules/Bahanbaku/bahanbaku.routes");
const outletRoutes = require("./modules/outlet/outlet.routes");

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

// API HEALTH CHECK
app.get("/api/health", (req, res) => {
  res.status(200).json({
    message: "API is running",
    status: "Active",
  });
});

// API ROUTE
app.use("/api/auth", authRoutes);
app.use("/api/pengguna", penggunaRoutes);
app.use("/api/produk", produkRoutes);
app.use("/api/bahan-baku", bahanBakuRoutes);
app.use("/api/outlet", outletRoutes);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
