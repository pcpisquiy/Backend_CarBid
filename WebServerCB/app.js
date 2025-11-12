// app.js
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({ origin: '*', credentials: false }));
app.options('*', cors({ origin: '*', credentials: false }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(process.env.UPLOAD_DIR || 'uploads'));

// Registra asociaciones del ER
require('./models');

// app.use('/api', require('./routes/login'));
// app.use('/api', require('./routes/register'));
// app.use('/api/auctions', require('./routes/auctions'));
// app.use('/api/bids', require('./routes/bids'));
// app.use('/api/search', require('./routes/search'));
// públicas
app.use('/api', require('./routes/login'));
app.use('/api', require('./routes/register')); // si aplica

// guardián global
const requireAuthExcept = require('./middleware/requireAuthExcept');
app.use(requireAuthExcept(['/api/login','/api/register']));

// protegidas
app.use('/api/bids', require('./routes/bids'));
app.use('/api/search', require('./routes/search'));
app.use('/api/brands', require('./routes/brands'));
app.use('/api/auctions', require('./routes/auctions'));

app.get('/', (_req, res) => res.send('OK'));
module.exports = app;
