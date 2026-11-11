const pool = require('../../config/db');

const findAll = async ({ sede } = {}) => {
  let query = `
    SELECT ac.*, a.nombre || ' ' || a.apellido_paterno AS alumno, a.dni
    FROM accesos ac
    JOIN alumnos a ON a.id = ac.id_alumno
    WHERE 1=1
  `;
  const params = [];
  if (sede) { params.push(sede); query += ` AND ac.sede = $${params.length}`; }
  query += ' ORDER BY ac.fecha_hora DESC LIMIT 200';
  const { rows } = await pool.query(query, params);
  return rows;
};

const findByAlumno = async (id_alumno) => {
  const { rows } = await pool.query(
    `SELECT * FROM accesos WHERE id_alumno = $1 ORDER BY fecha_hora DESC`,
    [id_alumno]
  );
  return rows;
};

const registrar = async ({ id_alumno, tipo, sede, resultado, observacion }) => {
  // Verificar si la matrícula está activa
  const matricula = await pool.query(
    `SELECT m.id, m.estado, m.fecha_vencimiento
     FROM matriculas m
     WHERE m.id_alumno = $1 AND m.activa = true
     LIMIT 1`,
    [id_alumno]
  );

  const matriculaActiva = matricula.rows[0];
  const resultadoFinal = resultado ?? (matriculaActiva?.estado === 'activa' ? 'permitido' : 'denegado');
  const obs = observacion ?? (resultadoFinal === 'permitido' ? 'Acceso habilitado' : 'Matrícula inactiva o vencida');

  const { rows } = await pool.query(
    `INSERT INTO accesos (id_alumno, tipo, sede, resultado, observacion, fecha_hora)
     VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *`,
    [id_alumno, tipo ?? 'ingreso', sede ?? 'Principal', resultadoFinal, obs]
  );
  return rows[0];
};

module.exports = { findAll, findByAlumno, registrar };
