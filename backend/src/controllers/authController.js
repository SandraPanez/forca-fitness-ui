const pool = require('../../config/db');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      'SELECT * FROM usuarios WHERE email = $1',
      [email]
    );

    const usuario = result.rows[0];
    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // En producción usarías bcrypt para comparar passwords
    // Por ahora comparación directa (solo para demo)
    if (usuario.password !== password) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    res.json({
      mensaje: 'Login exitoso',
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const logout = (req, res) => {
  res.json({ mensaje: 'Sesión cerrada' });
};

module.exports = { login, logout };
