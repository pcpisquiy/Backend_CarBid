// routes/bids.js
const express = require('express');
const { authRequired } = require('../middleware/auth');
const svc = require('../services/bidService'); // si ya creaste la capa service

const router = express.Router();

// GET detalle
router.get('/auctions/:id', async (req, res) => {
  try {
    const data = await svc.getAuctionDetail(Number(req.params.id));
    if (!data) return res.status(404).json({ error: 'Subasta no existe' });
    res.json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'No se pudo obtener la subasta' });
  }
});

// GET pujas
router.get('/auctions/:id/bids', async (req, res) => {
  try {
    const data = await svc.getBids(Number(req.params.id), 200);
    res.json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'No se pudieron obtener las pujas' });
  }
});

// POST puja
router.post('/auctions/:id/bids', authRequired, async (req, res) => {
  try {
    const auctionId = Number(req.params.id);
    const userId = req.user.id;
    const { amount } = req.body;

    const bid = await svc.placeBid({ auctionId, userId, amount });

    // emitir por socket
    const io = req.app.locals.io;
    if (io) io.to(`auction_${auctionId}`).emit('bid:new', bid);

    res.status(201).json(bid);
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: e.message || 'No se pudo registrar la puja' });
  }
});

module.exports = router;
