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

// Crear intent de pago - CORREGIDO PARA COP
router.post('/create-payment-intent', auth, async (req, res) => {
  try {
    const { amount, metadata = {} } = req.body;
    
    console.log('📥 Datos recibidos:', { amount, tipo: typeof amount, metadata });
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Se requiere un monto válido' });
    }

    // CRÍTICO: Para COP, NO dividir por 100
    // COP no tiene centavos, por lo que 10000 COP = 10000 (no 10000/100)
    const amountInCOP = Math.round(Number(amount)); // Convertir a número entero
    
    console.log('🔢 Procesando monto:', {
      original: amount,
      procesado: amountInCOP,
      moneda: 'COP'
    });
    
    // Validar monto mínimo (equivalente a ~$0.50 USD)
    // Para que 50 centavos USD funcionen con COP, necesitamos al menos ~2000 COP
    const MIN_AMOUNT_COP = 2000;
    if (amountInCOP < MIN_AMOUNT_COP) {
      console.error(`❌ Monto muy pequeño: ${amountInCOP} COP (mínimo: ${MIN_AMOUNT_COP} COP)`);
      return res.status(400).json({ 
        message: `El monto mínimo es ${MIN_AMOUNT_COP} COP (aproximadamente $0.50 USD)`,
        receivedAmount: amountInCOP,
        minimumAmount: MIN_AMOUNT_COP
      });
    }

    console.log(`💰 Creando PaymentIntent por ${amountInCOP} COP`);

    // CORREGIDO: Pasar el monto exacto sin modificaciones
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCOP, // ✅ Monto exacto en COP (SIN dividir por 100)
      currency: 'COP', // ✅ Moneda peso colombiano
      metadata: {
        userId: req.userId,
        originalAmount: amountInCOP, // Para debugging
        ...metadata
      },
      // Configuraciones específicas para Colombia
      payment_method_types: ['card'],
      statement_descriptor_suffix: 'EVENTOS',
      receipt_email: metadata.userEmail,
    });

    console.log(`✅ PaymentIntent creado exitosamente:`, {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status
    });

    res.json({ 
      clientSecret: paymentIntent.client_secret,
      id: paymentIntent.id,
      amount: paymentIntent.amount, // Esto debería ser igual a amountInCOP
      currency: paymentIntent.currency
    });

  } catch (error) {
    console.error('🔥 Error en create-payment-intent:', error);
    
    // Manejar errores específicos de Stripe
    if (error.code === 'amount_too_small') {
      console.error('💸 Error: Monto demasiado pequeño para Stripe');
      return res.status(400).json({ 
        message: 'El monto es demasiado pequeño para procesar internacionalmente. Mínimo 2000 COP.',
        stripeError: error.message,
        receivedAmount: req.body.amount
      });
    }
    
    // Log adicional para debugging
    console.error('Error details:', {
      code: error.code,
      type: error.type,
      message: error.message,
      requestedAmount: req.body.amount
    });
    
    res.status(500).json({ 
      message: error.message,
      code: error.code || 'unknown_error'
    });
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
        console.log(`💰 Pago exitoso:`, {
          id: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency.toUpperCase(),
          metadata: paymentIntent.metadata
        });
        
        // 1. Guardar en la colección Payment
        const newPayment = new Payment({
          userId: paymentIntent.metadata.userId,
          eventoId: paymentIntent.metadata.eventoId || null,
          amount: paymentIntent.amount, // Monto en COP
          currency: paymentIntent.currency.toUpperCase(), // 'COP'
          status: 'succeeded',
          paymentIntentId: paymentIntent.id,
          metadata: {
            platform: paymentIntent.metadata.platform || 'web',
            userEmail: paymentIntent.metadata.userEmail,
            userName: paymentIntent.metadata.userName,
            originalAmount: paymentIntent.metadata.originalAmount
          }
        });
        
        await newPayment.save();
        console.log('📄 Pago guardado en DB:', newPayment._id);

        // 2. Actualizar estado del evento si existe
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
          if (updatedEvento) {
            console.log('📅 Evento actualizado:', updatedEvento._id);
          }
        }
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        console.log(`❌ Pago fallido:`, {
          id: failedPayment.id,
          amount: failedPayment.amount,
          currency: failedPayment.currency,
          error: failedPayment.last_payment_error
        });
        
        // Guardar el pago fallido
        const failedPaymentRecord = new Payment({
          userId: failedPayment.metadata.userId,
          eventoId: failedPayment.metadata.eventoId || null,
          amount: failedPayment.amount,
          currency: failedPayment.currency.toUpperCase(),
          status: 'failed',
          paymentIntentId: failedPayment.id,
          metadata: {
            platform: failedPayment.metadata.platform || 'web',
            userEmail: failedPayment.metadata.userEmail,
            userName: failedPayment.metadata.userName,
            originalAmount: failedPayment.metadata.originalAmount,
            error: failedPayment.last_payment_error?.message
          }
        });
        
        await failedPaymentRecord.save();
        console.log('📄 Pago fallido guardado en DB:', failedPaymentRecord._id);
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

    const formattedPayments = payments.map(p => ({
      amount: p.amount, // Ya está en COP
      date: p.createdAt.toISOString(),
      status: p.status === 'succeeded' ? 'completado' : 
              p.status === 'failed' ? 'fallido' : 'pendiente',
      eventoId: p.eventoId?._id || null,
      currency: p.currency || 'COP',
      detallesEvento: p.eventoId ? {
        fecha: p.eventoId.fecha,
        tipo: p.eventoId.tipo,
        ubicacion: p.eventoId.ubicacion
      } : null
    }));

    console.log(`📊 Historial solicitado para usuario ${req.userId}: ${formattedPayments.length} pagos`);
    res.json(formattedPayments);
    
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({ message: 'Error al obtener el historial' });
  }
});

module.exports = router;