const pool = require('../config/db.js');
const bcrypt = require('bcrypt');

const apiKeyAuth = async (req, res, next) => {

    const publicKey = req.headers['x-public-key'];
    const secretKey = req.headers['x-secret-key'];

    if(!publicKey || !secretKey) {
        return res.status(401).json({message: 'API key is required.'});
    }

    try {
        const keyResult = await pool.query('SELECT * FROM api_keys WHERE public_key = $1',[publicKey]);
        if(keyResult.rows[0] === 0) {
            return res.status(401).json({ message: 'Invalid API key.' });
        }
        const apiKeyData = keyResult.rows[0];

        const isMatch = await bcrypt.compare(secretKey, apiKeyData.secret_key_hash);
        if(!isMatch) {
            return res.status(401).json({ message: 'Invalid API key.' });
        }

        req.merchantId = apiKeyData.merchant_id;
        next();
    }catch(err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error during API key authentication.'})
    }
};

module.exports = {
    apiKeyAuth, 

}