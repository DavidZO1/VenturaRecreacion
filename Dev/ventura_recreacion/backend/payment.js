require('dotenv').config();
const express = require('express');
const Stripe = require('stripe');
const jwt = require('jsonwebtoken');
const router = express.Router();
const Payment = require('./models/Payment');
const Evento = require('./models/Evento');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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

// Crear intent de pago
router.post('/create-payment-intent', auth, async (req, res) => {
  try {
    const { amount, metadata = {} } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Se requiere un monto válido' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount),
      currency: 'mxn',
      metadata: {
        userId: req.userId,
        ...metadata
      }
    });

    res.json({ 
      clientSecret: paymentIntent.client_secret,
      id: paymentIntent.id
    });
  } catch (error) {
    console.error('Error en create-payment-intent:', error);
    res.status(500).json({ message: error.message });
  }
});

// Webhook mejorado con logs de depuración
router.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    console.log('✅ Webhook verificado:', event.type);
  } catch (err) {
    console.log('❌ Error en webhook:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log('💰 Pago exitoso:', paymentIntent.id);
        
        // 1. Guardar en la colección Payment
        const newPayment = new Payment({
          userId: paymentIntent.metadata.userId,
          eventoId: paymentIntent.metadata.eventoId,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          status: 'succeeded',
          paymentIntentId: paymentIntent.id
        });
        
        await newPayment.save();
        console.log('📄 Pago guardado en DB:', newPayment._id);

        // 2. Actualizar estado del evento
        if (paymentIntent.metadata.eventoId) {
          const updatedEvento = await Evento.findByIdAndUpdate(
            paymentIntent.metadata.eventoId,
            {
              estado: 'pagado',
              fechaPago: new Date(),
              pagado: true
            },
            { new: true }
          );
          console.log('📅 Evento actualizado:', updatedEvento._id);
        }
        break;

      default:
        console.log('⚡ Evento no manejado:', event.type);
    }
  } catch (error) {
    console.log('🔥 Error procesando webhook:', error);
  }

  res.json({ received: true });
});
// Obtener historial de pagos
router.get('/history', auth, async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.userId })
      .populate('eventoId', 'fecha tipo ubicacion')
      .sort({ createdAt: -1 });

    res.json(payments.map(p => ({
      amount: p.amount,
      date: p.createdAt.toISOString(),
      status: p.status === 'succeeded' ? 'completado' : 'fallido',
      eventoId: p.eventoId?._id || 'N/A',
      detallesEvento: p.eventoId ? {
        fecha: p.eventoId.fecha,
        tipo: p.eventoId.tipo,
        ubicacion: p.eventoId.ubicacion
      } : null
    })));
    
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({ message: 'Error al obtener el historial' });
  }
});

module.exports = router;