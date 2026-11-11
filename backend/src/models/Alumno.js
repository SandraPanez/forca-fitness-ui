const pool = require('../../config/db');

const findAll = async ({ estado, disciplina, search } = {}) => {
  let query = `
    SELECT
      a.id,
      a.nombre,
      a.apellido_paterno,
      a.apellido_materno,
      a.dni,
      a.email,
      a.telefono,
      a.fecha_nacimiento,
      a.fecha_inscripcion,
      a.sede,
      d.nombre AS disciplina,
      m.estado AS estado_matricula,
      m.fecha_vencimiento
    FROM alumnos a
    LEFT JOIN matriculas m ON m.id_alumno = a.id AND m.activa = true
    LEFT JOIN disciplinas d ON d.id = m.id_disciplina
    WHERE 1=1
  `;
  const params = [];

  if (estado) {
    params.push(estado);
    query += ` AND m.estado = $${params.length}`;
  }
  if (disciplina) {
    params.push(`%${disciplina}%`);
    query += ` AND d.nombre ILIKE $${params.length}`;
  }
  if (search) {
    params.push(`%${search}%`);
    query += ` AND (a.nombre ILIKE $${params.length} OR a.apellido_paterno ILIKE $${params.length} OR a.dni ILIKE $${params.length})`;
  }

  query += ' ORDER BY a.apellido_paterno, a.nombre';
  const { rows } = await pool.query(query, params);
  return rows;
};

const findById = async (id) => {
  const { rows } = await pool.query(
    `SELECT a.*, d.nombre AS disciplina, m.estado AS estado_matricula, m.fecha_vencimiento
     FROM alumnos a
     LEFT JOIN matriculas m ON m.id_alumno = a.id AND m.activa = true
     LEFT JOIN disciplinas d ON d.id = m.id_disciplina
     WHERE a.id = $1`,
    [id]
  );
  return rows[0];
};

const create = async ({ nombre, apellido_paterno, apellido_materno, dni, email, telefono, fecha_nacimiento, sede }) => {
  const { rows } = await pool.query(
    `INSERT INTO alumnos (nombre, apellido_paterno, apellido_materno, dni, email, telefono, fecha_nacimiento, sede, fecha_inscripcion)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_DATE)
     RETURNING *`,
    [nombre, apellido_paterno, apellido_materno, dni, email, telefono, fecha_nacimiento, sede]
  );
  return rows[0];
};

const update = async (id, campos) => {
  const { nombre, apellido_paterno, apellido_materno, email, telefono, sede } = campos;
  const { rows } = await pool.query(
    `UPDATE alumnos
     SET nombre=$1, apellido_paterno=$2, apellido_materno=$3, email=$4, telefono=$5, sede=$6
     WHERE id=$7
     RETURNING *`,
    [nombre, apellido_paterno, apellido_materno, email, telefono, sede, id]
  );
  return rows[0];
};

const deleteAlumno = async (id) => {
  await pool.query('DELETE FROM alumnos WHERE id = $1', [id]);
};

module.exports = { findAll, findById, create, update, delete: deleteAlumno };
