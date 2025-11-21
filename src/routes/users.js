const express = require("express");
const router = express.Router();
const passport = require("passport");
const userRepo = require("../repositories/UserRepository");
const productRepo = require("../repositories/ProductRepository");
const cartRepo = require("../repositories/CartRepository");
const Ticket = require("../models/Ticket");
const crypto = require("crypto");

// Agregar producto al carrito del usuario: solo el propio usuario puede agregarlo
router.post(
  "/:uid/cart/add",
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    try {
      const { uid } = req.params;
      const user = req.user;
      if (user.role !== "admin" && user._id.toString() !== uid)
        return res
          .status(403)
          .json({ error: "Solo el usuario puede modificar su carrito" });
      const { productId, quantity } = req.body;
      if (!productId || !quantity)
        return res.status(400).json({ error: "Datos requeridos" });
      const product = await productRepo.findById(productId);
      if (!product)
        return res.status(404).json({ error: "Producto no encontrado" });
      // get or create cart
      let cart = await cartRepo.findById(user.cart);
      if (!cart) cart = await cartRepo.create({ items: [] });
      // add item
      const idx = cart.items.findIndex((i) => i.productId === productId);
      if (idx >= 0) cart.items[idx].quantity += quantity;
      else cart.items.push({ productId, quantity });
      (await cart.save) ? cart.save() : cartRepo.update(cart._id, cart);
      // ensure user's cart id set
      if (!user.cart) {
        user.cart = cart._id;
        await user.save();
      }
      res.json(cart);
    } catch (err) {
      next(err);
    }
  }
);

// Ruta de compra: comprueba el stock, genera el billete, actualiza el stock y el carrito
router.post(
  "/:uid/purchase",
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    try {
      const { uid } = req.params;
      const user = req.user;
      if (user.role !== "admin" && user._id.toString() !== uid)
        return res
          .status(403)
          .json({ error: "Solo el usuario puede comprar para su cuenta" });
      const cart = await cartRepo.findById(user.cart);
      if (!cart || !cart.items.length)
        return res.status(400).json({ error: "Carrito vacío" });
      const insufficient = [];
      let total = 0;
      const purchasedItems = [];
      for (const item of cart.items) {
        const prod = await productRepo.findById(item.productId);
        if (!prod || prod.stock < item.quantity) {
          insufficient.push({
            productId: item.productId,
            requested: item.quantity,
            available: prod ? prod.stock : 0,
          });
          continue;
        }
        // actualizar stock
        prod.stock -= item.quantity;
        await prod.save();
        total += prod.price * item.quantity;
        purchasedItems.push({
          productId: prod._id.toString(),
          quantity: item.quantity,
          price: prod.price,
        });
      }
      // Generar ticket solo para artículos comprados
      if (purchasedItems.length === 0)
        return res
          .status(400)
          .json({ error: "No hay productos disponibles para comprar" });
      const code = crypto.randomBytes(6).toString("hex").toUpperCase();
      const ticket = await Ticket.create({
        code,
        amount: total,
        purchaser: user._id,
        items: purchasedItems,
      });
      // Retire los artículos comprados del carrito
      cart.items = cart.items.filter(
        (ci) => !purchasedItems.find((pi) => pi.productId === ci.productId)
      );
      await cart.save();
      res.json({ ticket, insufficient });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
