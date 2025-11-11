// app.js
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({ origin: '*', methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'], allowedHeaders: ['Content-Type','Authorization'] }));
app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Registra asociaciones del ER
require('./models');

app.use('/api', require('./routes/login'));
app.use('/api', require('./routes/register'));
app.use('/api/auctions', require('./routes/auctions'));
app.use('/api/bids', require('./routes/bids'));
app.use('/api/search', require('./routes/search'));

app.get('/', (_req, res) => res.send('OK'));
module.exports = app;
