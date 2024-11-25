const express = require("express");
const userRoutes = require("./routers/userRoutes");
// const adminRoutes = require("./routers/userRoutes");
const utilityRoutes = require("./routers/utilityRoutes");
const authRoutes = require("./routers/authRoutes");
const adminRoutes = require("./routers/adminRoutes");
const cors = require("cors");
const path = require("path");
const { getCorsOrigin } = require("./utils/helpers");

const app = express();

app.use(
  cors({
    origin: getCorsOrigin,
    credentials: true,
  })
);

app.use(express.json());
// app.use(express.static("images"));
// app.use("/images", express.static(path.join(__dirname, ".", "public/assets")));
app.use("/api/v1", userRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/utility", utilityRoutes);
app.use("/api/v1/auth", authRoutes);

module.exports = app;
