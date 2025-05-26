// src/app/api/admin.js
const Evento = require('../models/Evento');

exports.aprobarEvento = async (req, res) => {
  const { id } = req.params;
  const evento = await Evento.findById(id);
  if (!evento) {
    return res.status(404).json({ message: 'Evento no encontrado' });
  }
  evento.status = 'aprobado';
  await evento.save();
  await procesarPago(evento); // Procesar el pago
  return res.json({ message: 'Evento aprobado y pago procesado con éxito' });
};
exports.rechazarEvento = async (req, res) => {
  const { id } = req.params;
  const evento = await Evento.findById(id);
  if (!evento) {
    return res.status(404).json({ message: 'Evento no encontrado' });
  }
  evento.status = 'rechazado';
  await evento.save();
  return res.json({ message: 'Evento rechazado con éxito' });
};

// src/app/api/admin.js
exports.verAgenda = async (req, res) => {
  const eventos = await Evento.find(); // Obtener todos los eventos
  return res.json(eventos);
};
