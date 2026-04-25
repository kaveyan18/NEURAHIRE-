const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { createOrder, verifyPayment } = require('../controllers/payment.controller');

// POST /api/payments/create-order
router.post('/create-order', verifyToken, createOrder);

// POST /api/payments/verify
router.post('/verify', verifyToken, verifyPayment);

module.exports = router;
