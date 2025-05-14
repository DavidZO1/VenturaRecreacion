const mongoose = require('mongoose');

const eventoSchema = new mongoose.Schema({
    fecha: { type: Date, required: true },
    tipo: { type: String, required: true },
    ubicacion: { type: String, required: true },
    descripcion: String,
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Evento', eventoSchema);