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
        enum: ['pendiente', 'aprobado', 'rechazado', 'pagado', 'completado', 'cancelado'],
        default: 'pendiente'
    },
    usuario: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    },
    // Campos nuevos para administración
    aprobadoPor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    fechaAprobacion: {
        type: Date
    },
    fechaRechazo: {
        type: Date
    },
    motivoRechazo: {
        type: String
    },
    precio: {
        type: Number,
        default: 0
    },
    pagado: {
        type: Boolean,
        default: false
    },
    fechaPago: {
        type: Date
    },
    notas: {
        type: String
    },
    createdAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});

// Índices para optimizar consultas
eventoSchema.index({ fecha: 1 });
eventoSchema.index({ usuario: 1 });
eventoSchema.index({ estado: 1 });
eventoSchema.index({ fecha: 1, estado: 1 });

module.exports = mongoose.model('Evento', eventoSchema);