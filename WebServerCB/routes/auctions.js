// routes/auctions.js
const express = require('express');
const router = express.Router();
const { createAuction, getAuctionById } = require('../controllers/auctionController');
const upload = require('../middleware/upload');
const { authRequired } = require('../middleware/auth');

router.post('/', /*authRequired,*/ upload.array('images', 8), createAuction);
router.get('/:id', getAuctionById);

module.exports = router;
