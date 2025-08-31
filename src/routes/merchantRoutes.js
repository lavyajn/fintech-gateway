const express = require('express');
const router = express.Router();

const { signupMerchant,loginMerchant, getMerchantProfile } = require('../controllers/merchantController.js');
const { protect } = require('../middlewares/authMiddleware.js');

//sign up route
router.post('/signup', signupMerchant);

//login route
router.post('/login', loginMerchant);

//profile route protected by out protct middleware
router.get('/profile', protect , getMerchantProfile);

module.exports = router;