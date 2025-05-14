// backend/models/User.js
const mongoose = require('mongoose'); // Agrega esta línea

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    availability: { type: [String], default: [] },
    incentives: { type: Number, default: 0 },
});

// Agrega esto para exportar el modelo
module.exports = mongoose.model('User', userSchema);