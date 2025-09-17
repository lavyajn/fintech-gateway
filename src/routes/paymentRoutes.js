const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware.js');
const { apiKeyAuth } = require('../middlewares/apiKeyAuth.js');
const { initiatePayment, processPayment } = require('../controllers/paymentController.js');


// POST /api/v1/payments/initiate
// this method is used for payment of a logged-in merchant
router.post('/initiate', protect, initiatePayment);

// POST /api/v1/payments/paymentId/process
// this method is used for the merchant's server to start the payment
// uses API key authentication not JWT
router.post('/:paymentId/process', apiKeyAuth, processPayment);

module.exports = router;