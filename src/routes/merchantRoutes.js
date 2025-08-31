const express = require('express');
const router = express.Router();

const {signupMerchant,loginMerchant} = require('../controllers/merchantController.js');

//sign up route
router.post('/signup', signupMerchant);

//login route
router.post('/login', loginMerchant);

module.exports = router;