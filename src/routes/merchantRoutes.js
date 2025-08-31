const express = require('express');
const router = express.Router();

const {signupMerchant} = require('../controllers/merchantController.js');

router.post('/signup', signupMerchant);

module.exports = router;