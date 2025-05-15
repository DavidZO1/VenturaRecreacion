// backend/seed.js
const Evento = require('./models/Evento');
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    await Evento.create({
      tipo: "Cumpleaños",
      fecha: new Date(),
      ubicacion: "Casa Principal",
      usuario: new mongoose.Types.ObjectId() // ID de usuario válido
    });
    console.log("Evento de prueba creado");
    process.exit();
  });