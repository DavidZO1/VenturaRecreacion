// backend/server.js
require('dotenv').config(); // Debe ser lo primero en el archivo
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const paymentRoutes = require('./payment');
const userRoutes = require('./userRoutes');
const eventoRoutes = require('./eventoRoutes'); // Nueva importación
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Ruta básica
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Agregar rutas
app.use('/api/payments', paymentRoutes); // Corregido el path
app.use('/api/users', userRoutes);
app.use('/api/eventos', eventoRoutes); // Nueva ruta para eventos

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Habilitar CORS para todas las rutas
app.use(cors({
  origin: 'http://localhost:3000', // URL de tu frontend
  credentials: true
}));