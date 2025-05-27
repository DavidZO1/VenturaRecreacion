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

// FUNCIÓN AUXILIAR: Convertir COP a la unidad que Stripe espera
function convertCOPForStripe(amountInCOP) {
  // Para COP, Stripe espera el monto en pesos (no centavos)
  // Pero internamente lo trata como si fuera centavos
  // Por eso debemos multiplicar por 100 para que Stripe lo interprete correctamente
  return Math.round(Number(amountInCOP) * 100);
}

// FUNCIÓN AUXILIAR: Convertir de Stripe COP a COP real
function convertStripeAmountToCOP(stripeAmount) {
  // Stripe nos devuelve el monto multiplicado por 100
  // Dividimos por 100 para obtener el monto real en COP
  return Math.round(stripeAmount / 100);
}

// Crear intent de pago - CORREGIDO PARA COP
router.post('/create-payment-intent', auth, async (req, res) => {
  try {
    const { amount, metadata = {} } = req.body;
    
    console.log('📥 Datos recibidos:', { amount, tipo: typeof amount, metadata });
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Se requiere un monto válido' });
    }

    // Convertir a número entero en COP
    const amountInCOP = Math.round(Number(amount));
    
    // Validar monto mínimo en COP real (2000 COP = ~$0.50 USD)
    const MIN_AMOUNT_COP = 2000;
    if (amountInCOP < MIN_AMOUNT_COP) {
      console.error(`❌ Monto muy pequeño: ${amountInCOP} COP (mínimo: ${MIN_AMOUNT_COP} COP)`);
      return res.status(400).json({ 
        message: `El monto mínimo es ${MIN_AMOUNT_COP} COP (aproximadamente $0.50 USD)`,
        receivedAmount: amountInCOP,
        minimumAmount: MIN_AMOUNT_COP
      });
    }

    // CRÍTICO: Convertir COP para Stripe (multiplicar por 100)
    const stripeAmount = convertCOPForStripe(amountInCOP);
    
    console.log(`💰 Procesando pago:`, {
      montoOriginal: amountInCOP + ' COP',
      montoParaStripe: stripeAmount,
      explicacion: 'Stripe espera COP * 100 para procesamiento interno'
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: stripeAmount, // Monto convertido para Stripe
      currency: 'COP',
      metadata: {
        userId: req.userId,
        originalAmountCOP: amountInCOP, // Guardamos el monto real para referencia
        ...metadata
      },
      payment_method_types: ['card'],
      statement_descriptor_suffix: 'EVENTOS',
      receipt_email: metadata.userEmail,
    });

    console.log(`✅ PaymentIntent creado exitosamente:`, {
      id: paymentIntent.id,
      stripeAmount: paymentIntent.amount,
      realAmountCOP: amountInCOP,
      currency: paymentIntent.currency,
      status: paymentIntent.status
    });

    res.json({ 
      clientSecret: paymentIntent.client_secret,
      id: paymentIntent.id,
      amount: amountInCOP, // Devolvemos el monto real en COP
      stripeAmount: paymentIntent.amount, // Para debugging
      currency: paymentIntent.currency
    });

  } catch (error) {
    console.error('🔥 Error en create-payment-intent:', error);
    
    if (error.code === 'amount_too_small') {
      console.error('💸 Error: Monto demasiado pequeño para Stripe');
      return res.status(400).json({ 
        message: 'El monto es demasiado pequeño para procesar internacionalmente. Mínimo 2000 COP.',
        stripeError: error.message,
        receivedAmount: req.body.amount,
        explanation: 'Stripe requiere que el monto equivalga a al menos $0.50 USD'
      });
    }
    
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

// Webhook mejorado para manejar montos de COP correctamente
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
        
        // CRÍTICO: Convertir el monto de Stripe de vuelta a COP real
        const realAmountCOP = convertStripeAmountToCOP(paymentIntent.amount);
        
        console.log(`💰 Pago exitoso:`, {
          id: paymentIntent.id,
          stripeAmount: paymentIntent.amount,
          realAmountCOP: realAmountCOP,
          currency: paymentIntent.currency.toUpperCase(),
          originalFromMetadata: paymentIntent.metadata.originalAmountCOP
        });
        
        // Usar el monto original guardado en metadata si está disponible
        const finalAmount = paymentIntent.metadata.originalAmountCOP 
          ? parseInt(paymentIntent.metadata.originalAmountCOP)
          : realAmountCOP;
        
        const newPayment = new Payment({
          userId: paymentIntent.metadata.userId,
          eventoId: paymentIntent.metadata.eventoId || null,
          amount: finalAmount, // Monto real en COP
          currency: paymentIntent.currency.toUpperCase(),
          status: 'succeeded',
          paymentIntentId: paymentIntent.id,
          metadata: {
            platform: paymentIntent.metadata.platform || 'web',
            userEmail: paymentIntent.metadata.userEmail,
            userName: paymentIntent.metadata.userName,
            originalAmountCOP: finalAmount,
            stripeAmount: paymentIntent.amount // Para debugging
          }
        });
        
        await newPayment.save();
        console.log('📄 Pago guardado en DB:', newPayment._id);

        // Actualizar estado del evento si existe
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
        const failedAmountCOP = convertStripeAmountToCOP(failedPayment.amount);
        
        console.log(`❌ Pago fallido:`, {
          id: failedPayment.id,
          stripeAmount: failedPayment.amount,
          realAmountCOP: failedAmountCOP,
          currency: failedPayment.currency,
          error: failedPayment.last_payment_error
        });
        
        const finalFailedAmount = failedPayment.metadata.originalAmountCOP 
          ? parseInt(failedPayment.metadata.originalAmountCOP)
          : failedAmountCOP;
        
        const failedPaymentRecord = new Payment({
          userId: failedPayment.metadata.userId,
          eventoId: failedPayment.metadata.eventoId || null,
          amount: finalFailedAmount,
          currency: failedPayment.currency.toUpperCase(),
          status: 'failed',
          paymentIntentId: failedPayment.id,
          metadata: {
            platform: failedPayment.metadata.platform || 'web',
            userEmail: failedPayment.metadata.userEmail,
            userName: failedPayment.metadata.userName,
            originalAmountCOP: finalFailedAmount,
            stripeAmount: failedPayment.amount,
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
      amount: p.amount, // Ya está en COP real
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

// Endpoint de prueba para verificar conversiones
router.get('/test-conversion/:amount', (req, res) => {
  const amount = parseInt(req.params.amount);
  const stripeAmount = convertCOPForStripe(amount);
  const backToCOP = convertStripeAmountToCOP(stripeAmount);
  
  res.json({
    originalCOP: amount,
    forStripe: stripeAmount,
    backToCOP: backToCOP,
    explanation: {
      toStripe: 'COP * 100 (Stripe espera centavos)',
      fromStripe: 'StripeAmount / 100 (convertir de vuelta a COP)'
    }
  });
});

module.exports = router;