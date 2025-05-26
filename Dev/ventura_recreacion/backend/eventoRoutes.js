// backend/eventoRoutes.js
const express = require('express');
const Evento = require('./models/Evento');
const User = require('./models/User');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Middleware de autenticación 
const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(401).json({ message: 'User not found' });
    
    req.userId = decoded.userId;
    req.userRole = user.role;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Middleware para verificar si es administrador
const isAdmin = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ message: 'Acceso denegado. Se requieren permisos de administrador.' });
  }
  next();
};

// Obtener todos los eventos (solo para admins)
router.get('/', auth, async (req, res) => {
  try {
    let eventos;
    
    if (req.userRole === 'admin') {
      // Los admins pueden ver todos los eventos
      eventos = await Evento.find()
        .populate('usuario', 'name email')
        .populate('aprobadoPor', 'name')
        .sort({ fecha: 1 });
    } else {
      // Los usuarios solo ven eventos aprobados y públicos
      eventos = await Evento.find({ estado: 'aprobado' })
        .populate('usuario', 'name')
        .sort({ fecha: 1 });
    }
    
    res.json(eventos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Obtener eventos del usuario autenticado
router.get('/mis-eventos', auth, async (req, res) => {
  try {
    const eventos = await Evento.find({ usuario: req.userId })
      .populate('aprobadoPor', 'name')
      .sort({ fecha: 1 });
    res.json(eventos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Obtener eventos pendientes (solo para admins)
router.get('/pendientes', auth, isAdmin, async (req, res) => {
  try {
    const eventos = await Evento.find({ estado: 'pendiente' })
      .populate('usuario', 'name email')
      .sort({ createdAt: 1 });
    res.json(eventos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Obtener eventos por mes (para agenda del admin)
router.get('/agenda/:year/:month', auth, isAdmin, async (req, res) => {
  try {
    const { year, month } = req.params;
    
    // Crear fechas de inicio y fin del mes
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
    
    const eventos = await Evento.find({
      fecha: { $gte: startDate, $lte: endDate },
      estado: { $in: ['aprobado', 'pagado', 'completado'] }
    })
    .populate('usuario', 'name email')
    .sort({ fecha: 1 });
    
    res.json(eventos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Obtener un evento específico
router.get('/:id', auth, async (req, res) => {
  try {
    const evento = await Evento.findById(req.params.id)
      .populate('usuario', 'name email')
      .populate('aprobadoPor', 'name');
    
    if (!evento) {
      return res.status(404).json({ message: 'Evento no encontrado' });
    }
    
    // Verificar permisos: solo el dueño o admin pueden ver el evento
    if (req.userRole !== 'admin' && evento.usuario._id.toString() !== req.userId) {
      return res.status(403).json({ message: 'No autorizado para ver este evento' });
    }
    
    res.json(evento);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Crear un nuevo evento
router.post('/', auth, async (req, res) => {
  try {
    const eventoData = { 
      ...req.body, 
      usuario: req.userId,
      estado: 'pendiente' // Siempre inicia como pendiente
    };
    
    const nuevoEvento = new Evento(eventoData);
    const eventoGuardado = await nuevoEvento.save();
    
    // Poblar los datos del usuario para la respuesta
    await eventoGuardado.populate('usuario', 'name email');
    
    res.status(201).json(eventoGuardado);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Aprobar un evento (solo para admins)
router.patch('/:id/aprobar', auth, isAdmin, async (req, res) => {
  try {
    const { precio, notas } = req.body;
    
    const evento = await Evento.findById(req.params.id);
    if (!evento) {
      return res.status(404).json({ message: 'Evento no encontrado' });
    }
    
    if (evento.estado !== 'pendiente') {
      return res.status(400).json({ message: 'Solo se pueden aprobar eventos pendientes' });
    }
    
    const eventoActualizado = await Evento.findByIdAndUpdate(
      req.params.id,
      {
        estado: 'aprobado',
        aprobadoPor: req.userId,
        fechaAprobacion: new Date(),
        precio: precio || 0,
        notas: notas || ''
      },
      { new: true }
    ).populate('usuario', 'name email').populate('aprobadoPor', 'name');
    
    res.json(eventoActualizado);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Rechazar un evento (solo para admins)
router.patch('/:id/rechazar', auth, isAdmin, async (req, res) => {
  try {
    const { motivoRechazo } = req.body;
    
    const evento = await Evento.findById(req.params.id);
    if (!evento) {
      return res.status(404).json({ message: 'Evento no encontrado' });
    }
    
    if (evento.estado !== 'pendiente') {
      return res.status(400).json({ message: 'Solo se pueden rechazar eventos pendientes' });
    }
    
    const eventoActualizado = await Evento.findByIdAndUpdate(
      req.params.id,
      {
        estado: 'rechazado',
        fechaRechazo: new Date(),
        motivoRechazo: motivoRechazo || 'No especificado'
      },
      { new: true }
    ).populate('usuario', 'name email');
    
    res.json(eventoActualizado);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Marcar evento como pagado (solo para admins)
router.patch('/:id/marcar-pagado', auth, isAdmin, async (req, res) => {
  try {
    const evento = await Evento.findById(req.params.id);
    if (!evento) {
      return res.status(404).json({ message: 'Evento no encontrado' });
    }
    
    if (evento.estado !== 'aprobado') {
      return res.status(400).json({ message: 'Solo se pueden marcar como pagados eventos aprobados' });
    }
    
    const eventoActualizado = await Evento.findByIdAndUpdate(
      req.params.id,
      {
        estado: 'pagado',
        pagado: true,
        fechaPago: new Date()
      },
      { new: true }
    ).populate('usuario', 'name email');
    
    res.json(eventoActualizado);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Actualizar un evento (solo el dueño puede editar eventos pendientes)
router.put('/:id', auth, async (req, res) => {
  try {
    const evento = await Evento.findById(req.params.id);
    
    if (!evento) {
      return res.status(404).json({ message: 'Evento no encontrado' });
    }
    
    // Solo el dueño puede editar
    if (evento.usuario.toString() !== req.userId) {
      return res.status(403).json({ message: 'No autorizado para modificar este evento' });
    }
    
    // Solo se pueden editar eventos pendientes
    if (evento.estado !== 'pendiente') {
      return res.status(400).json({ message: 'Solo se pueden editar eventos pendientes' });
    }
    
    const eventoActualizado = await Evento.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('usuario', 'name email');
    
    res.json(eventoActualizado);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Eliminar un evento (solo el dueño puede eliminar eventos pendientes)
router.delete('/:id', auth, async (req, res) => {
  try {
    const evento = await Evento.findById(req.params.id);
    
    if (!evento) {
      return res.status(404).json({ message: 'Evento no encontrado' });
    }
    
    // Solo el dueño puede eliminar
    if (evento.usuario.toString() !== req.userId) {
      return res.status(403).json({ message: 'No autorizado para eliminar este evento' });
    }
    
    // Solo se pueden eliminar eventos pendientes o rechazados
    if (!['pendiente', 'rechazado'].includes(evento.estado)) {
      return res.status(400).json({ message: 'Solo se pueden eliminar eventos pendientes o rechazados' });
    }
    
    await Evento.findByIdAndDelete(req.params.id);
    res.json({ message: 'Evento eliminado' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;