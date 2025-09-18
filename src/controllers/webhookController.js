const pool = require('../config/db.js');
const axios = require('axios');
const crypto = require('crypto');

const sendWebhook = async (payment) => {

    try {
    //get merchant's webhook configuration
    const merchantResult = await pool.query(
        'SELECT webhook_url, webhook_secret FROM merchants WHERE id = $1', [payment.merchant_id]
    );
    const merchant = merchantResult.rows[0];
    
    //check if the configuration exits
    if(!merchant.webhook_url || !merchant.webhook_secret) {
        console.log(`Webhook not configured for ${payment.merchant_id}`);
        return;
    }

    //log the webhook attempt in our database
    const eventLog = await pool.query(
        'INSERT INTO webhook_events (merchant_id, payment_id) VALUES ($1, $2) RETURNING id',
        [payment.merchant_id, payment.id]
    );
    const eventId = eventLog.rows[0].id;

    //payload data to be sent 
    const payload = {
        event: 'payment.status.updated',
        data: {
            paymentId: payment.id,
            status: payment.status,
        }
    };

    // create signature based on webhook_url and payload
    const signature = crypto
        .createHmac('sha256', merchant.webhook_secret)
        .update(JSON.stringify(payload))
        .digest('hex');

    // send a axios request
    await axios.post(merchant.webhook_url, payload, {
        headers: {
            'x-payment-signature': signature
        }
    });

    // update the webhook event and mark it as sent and console it
    await pool.query(
        'UPDATE webhook_events SET status = $1, attempts = 1 WHERE id = $2', ['sent', eventId]
    );
    console.log(`Webhook sent successfully for payment ${payment.id}`);
    }catch(err) {
        console.error(`Failed to send webhook for payment ${payment.id}:`, err.message);
    }
};

module.exports = {
    sendWebhook,
}