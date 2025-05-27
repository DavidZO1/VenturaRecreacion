require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const paymentRoutes = require('./payment');
const userRoutes = require('./userRoutes');
const eventoRoutes = require('./eventoRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Stripe webhook route must come before any body parsers to access raw body
app.post(
  '/api/payments/webhook',
  express.raw({ type: 'application/json' }),
  paymentRoutes
);

// Middleware for other routes
app.use(cors({
  origin: ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
// Parse JSON bodies for non-webhook routes
app.use((req, res, next) => {
  if (req.originalUrl === '/api/payments/webhook') return next();
  express.json()(req, res, next);
});
app.use(bodyParser.json({ verify: (req, res, buf) => { /* skip raw for webhook */ } }));

// Rutas
app.use('/api/payments', paymentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/eventos', eventoRoutes);

// Ruta básica
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB error:', err));

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
