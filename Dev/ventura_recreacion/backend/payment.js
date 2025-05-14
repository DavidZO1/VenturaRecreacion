// backend/payment.js
require('dotenv').config();
const express = require('express');
const Stripe = require('stripe');
const jwt = require('jsonwebtoken');
const router = express.Router();

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
    
    // Validar monto
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Se requiere un monto válido' });
    }

    // Crear intento de pago
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convertir a centavos
      currency: 'mxn', // Usando pesos mexicanos
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

// Webhooks para procesar eventos de Stripe
router.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  // Manejar eventos específicos
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('PaymentIntent was successful!', paymentIntent.id);
      // Aquí podrías actualizar tu base de datos, crear facturas, etc.
      break;
    case 'payment_method.attached':
      const paymentMethod = event.data.object;
      console.log('PaymentMethod was attached to a Customer!', paymentMethod.id);
      break;
    // ... otros eventos
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
  
  res.json({received: true});
});

module.exports = router;