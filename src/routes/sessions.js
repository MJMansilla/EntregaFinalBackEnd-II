const express = require("express");
const router = express.Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const UserDTO = require("../dtos/UserDTO");
const userRepo = require("../repositories/UserRepository");
const { sendPasswordReset } = require("../services/mailer");

const JWT_SECRET = process.env.JWT_SECRET || "secret";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

/* Login */
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Faltan credenciales" });
    const user = await userRepo.findByEmail(email);
    if (!user) return res.status(401).json({ error: "Credenciales inválidas" });
    const valid = user.isValidPassword(password);
    if (!valid)
      return res.status(401).json({ error: "Credenciales inválidas" });
    const payload = { sub: user._id, role: user.role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "8h" });
    res.json({ token });
  } catch (err) {
    next(err);
  }
});

/* Ruta current - devuelve DTO sin datos sensibles */
router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const dto = new UserDTO(req.user);
    res.json(dto);
  }
);

/* Olvidé mi contraseña - enviar correo electrónico de reinicio */
router.post("/forgot-password", async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email requerido" });
    const user = await userRepo.findByEmail(email);
    if (!user) return res.status(200).json({ ok: true }); // don't reveal whether email exists
    // Generate secure token
    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const expiry = Date.now() + 1000 * 60 * 60; // 1 hour
    await userRepo.setResetToken(user._id, tokenHash, expiry);
    const resetLink = `${FRONTEND_URL}/reset-password?token=${token}&id=${user._id}`;
    // send email
    await sendPasswordReset(user.email, resetLink);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

/* Restablecer contraseña */
router.post("/reset-password", async (req, res, next) => {
  try {
    const { id, token, newPassword } = req.body;
    if (!id || !token || !newPassword)
      return res.status(400).json({ error: "Datos incompletos" });
    const user = await userRepo.findById(id);
    if (!user) return res.status(400).json({ error: "Usuario no encontrado" });
    if (!user.resetTokenHash || !user.resetTokenExpiry)
      return res.status(400).json({ error: "Token inválido o expirado" });
    if (user.resetTokenExpiry < Date.now())
      return res.status(400).json({ error: "Token expirado" });
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    if (tokenHash !== user.resetTokenHash)
      return res.status(400).json({ error: "Token inválido" });
    // prevent resetting to same password
    if (user.isValidPassword(newPassword))
      return res
        .status(400)
        .json({ error: "No puedes reutilizar la contraseña anterior" });
    user.password = newPassword;
    await user.save();
    await userRepo.clearResetToken(user._id);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
