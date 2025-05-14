  // backend/models/User.js
  const mongoose = require('mongoose');

  const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    availability: { type: [String], default: [] }, // Ejemplo: ["2025-03-15", "2025-03-20"]
  });

  module.exports = mongoose.model('User ', userSchema);
  