// middleware/requireAuthExcept.js
// Exige Bearer token para todas las rutas que NO estén en la lista de exclusión.
// Usa el mismo secreto y verificación que tu middleware/auth.js (jwt).

const jwt = require('jsonwebtoken');

function pathStartsWith(pathname, starts) {
  return pathname === starts || pathname.startsWith(starts + '/');
}

module.exports = function requireAuthExcept(excluded = ['/api/login', '/api/register']) {
  return function (req, res, next) {
    try {
      const path = req.path || req.originalUrl || '';
      // Permitir rutas excluidas
      if (excluded.some(x => pathStartsWith(path, x))) return next();

      const h = req.headers.authorization || '';
      const [type, token] = h.split(' ');
      if (type !== 'Bearer' || !token) return res.status(401).json({ error: 'Missing token' });

      // Verificar y adjuntar al req
      req.user = jwt.verify(token, process.env.JWT_SECRET);
      return next();
    } catch (e) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
};
