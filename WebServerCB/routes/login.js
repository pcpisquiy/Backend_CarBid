var express = require('express');
var router = express.Router();
import bcrypt from 'bcrypt';
import  Usuario  from '../db/sequelize.js';
import { authRequired,authMiddleware,signToken } from '../middleware/auth.js';
app.post('/login', async (req, res) => {
  try {
    const login = (req.body.login || '').toString().trim();
    const password = (req.body.password || '').toString();nom

    if (!login || !password) {
      return res.status(400).json({ error: 'login y password son obligatorios' });
    }

    // Como tu collation es utf8mb4_unicode_ci, la comparación ya es case-insensitive
    const u = await Usuario.findOne({
      where: { [Op.or]: [{ Usuario: login }, { Correo: login }] }
    });

    if (!u || !u.Activa) {
      return res.status(401).json({ ok: false, message: 'Credenciales inválidas' });
    }

    // Si Contrasena almacena hash bcrypt:
    let ok = false;
    if (u.Contrasena && u.Contrasena.startsWith('$2')) {
      ok = await bcrypt.compare(password, u.Contrasena);
    } else {
      // Fallback opcional si aún tienes contraseñas en texto plano (no recomendado):
      ok = (password === u.Contrasena);
    }

    if (!ok) return res.status(401).json({ ok: false, message: 'Credenciales inválidas' });

    const token = signToken({ Id_Usuario: u.Id_Usuario, Usuario: u.Usuario, Correo: u.Correo });
    const { Contrasena, ...safe } = u.toJSON();
    return res.json({ ok: true, user: safe, token });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
module.exports = router;
