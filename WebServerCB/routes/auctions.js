// routes/auctions.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const { authRequired } = require('../middleware/auth');
const upload = require('../middleware/upload');

const Auction = require('../models/Auction');
const Photo   = require('../models/Photo');

const router = express.Router();

// debug line — useful while fixing the error you saw
console.log('MW check:', { authRequired: typeof authRequired, upload: typeof upload });

router.post(
  '/',
  authRequired,                  // MUST be a function
  upload.array('images', 8),     // MUST be a function (.array) from multer
  [
    body('title').trim().notEmpty(),
    body('brand').trim().notEmpty(),
    body('model').trim().notEmpty(),
    body('year').isInt({ min: 1900 }),
    body('km').optional().isInt({ min: 0 }),
    body('transmission').trim().notEmpty(),
    body('base_price').isFloat({ min: 0 }),
    body('start_at').isISO8601(),
    body('end_at').isISO8601(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    try {
      const {
        title, brand, model, year, km = 0, transmission,
        base_price, start_at, end_at, description = ''
      } = req.body;

      // Mapea a tu esquema real
      const a = await Auction.create({
        Titulo: title,
        Id_Modelo: Number(model),                // OJO: si envías model_id, ajústalo
        Kilometraje: Number(km || 0),
        Id_Transmision: Number(transmission),    // si envías id, no texto
        Precio_Inicial: Number(base_price),
        Fecha_Inicio: new Date(start_at),
        Fecha_Fin: new Date(end_at),
        Id_Estado: 1,
        Usuario_Grabacion: req.user.id
      });

      const baseUrl = (process.env.BASE_URL || '').replace(/\/$/, '');
      const files = req.files || [];

      await Promise.all(
        files.map((f, i) =>
          Photo.create({
            Id_Publicacion: a.Id,
            Url: `${baseUrl}/uploads/${f.filename}`,
            Orden: i
          })
        )
      );

      res.status(201).json({ id: a.Id });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'No se pudo crear la publicación' });
    }
  }
);

module.exports = router;
