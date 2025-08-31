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

module.exports = {
    signupMerchant,
}