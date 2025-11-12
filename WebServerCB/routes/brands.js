// routes/brands.js
const express = require('express');
const router = express.Router();
const { Brand, ModelCar } = require('../models');

router.get('/', async (_req, res) => {
  try {
    const rows = await Brand.findAll({
      where: { Activo: true },
      order: [['Descripcion','ASC']],
      attributes: ['Id','Descripcion']
    });
    res.json(rows);
  } catch (e) {
    console.error('brands list error:', e);
    res.status(500).json({ error: 'No se pudieron obtener las marcas' });
  }
});

router.get('/:id/models', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: 'Id de marca inválido' });

    const rows = await ModelCar.findAll({
      where: { Id_Marca: id, Activo: true },
      order: [['Descripcion','ASC']],
      attributes: ['Id','Descripcion','Anio','Id_Marca']
    });
    res.json(rows);
  } catch (e) {
    console.error('brand models error:', e);
    res.status(500).json({ error: 'No se pudieron obtener los modelos' });
  }
});

module.exports = router;
