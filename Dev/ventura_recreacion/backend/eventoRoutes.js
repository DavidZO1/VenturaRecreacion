// backend/eventoRoutes.js - VERSIÓN CORREGIDA
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
    console.error('Auth error:', error);
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
    console.error('Error fetching eventos:', error);
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
    console.error('Error fetching mis eventos:', error);
    res.status(500).json({ message: error.message });
  }
});

// Obtener eventos pendientes (solo para admins) - CORREGIDO
router.get('/pendientes', auth, isAdmin, async (req, res) => {
  try {
    console.log('Fetching eventos pendientes for admin:', req.userId);
    
    const eventos = await Evento.find({ estado: 'pendiente' })
      .populate('usuario', 'name email')
      .sort({ createdAt: 1 });
    
    console.log(`Found ${eventos.length} eventos pendientes`);
    res.json(eventos);
  } catch (error) {
    console.error('Error fetching eventos pendientes:', error);
    res.status(500).json({ message: error.message });
  }
});

// Obtener eventos por mes (para agenda del admin) - CORREGIDO
router.get('/agenda/:year/:month', auth, isAdmin, async (req, res) => {
  try {
    const { year, month } = req.params;
    
    console.log(`Fetching agenda for ${year}-${month}`);
    
    // Crear fechas de inicio y fin del mes
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
    
    console.log('Date range:', startDate, 'to', endDate);
    
    const eventos = await Evento.find({
      fecha: { $gte: startDate, $lte: endDate },
      estado: { $in: ['aprobado', 'pagado', 'completado'] }
    })
    .populate('usuario', 'name email')
    .sort({ fecha: 1 });
    
    console.log(`Found ${eventos.length} eventos in agenda`);
    res.json(eventos);
  } catch (error) {
    console.error('Error fetching agenda:', error);
    res.status(500).json({ message: error.message });
  }
});

// Obtener un evento específico - CORREGIDO
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
    console.error('Error fetching evento:', error);
    res.status(500).json({ message: error.message });
  }
});

// Crear un nuevo evento - CORREGIDO
router.post('/', auth, async (req, res) => {
  try {
    console.log('Creating new evento for user:', req.userId);
    console.log('Evento data:', req.body);
    
    const eventoData = { 
      ...req.body, 
      usuario: req.userId,
      estado: 'pendiente' // Siempre inicia como pendiente
    };
    
    const nuevoEvento = new Evento(eventoData);
    const eventoGuardado = await nuevoEvento.save();
    
    console.log('Evento created with ID:', eventoGuardado._id);
    
    // Poblar los datos del usuario para la respuesta
    await eventoGuardado.populate('usuario', 'name email');
    
    res.status(201).json(eventoGuardado);
  } catch (error) {
    console.error('Error creating evento:', error);
    res.status(400).json({ message: error.message });
  }
});

// Aprobar un evento (solo para admins) - CORREGIDO
router.patch('/:id/aprobar', auth, isAdmin, async (req, res) => {
  try {
    const { precio, notas } = req.body;
    
    console.log(`Admin ${req.userId} approving evento ${req.params.id}`);
    
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
    
    console.log('Evento approved successfully');
    res.json(eventoActualizado);
  } catch (error) {
    console.error('Error approving evento:', error);
    res.status(400).json({ message: error.message });
  }
});

// Rechazar un evento (solo para admins) - CORREGIDO
router.patch('/:id/rechazar', auth, isAdmin, async (req, res) => {
  try {
    const { motivoRechazo } = req.body;

    console.log(`Admin ${req.userId} rejecting evento ${req.params.id}`);

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
        motivoRechazo: motivoRechazo || 'Sin motivo especificado',
      },
      { new: true }
    ).populate('usuario', 'name email');

    console.log('Evento rechazado correctamente');
    res.json(eventoActualizado);
  } catch (error) {
    console.error('Error rechazando evento:', error);
    res.status(400).json({ message: error.message });
  }
});

// Eliminar un evento (dueño o admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const evento = await Evento.findById(req.params.id);
    if (!evento) {
      return res.status(404).json({ message: 'Evento no encontrado' });
    }

    // Solo el dueño o un admin puede eliminarlo
    if (req.userRole !== 'admin' && evento.usuario.toString() !== req.userId) {
      return res.status(403).json({ message: 'No autorizado para eliminar este evento' });
    }

    await evento.remove();
    res.json({ message: 'Evento eliminado correctamente' });
  } catch (error) {
    console.error('Error eliminando evento:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;