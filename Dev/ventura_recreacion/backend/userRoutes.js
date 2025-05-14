// backend/userRoutes.js
const express = require('express');
const User = require('./models/User');
const router = express.Router();

// Crear perfil
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    const user = new User({ name, email, password });
    await user.save();
    res.status(201).send(user);
});

// Obtener disponibilidad
router.get('/:id/availability', async (req, res) => {
    const user = await User.findById(req.params.id);
    res.send(user.availability);
});

// Actualizar disponibilidad
router.put('/:id/availability', async (req, res) => {
    const { availability } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { availability }, { new: true });
    res.send(user);
});

module.exports = router;
