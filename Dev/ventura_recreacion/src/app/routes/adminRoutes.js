// src/app/routes/adminRoutes.js
const express = require('express');
const { aprobarEvento, rechazarEvento } = require('../api/admin');
const router = express.Router();

router.put('/eventos/:id/aprobar', aprobarEvento);
router.put('/eventos/:id/rechazar', rechazarEvento);
// src/app/routes/adminRoutes.js
router.get('/eventos', verAgenda);


module.exports = router;
