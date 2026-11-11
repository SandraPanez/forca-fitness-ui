const pool = require('../../config/db');

const findAll = async () => {
  const { rows } = await pool.query(
    `SELECT d.*,
       COUNT(m.id) AS total_matriculados,
       d.cupos_max - COUNT(m.id) AS cupos_disponibles
     FROM disciplinas d
     LEFT JOIN matriculas m ON m.id_disciplina = d.id AND m.estado = 'activa'
     GROUP BY d.id
     ORDER BY d.nombre`
  );
  return rows;
};

const findById = async (id) => {
  const { rows } = await pool.query('SELECT * FROM disciplinas WHERE id = $1', [id]);
  return rows[0];
};

const create = async ({ nombre, descripcion, profesor, horario, sede, cupos_max, precio_mensual }) => {
  const { rows } = await pool.query(
    `INSERT INTO disciplinas (nombre, descripcion, profesor, horario, sede, cupos_max, precio_mensual)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [nombre, descripcion, profesor, horario, sede, cupos_max, precio_mensual]
  );
  return rows[0];
};

const update = async (id, campos) => {
  const { nombre, descripcion, profesor, horario, sede, cupos_max, precio_mensual } = campos;
  const { rows } = await pool.query(
    `UPDATE disciplinas SET nombre=$1, descripcion=$2, profesor=$3, horario=$4, sede=$5, cupos_max=$6, precio_mensual=$7
     WHERE id=$8 RETURNING *`,
    [nombre, descripcion, profesor, horario, sede, cupos_max, precio_mensual, id]
  );
  return rows[0];
};

const deleteDisciplina = async (id) => {
  await pool.query('DELETE FROM disciplinas WHERE id = $1', [id]);
};

module.exports = { findAll, findById, create, update, delete: deleteDisciplina };
