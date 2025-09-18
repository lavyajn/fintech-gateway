const jwt = require('jsonwebtoken');
const cryptoRandomString = require('crypto-random-string').default;
const pool = require('../config/db.js');
const bcrypt = require('bcrypt');   
const { configDotenv } = require('dotenv');

const signupMerchant = async (req,res) => {
    try {
        //validation
        const {name, email, password} = req.body;

        //checking for already existing user
        if(!name || !password || !email)
            return res.status(400).json({message: 'All fields are required'});

        const merchantExists = await pool.query('SELECT * FROM merchants WHERE email = $1', [email]);
        if(merchantExists.rows.length > 0) {
            return res.status(409).json({message: 'Email already in use.'});
        }

        //generate hashed password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        //inserting new user into the database
        const newMerchant = await pool.query(
            'INSERT INTO merchants (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, created_at',
            [name,email,passwordHash]
        );
        
        //Sending success message
        res.status(201).json({
            message: 'Merchant is added sucessfully.',
            merchant: newMerchant.rows[0],
        });
    }catch(err) {
        console.error(err);
        res.status(500).json({message: 'Server error while signing up.'})
    }
};

const loginMerchant = async (req,res) => {
    try {
        const { email, password } = req.body;

        //basic validation
        if(!email || !password) {
            return res.status(400).json({message: 'Email and password are required.'});
        }

        //find merchant
        const merchantResult = await pool.query('SELECT * FROM merchants WHERE email = $1', [email]);
        if(merchantResult.rows.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials.'});
        }

        const merchant = merchantResult.rows[0];

        //macth password
        const isMatch = await bcrypt.compare(password,merchant.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' })
        }  
        
        //create payload for token generattion
        const payload = {
            id: merchant.id,
            name: merchant.name,
            email: merchant.email,
        };

        //generate jwt
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });

        //send success message 
        res.status(200).json({
            message: 'Login successfull!',
            token: token,
        });

    }catch(err) {
        console.error(err);
        res.status(500).json({message: 'Server error during login.'})
    }
};

const getMerchantProfile = async(req,res) => {
    //the middleware alreadt has the profile of merchant no need to fetch again
    res.status(200).json(req.merchant);
}

const generateApiKeys = async (req, res) => {
    const merchantId = req.merchant.id;

    try {
        const publicKey = `pub_key_${cryptoRandomString({length: 24, type: 'alphanumeric'})}`;
        const secretKey = `sec_key_${cryptoRandomString({length: 48, type: 'alphanumeric'})}`;

        const salt = await bcrypt.genSalt(10);
        const secretKeyHash = await bcrypt.hash(secretKey, salt);

        const newKey = await pool.query(
            'INSERT INTO api_keys (merchant_id, public_key, secret_key_hash) VALUES ($1, $2, $3) RETURNING id, public_key',[merchantId, publicKey, secretKeyHash]
        );

        await pool.query(
            'UPDATE merchants SET active_api_key_id = $1 WHERE id = $2',
            [newKey.rows[0].id, merchantId]
        );

        res.status(201).json({
            message: 'API keys generated securely.Please save your keys securely.',
            publicKey: newKey.rows[0].public_key,
            secretKey: secretKey,
        }); 
    }catch(err) {
        console.error(err);
        res.status(500).json({message: 'Server error during API key generation.'});
    }
};

const configureWebhook = async (req, res) => {
    const merchantId = req.merchant.id;
    const { url } = req.body;

    if(!url) {
        return res.status(400).json({message: 'Webhook url is required.'})
    }
    const webhookSecret = `wbhsec_${cryptoRandomString({ length: 32, type: 'alphanumeric'})}`;

    try {
        await pool.query(
            'UPDATE merchants SET webhook_url = $1, webhook_secret = $2 WHERE id = $3',
            [url, webhookSecret, merchantId]
        );

        res.status(200).json({
            message: 'Webhook configured successfully. Please save your secret.',
            webhookSecret: webhookSecret,
        });
    }catch(err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error during webhook configuration.'})
    }
};

module.exports = {
    signupMerchant,
    loginMerchant,
    getMerchantProfile,
    generateApiKeys,
    configureWebhook,
} 

/* 
{
    "email": "test@shop.com",
    "password": "supersecretpassword123"
} 

{
    "message": "API keys generated securely.Please save your keys securely.",
    "publicKey": "pub_key_D8MqbUzmT1akv2FABSsDzDnz",
    "secretKey": "sec_key_5uFpsFsBzD5vbwJgjebw51YKV24w4D7oZi47RaKxaEsZy9V6"
}

{
    "amount": 50000,    
    "currency": "INR"
}

{
    "cardDetails": {
        "cardNumber": "4111222233334444",
        "expiry": "12/29",
        "cvv": "123"
    }
}

"webhookSecret": "wbhsec_vTaiB0HqmjbYB4GU9dLSoYy4R0WepfxM"
*/