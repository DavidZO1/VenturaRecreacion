const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  eventoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Evento',
    default: null // Permitir pagos sin evento asociado
  },
  amount: {
    type: Number,
    required: true,
    min: 1000 // Mínimo 1000 COP
  },
  currency: {
    type: String,
    default: 'COP',
    enum: ['COP', 'USD', 'EUR'], // Permitir otras monedas en el futuro
    uppercase: true
  },
  status: {
    type: String,
    enum: ['succeeded', 'pending', 'failed'],
    required: true
  },
  paymentIntentId: {
    type: String,
    required: true,
    unique: true // Evitar duplicados
  },
  paymentMethod: {
    type: String,
    default: 'card'
  },
  description: {
    type: String,
    default: 'Pago de servicio'
  },
  metadata: {
    platform: {
      type: String,
      default: 'web'
    },
    userEmail: String,
    userName: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Índices para optimizar consultas
paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ paymentIntentId: 1 });
paymentSchema.index({ status: 1 });

// Middleware para actualizar updatedAt
paymentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Método para formatear el monto en COP
paymentSchema.methods.getFormattedAmount = function() {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: this.currency || 'COP',
    minimumFractionDigits: 0
  }).format(this.amount);
};

// Método estático para obtener estadísticas de pagos
paymentSchema.statics.getPaymentStats = async function(userId) {
  return await this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    }
  ]);
};

module.exports = mongoose.model('Payment', paymentSchema);