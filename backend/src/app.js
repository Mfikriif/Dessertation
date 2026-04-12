const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

require('dotenv').config();

const app = express();

// IMPORT ROUTE
const authRoutes = require('./routes/auth/authRoutes');

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
app.use('/api/auth', authRoutes);


const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;