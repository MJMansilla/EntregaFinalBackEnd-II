
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const passport = require('passport');
const authorizeRole = require('../middlewares/authorizeRole');

// Crear usuario (público)
router.post('/', async (req, res) => {
  try {
    const { first_name, last_name, email, age, password, cart, role } = req.body;
    const user = new User({ first_name, last_name, email, age, password, cart, role });
    await user.save();
    const u = user.toObject();
    delete u.password;
    res.status(201).json(u);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// Listar todos - protegido (solo admin)
router.get('/', passport.authenticate('jwt', { session: false }), authorizeRole('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener por id - protegido (admin o el mismo usuario)
router.get('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const requester = req.user;
    if (requester.role !== 'admin' && requester._id.toString() !== req.params.id) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Actualizar - protegido (admin o mismo usuario)
router.put('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const requester = req.user;
    if (requester.role !== 'admin' && requester._id.toString() !== req.params.id) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }
    const updates = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    Object.assign(user, updates);
    await user.save();
    const u = user.toObject();
    delete u.password;
    res.json(u);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Eliminar - protegido (admin)
router.delete('/:id', passport.authenticate('jwt', { session: false }), authorizeRole('admin'), async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ message: 'Usuario eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cambiar rol - protegido (admin)
router.patch('/:id/role', passport.authenticate('jwt', { session: false }), authorizeRole('admin'), async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user','admin'].includes(role)) return res.status(400).json({ error: 'Rol inválido' });
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    user.role = role;
    await user.save();
    const u = user.toObject();
    delete u.password;
    res.json(u);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
