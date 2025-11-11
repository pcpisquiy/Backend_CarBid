// routes/login.js
const express = require('express');
const bcrypt = require('bcrypt');
const { signToken } = require('../middleware/auth');
const User = require('../models/User'); // ajusta el path si cambia

const router = express.Router();

// POST /api/login
router.post('/login', async (req, res) => {
  try {
    const { email, password, usuario } = req.body; // según lo que envíes
    const where = email ? { Correo: email } : { Usuario: usuario };
    const u = await User.findOne({ where });
    if (!u) return res.status(401).json({ error: 'Credenciales inválidas' });

    const ok = await bcrypt.compare(password, u.Contrasena);
    if (!ok) return res.status(401).json({ error: 'Credenciales inválidas' });

    const token = signToken({ id: u.Id_Usuario, email: u.Correo, name: u.Usuario });
    res.json({ token, user: { id: u.Id_Usuario, email: u.Correo, name: u.Usuario } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'No se pudo iniciar sesión' });
  }
});

module.exports = router;
