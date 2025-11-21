require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const passport = require("passport");
const cors = require("cors");

const usersRouter = require("./routes/users");
const sessionsRouter = require("./routes/sessions");
const productsRouter = require("./routes/products");
require("./passport");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// routes
app.use("/api/sessions", sessionsRouter);
app.use("/api/users", usersRouter);
app.use("/api/products", productsRouter);
app.use(passport.initialize());

app.use("/api/users", usersRouter);
app.use("/api/sessions", sessionsRouter);

const PORT = process.env.PORT || 3000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/ecommerce";

mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("MongoDB conectado");
    app.listen(PORT, () => console.log(`Server corriendo en puerto ${PORT}`));
  })
  .catch((err) => {
    console.error("Error conectando a MongoDB:", err);
  });
