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
        // using placeholder ($1,$2) and parameters instead of direct data to avoid SQL Injection.
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

const processPayment = async (req, res) => {

    const { paymentId } = req.params;
    const { cardDetails } = req.body;

     try {
        // checking whether the payment was ever initiated or not
        const paymentResult = await pool.query('SELECT * FROM payments  WHERE id = $1', [paymentId]);
        if(paymentResult.rows[0].length === 0) {
            return res.status(404).json({ message: 'Payment not found.'});
        }
        const payment = paymentResult.rows[0];
        
        //checking payment status
        if(payment.status !== 'pending') {
            return res.status(400).json({ message: 'Payment is already ${payment.status}'});
        }
        
        // processing payment
        let newStatus = 'failed';
        if(cardDetails && cardDetails.cardNumber.startsWith('4')) {
            newStatus = 'successfull';
        }
        
        // updating paymnet status with respect to the id
        const updatePayment = await pool.query(
            'UPDATE payments SET status = $1 WHERE id = $2 RETURNING id, status',
            [newStatus, paymentId]
        );

        res.status(200).json({
            message: `Payment ${newStatus}`,
            payment: updatePayment.rows[0],
        });
     }catch(err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error during payment processing.'});
     }
};

module.exports = {
    initiatePayment,
    processPayment,
}