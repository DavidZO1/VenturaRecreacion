// backend/models/Evento.js
const mongoose = require('mongoose');

const eventoSchema = new mongoose.Schema({
    fecha: { type: Date, required: true },
    tipo: { 
        type: String, 
        required: true,
        enum: ['Infantil', 'Empresarial', 'Boda', 'Cumpleaños', 'Otro']
    },
    ubicacion: { type: String, required: true },
    descripcion: { type: String, default: '' },
    numInvitados: { type: Number, default: 0 },
    serviciosAdicionales: { type: String },
    estado: { 
        type: String, 
        enum: ['pendiente', 'confirmado', 'cancelado', 'completado'],
        default: 'pendiente'
    },
    usuario: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    },
    createdAt: { type: Date, default: Date.now }
}, {
    timestamps: true // Agrega createdAt y updatedAt automáticamente
});

module.exports = mongoose.model('Evento', eventoSchema);