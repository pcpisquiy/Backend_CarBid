// routes/register.js
const express = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { username, email, password, name } = req.body || {};
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'username, email y password son requeridos' });
    }
    if (String(username).length < 3) {
      return res.status(400).json({ error: 'El usuario debe tener al menos 3 caracteres' });
    }
    if (String(password).length < 8) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
    }

    // Unicidad de usuario y correo
    const existing = await User.findOne({
      where: { [Op.or]: [{ Usuario: username }, { Correo: email }] }
    });
    if (existing) {
      const field = existing.Usuario === username ? 'usuario' : 'correo';
      return res.status(409).json({ error: `Ya existe un ${field} con ese valor` });
    }

    const hash = await bcrypt.hash(password, 10);
    const u = await User.create({
      Usuario: username,
      Correo: email,
      Contrasena: hash,
      Activa: true,
      Fecha_Creacion: new Date()
    });

    res.status(201).json({
      id: u.Id_Usuario,
      email: u.Correo,
      name: name || u.Usuario,
      username: u.Usuario
    });
  } catch (e) {
    console.error('Register error:', e);
    res.status(500).json({ error: 'No se pudo registrar el usuario' });
  }
});

module.exports = router;
