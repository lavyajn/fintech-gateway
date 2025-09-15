const express = require ('express');
const dotenv = require ('dotenv');
const pool = require ('./config/db.js');
const merchantRoutes = require('./routes/merchantRoutes.js');
const paymentRoutes = require('./routes/paymentRoutes.js');

dotenv.config();

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;


const testDbConnection = async () => {
    try {
        const client = await pool.connect();
        console.log('Connected to PostgreSQl database.');
        const time = await client.query('SELECT NOW()');
        console.log('Current time from DB:', time.rows[0].now);
        client.release();
    }catch(err) {
        console.error('Server Connection failed!', err);
        process.exit(1);
    }
};

app.get('/', (req,res) => {
    res.send('Payment Gateway is alive!');
});

app.use('/api/v1/merchants', merchantRoutes);
app.use('/api/v1/payments', paymentRoutes);

const startServer = async () => {

    await testDbConnection();

    app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});
}

startServer();


