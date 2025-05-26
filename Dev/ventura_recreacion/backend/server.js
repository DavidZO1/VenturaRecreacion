// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const paymentRoutes = require('./payment');
const userRoutes = require('./userRoutes');
const eventoRoutes = require('./eventoRoutes');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());
app.use(bodyParser.json());

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB error:', err));

// Ruta básica
app.get('/', (req, res) => {
  res.send('API is running...');
});

console.log('paymentRoutes:', typeof paymentRoutes);
console.log('userRoutes:', typeof userRoutes);
console.log('eventoRoutes:', typeof eventoRoutes);

// Rutas
app.use('/api/payments', paymentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/eventos', eventoRoutes);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
