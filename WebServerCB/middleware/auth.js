// middleware/auth.js (idea general)
const jwt = require('jsonwebtoken');
<<<<<<< Updated upstream
module.exports.requireAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
=======
import jwt from 'jsonwebtoken';
function authRequired(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'No token' });
>>>>>>> Stashed changes
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido' });
  }
<<<<<<< Updated upstream
};
=======
}


export function signToken(payload, options = {}) {
  return jwt.sign(payload,  process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES, ...options });
}

export function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const [type, token] = header.split(' ');
  if (type !== 'Bearer' || !token) return res.status(401).json({ error: 'Token requerido' });

  try {
    req.user = jwt.verify(token, config.jwt.secret); // { Id_Usuario, Usuario, Correo }
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}


module.exports = { authRequired, signToken, authMiddleware };
>>>>>>> Stashed changes
