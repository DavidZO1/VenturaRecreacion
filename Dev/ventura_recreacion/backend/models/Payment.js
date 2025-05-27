const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  eventoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Evento'
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'COP'
  },
  status: {
    type: String,
    enum: ['succeeded', 'pending', 'failed'],
    required: true
  },
  paymentIntentId: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Payment', paymentSchema);