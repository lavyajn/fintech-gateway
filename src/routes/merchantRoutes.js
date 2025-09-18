const express = require('express');
const router = express.Router();

const { signupMerchant, loginMerchant, getMerchantProfile, generateApiKeys, configureWebhook } = require('../controllers/merchantController.js');
const { protect } = require('../middlewares/authMiddleware.js');

//sign up route
router.post('/signup', signupMerchant);

//login route
router.post('/login', loginMerchant);

//profile route protected by protct middleware
router.get('/profile', protect , getMerchantProfile);

//router for generating api-keys
router.post('/api-keys', protect, generateApiKeys);

router.put('/webhook', protect, configureWebhook);

module.exports = router;