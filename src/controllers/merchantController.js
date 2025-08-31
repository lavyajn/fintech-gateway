const jwt = require('jsonwebtoken');
const pool = require('../config/db.js');
const bcrypt = require('bcrypt');

const signupMerchant = async (req,res) => {
    try {
        //Validation
        const {name, email, password} = req.body;

        //Checking for already existing user
        if(!name || !password || !email)
            return res.status(400).json({message: 'All fields are required'});

        const merchantExists = await pool.query('SELECT * FROM merchants WHERE email = $1', [email]);
        if(merchantExists.rows.length > 0) {
            return res.status(409).json({message: 'Email already in use.'});
        }

        //Generate hashed password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        //Inserting new user into the database
        const newMerchant = await pool.query(
            'INSERT INTO merchants (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, created_at',
            [name,email,passwordHash]
        );
        
        //Sending success response
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

module.exports = {
    signupMerchant,
    loginMerchant,
}