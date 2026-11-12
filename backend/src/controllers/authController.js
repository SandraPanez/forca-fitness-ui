const pool = require('../../config/db');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario + datos de alumno/matrícula en un solo query
    const result = await pool.query(`
      SELECT
        u.id,
        u.nombre,
        u.email,
        u.rol,
        u.password,
        a.id            AS id_alumno,
        a.apellido_paterno,
        a.apellido_materno,
        a.dni,
        a.telefono,
        a.foto_url,
        m.id            AS id_matricula,
        m.estado        AS estado_matricula,
        m.fecha_inicio  AS fecha_inicio_membresia,
        m.fecha_vencimiento AS fecha_fin_membresia,
        d.nombre        AS disciplina
      FROM usuarios u
      LEFT JOIN alumnos a      ON a.email = u.email
      LEFT JOIN matriculas m   ON m.id_alumno = a.id AND m.activa = true
      LEFT JOIN disciplinas d  ON d.id = m.id_disciplina
      WHERE u.email = $1
    `, [email]);

    const row = result.rows[0];
    if (!row) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    if (row.password !== password) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Construir nombre completo si tiene datos de alumno
    var nombreCompleto = row.nombre;
    if (row.apellido_paterno) {
      nombreCompleto = row.nombre + ' ' + row.apellido_paterno;
      if (row.apellido_materno) nombreCompleto += ' ' + row.apellido_materno;
    }

    res.json({
      mensaje: 'Login exitoso',
      usuario: {
        id:                    row.id,
        nombre:                nombreCompleto,
        email:                 row.email,
        rol:                   row.rol,
        id_alumno:             row.id_alumno    || null,
        dni:                   row.dni          || null,
        telefono:              row.telefono     || null,
        foto_url:              row.foto_url     || null,
        id_matricula:          row.id_matricula || null,
        estado_matricula:      row.estado_matricula   || null,
        fecha_inicio_membresia: row.fecha_inicio_membresia || null,
        fecha_fin_membresia:   row.fecha_fin_membresia  || null,
        disciplina:            row.disciplina   || null,
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
