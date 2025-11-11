// routes/login.js
const express = require('express');
const { signToken } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { usuario, email, password } = req.body || {};
    console.log(req.body);
    if (!password || (!usuario && !email)) {
      return res.status(400).json({ error: 'usuario/email y password son requeridos' });
    }
    const where = email ? { Correo: email } : { Usuario: usuario };
    const u = await User.findOne({ where });
    if (!u) return res.status(401).json({ error: 'Credenciales inválidas' });

    let ok = false;
    try {
      const passDb = String(u.Contrasena || '');
      if (passDb.startsWith('$2')) {
        const bcrypt = require('bcrypt');
        ok = await bcrypt.compare(password, passDb);
      } else {
        ok = password === passDb;
      }
    } catch { ok = false; }

    if (!ok) return res.status(401).json({ error: 'Credenciales inválidas' });

    const token = signToken({ id: u.Id_Usuario, email: u.Correo, name: u.Usuario });
    res.json({ token, user: { id: u.Id_Usuario, email: u.Correo, name: u.Usuario } });
  } catch (e) {
    console.error('Login error:', e);
    res.status(500).json({ error: 'No se pudo iniciar sesión' });
  }
});

module.exports = router;
