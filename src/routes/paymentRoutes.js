const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware.js');
const { initiatePayment } = require('../controllers/paymentController.js');

router.use(protect);

// POST /api/v1/payments/initiate
router.post('/initiate', initiatePayment);

module.exports = router;