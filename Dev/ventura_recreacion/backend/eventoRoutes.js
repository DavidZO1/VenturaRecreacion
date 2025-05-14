// backend/eventoRoutes.js
const express = require('express');
const Evento = require('./models/Evento');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Middleware de autenticación 
const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Obtener todos los eventos
router.get('/', async (req, res) => {
  try {
    const eventos = await Evento.find().sort({ fecha: 1 });
    res.json(eventos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Obtener eventos del usuario autenticado
router.get('/mis-eventos', auth, async (req, res) => {
  try {
    const eventos = await Evento.find({ usuario: req.userId }).sort({ fecha: 1 });
    res.json(eventos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Obtener un evento específico
router.get('/:id', async (req, res) => {
  try {
    const evento = await Evento.findById(req.params.id);
    if (!evento) {
      return res.status(404).json({ message: 'Evento no encontrado' });
    }
    res.json(evento);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Crear un nuevo evento
router.post('/', auth, async (req, res) => {
  try {
    // Aseguramos que el usuario es el mismo que está autenticado
    const eventoData = { ...req.body, usuario: req.userId };
    
    const nuevoEvento = new Evento(eventoData);
    const eventoGuardado = await nuevoEvento.save();
    
    res.status(201).json(eventoGuardado);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Actualizar un evento
router.put('/:id', auth, async (req, res) => {
  try {
    const evento = await Evento.findById(req.params.id);
    
    if (!evento) {
      return res.status(404).json({ message: 'Evento no encontrado' });
    }
    
    // Verificar que el usuario sea el dueño del evento
    if (evento.usuario.toString() !== req.userId) {
      return res.status(403).json({ message: 'No autorizado para modificar este evento' });
    }
    
    const eventoActualizado = await Evento.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    res.json(eventoActualizado);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Eliminar un evento
router.delete('/:id', auth, async (req, res) => {
  try {
    const evento = await Evento.findById(req.params.id);
    
    if (!evento) {
      return res.status(404).json({ message: 'Evento no encontrado' });
    }
    
    // Verificar que el usuario sea el dueño del evento
    if (evento.usuario.toString() !== req.userId) {
      return res.status(403).json({ message: 'No autorizado para eliminar este evento' });
    }
    
    await Evento.findByIdAndDelete(req.params.id);
    res.json({ message: 'Evento eliminado' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;