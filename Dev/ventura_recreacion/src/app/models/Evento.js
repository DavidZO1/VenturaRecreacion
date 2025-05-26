// src/app/models/Evento.js
const mongoose = require('mongoose');

const eventoSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // ID del usuario que crea el evento
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  status: { type: String, default: 'pendiente de aprobación' }, // Estado del evento
  paymentMethod: { type: String, required: true }
});

const Evento = mongoose.model('Evento', eventoSchema);
module.exports = Evento;
