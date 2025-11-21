const express = require("express");
const router = express.Router();
const passport = require("passport");
const authorizeRole = require("../middlewares/authorizeRole");
const productRepo = require("../repositories/ProductRepository");

// Crear producto - solo admin
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  authorizeRole("admin"),
  async (req, res, next) => {
    try {
      const p = await productRepo.create(req.body);
      res.status(201).json(p);
    } catch (err) {
      next(err);
    }
  }
);

// Actualizar producto - solo admin
router.put(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  authorizeRole("admin"),
  async (req, res, next) => {
    try {
      const p = await productRepo.update(req.params.id, req.body);
      res.json(p);
    } catch (err) {
      next(err);
    }
  }
);

// Eliminar producto - solo admin
router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  authorizeRole("admin"),
  async (req, res, next) => {
    try {
      await productRepo.delete(req.params.id);
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  }
);

// Listar productos - cualquier usuario
router.get("/", async (req, res, next) => {
  try {
    const list = await productRepo.list();
    res.json(list);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
