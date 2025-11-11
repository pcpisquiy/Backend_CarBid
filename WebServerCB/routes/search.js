const express = require('express');
const router = express.Router();
const svc = require('../services/auctionService');

// GET /api/search/filters
router.get('/filters', async (req, res) => {
  try {
    const data = await svc.getFilters();
    res.json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'No se pudieron obtener filtros' });
  }
});

// GET /api/search/auctions
router.get('/auctions', async (req, res) => {
  try {
    const data = await svc.searchAuctions(req.query);
    res.json(data);
  } catch (e) {
    console.error('Search auctions error:', e);
    res.status(500).json({ error: 'No se pudieron obtener las subastas' });
  }
});

// GET /api/search/bids?auctionIds=1,2,3
router.get('/bids', async (req, res) => {
  try {
    const ids = (req.query.auctionIds || '')
      .split(',').map(s => parseInt(s,10)).filter(Boolean);
    const data = await svc.getBidsByAuctionIds(ids);
    res.json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'No se pudieron obtener pujas' });
  }
});

module.exports = router;
