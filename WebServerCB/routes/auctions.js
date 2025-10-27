// routes/auctions.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const { requireAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const Auction = require('../models/Auction');
const Photo = require('../models/Photo');

const router = express.Router();

const createValidators = [
  body('title').trim().notEmpty(),
  body('brand').trim().notEmpty(),
  body('model').trim().notEmpty(),
  body('year').isInt({ min: 1980, max: new Date().getFullYear() + 1 }),
  body('km').optional().isInt({ min: 0 }),
  body('transmission').isIn(['Automática','Manual','CVT']),
  body('base_price').isInt({ min: 100 }),
  body('start_at').isISO8601(),
  body('end_at').isISO8601()
];

router.post(
  '/',
  requireAuth,
  upload.array('images', 8),
  createValidators,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const {
      title, brand, model, year, km = 0, transmission,
      base_price, start_at, end_at, description = ''
    } = req.body;

    const start = new Date(start_at);
    const end = new Date(end_at);
    if (!(start < end)) return res.status(400).json({ error: 'Rango de fechas inválido' });

    try {
      const auction = await Auction.create({
        seller_id: req.user.id,
        title, brand, model,
        year: Number(year),
        km: Number(km || 0),
        transmission,
        base_price: Number(base_price),
        start_at: start,
        end_at: end,
        description,
        status: Date.now() >= start.getTime() ? 'active' : 'scheduled',
        highest_bid: 0
      });

      // guardar fotos
      const baseUrl = process.env.BASE_URL?.replace(/\/$/, '') || '';
      const files = req.files || [];
      await Promise.all(
        files.map((f, i) =>
          Photo.create({
            auction_id: auction.id,
            url: `${baseUrl}/uploads/${f.filename}`,
            order: i
          })
        )
      );

      const created = await Auction.findByPk(auction.id, { include: { model: Photo } });
      res.status(201).json(created);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'No se pudo crear la subasta' });
    }
  }
);

module.exports = router;
