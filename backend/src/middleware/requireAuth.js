const jwt = require('jsonwebtoken');

const JWT_ISSUER = 'forca-fitness-api';
const JWT_AUDIENCE = 'forca-fitness-app';
const VALID_ROLES = new Set(['admin', 'tesorero', 'recepcion', 'instructor', 'alumno']);

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret || Buffer.byteLength(secret) < 32) {
    throw new Error('JWT_SECRET debe tener al menos 32 bytes');
  }
  return secret;
};

const createRequireAuth = (secretProvider = getJwtSecret) => (req, res, next) => {
  const authorization = req.get('authorization') || '';
  const match = authorization.match(/^Bearer ([^\s]+)$/i);

  if (!match) {
    return res.status(401).json({ error: 'Autenticación requerida' });
  }

  try {
    const payload = jwt.verify(match[1], secretProvider(), {
      algorithms: ['HS256'],
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE
    });
    const id = Number(payload.sub);

    if (!Number.isSafeInteger(id) || id < 1 || !VALID_ROLES.has(payload.rol)) {
      return res.status(401).json({ error: 'Token inválido o expirado' });
    }

    req.user = {
      id,
      email: payload.email,
      rol: payload.rol,
      alumno_id: payload.alumnoId || null
    };
    return next();
  } catch (err) {
    if (err.message === 'JWT_SECRET debe tener al menos 32 bytes') {
      console.error('Configuración JWT inválida:', err.message);
      return res.status(500).json({ error: 'Autenticación no configurada correctamente' });
    }
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

module.exports = createRequireAuth();
module.exports.createRequireAuth = createRequireAuth;
