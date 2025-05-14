// backend/server.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const paymentRoutes = require('./payment');
const userRoutes = require('./userRoutes');
const Evento = require('./models/Evento');

  const app = express();
  const PORT = process.env.PORT || 5000;

  // Middleware
  app.use(cors());
  app.use(bodyParser.json());

  // Conectar a MongoDB
  mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

  // Rutas
  app.get('/', (req, res) => {
    res.send('API is running...');
  });

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

  // Agregar rutas
app.use('/api', paymentRoutes);
app.use('/api/users', userRoutes);

// Nueva ruta para eventos
app.get('/api/eventos', async (req, res) => {
    try {
        // Ejemplo básico - Reemplazar con tu modelo de eventos
        const eventos = await Evento.find().limit(10);
        res.json(eventos);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener eventos' });
    }
});
  