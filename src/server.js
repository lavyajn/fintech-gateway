const express = require ('express');
const dotenv = require ('dotenv');
const pool = require ('./config/db.js');

dotenv.config();

const app = express();
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

const startServer = async () => {

    await testDbConnection();

    app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});
}

startServer();


