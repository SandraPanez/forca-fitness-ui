const pool = require('../../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_ISSUER = 'forca-fitness-api';
const JWT_AUDIENCE = 'forca-fitness-app';
const TOKEN_EXPIRY = '1h';

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret || Buffer.byteLength(secret) < 32) {
    throw new Error('JWT_SECRET debe tener al menos 32 bytes');
  }
  return secret;
};

const createAuthController = (database, configuration = {}) => {
  const secretProvider = configuration.getSecret || getJwtSecret;

  const login = async (req, res) => {
    try {
      const body = req.body || {};
      const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
      const password = typeof body.password === 'string' ? body.password : '';

      if (!email || !password) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      const secret = secretProvider();
      const result = await database.query(
        `SELECT id, nombre, email, password_hash, rol, alumno_id, activo
         FROM usuarios
         WHERE LOWER(email) = $1
         LIMIT 1`,
        [email]
      );

      const usuario = result.rows[0];
      const passwordValida = usuario?.password_hash
        ? await bcrypt.compare(password, usuario.password_hash)
        : false;

      if (!usuario || !usuario.activo || !passwordValida) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      const token = jwt.sign(
        {
          email: usuario.email,
          rol: usuario.rol,
          alumnoId: usuario.alumno_id
        },
        secret,
        {
          algorithm: 'HS256',
          subject: String(usuario.id),
          issuer: JWT_ISSUER,
          audience: JWT_AUDIENCE,
          expiresIn: TOKEN_EXPIRY
        }
      );

      return res.json({
        mensaje: 'Login exitoso',
        token,
        usuario: {
          id: usuario.id,
          nombre: usuario.nombre,
          email: usuario.email,
          rol: usuario.rol,
          alumno_id: usuario.alumno_id
        }
      });
    } catch (err) {
      if (err.message === 'JWT_SECRET debe tener al menos 32 bytes') {
        return res.status(500).json({ error: 'Autenticación no configurada correctamente' });
      }
      console.error('Error al iniciar sesión:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  };

  const me = (req, res) => res.json({ usuario: req.user });
  const logout = (req, res) => res.json({ mensaje: 'Sesión cerrada' });

  return { login, logout, me };
};

module.exports = { ...createAuthController(pool), createAuthController, JWT_ISSUER, JWT_AUDIENCE };
