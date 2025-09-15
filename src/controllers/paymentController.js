const pool = require('../config/db.js');

const initiatePayment = async (req, res) => {

    const merchantId = req.merchant.id;
    const { amount, currency } = req.body;

    //basic validation
    if(!amount || !currency) {
        return res.status(400).json({message: 'Amount and currency are required.'});
    }

    //check for valid amount
    if(typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({message: 'Invalid Amount'});
    }

    try {
        const newPayment = await pool.query(
            'INSERT INTO payments (merchant_id, amount, currency) VALUES ($1, $2, $3) RETURNING id, status, created_at',
            [merchantId, amount, currency]
        );

        res.status(201).json({
            message: 'Payment initiated suceessfully',
            payment: newPayment.rows[0],
        });
    }catch(err) {
        console.error(err);
        res.status(500).json({message: 'Server error during payment.'})
    }
};

module.exports = {
    initiatePayment,
}