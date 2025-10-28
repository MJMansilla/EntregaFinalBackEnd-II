const express = require("express");
const router = express.Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Faltan credenciales" });
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Credenciales inválidas" });
    const valid = user.isValidPassword(password);
    if (!valid)
      return res.status(401).json({ error: "Credenciales inválidas" });
    const payload = { sub: user._id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET || "secret", {
      expiresIn: "8h",
    });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ruta current
router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const user = req.user.toObject();
    delete user.password;
    res.json(user);
  }
);

module.exports = router;
