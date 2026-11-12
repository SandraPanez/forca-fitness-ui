const pool = require('../../config/db');
const HttpError = require('../errors/HttpError');
const parseCuposMax = require('../utils/cupos');
const withTransaction = require('../utils/withTransaction');

const findAll = async () => {
  const { rows } = await pool.query(
    `SELECT d.*,
       COUNT(m.id) AS total_matriculados,
       d.cupos_max - COUNT(m.id) AS cupos_disponibles
     FROM disciplinas d
     LEFT JOIN matriculas m ON m.id_disciplina = d.id AND m.estado = 'activa' AND m.activa = TRUE
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
  const cuposMax = parseCuposMax(cupos_max === undefined ? 20 : cupos_max);
  if (cuposMax === null) {
    throw new HttpError(400, 'El aforo debe ser un número entero mayor o igual a cero');
  }

  const { rows } = await pool.query(
    `INSERT INTO disciplinas (nombre, descripcion, profesor, horario, sede, cupos_max, precio_mensual)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [nombre, descripcion, profesor, horario, sede, cuposMax, precio_mensual]
  );
  return rows[0];
};

const update = async (id, campos) => {
  const { nombre, descripcion, profesor, horario, sede, cupos_max, precio_mensual } = campos;

  return withTransaction(async (client) => {
    const { rows: disciplinas } = await client.query(
      'SELECT cupos_max FROM disciplinas WHERE id = $1 FOR UPDATE',
      [id]
    );
    if (!disciplinas[0]) return undefined;

    const cuposMax = parseCuposMax(cupos_max === undefined ? disciplinas[0].cupos_max : cupos_max);
    if (cuposMax === null) {
      throw new HttpError(400, 'El aforo debe ser un número entero mayor o igual a cero');
    }

    const { rows: inscritos } = await client.query(
      `SELECT COUNT(*)::int AS total
       FROM matriculas
       WHERE id_disciplina = $1 AND estado = 'activa' AND activa = TRUE`,
      [id]
    );
    if (cuposMax < Number(inscritos[0].total)) {
      throw new HttpError(409, 'El aforo no puede ser menor que las matrículas activas');
    }

    const { rows } = await client.query(
      `UPDATE disciplinas SET nombre=$1, descripcion=$2, profesor=$3, horario=$4, sede=$5, cupos_max=$6, precio_mensual=$7
       WHERE id=$8 RETURNING *`,
      [nombre, descripcion, profesor, horario, sede, cuposMax, precio_mensual, id]
    );
    return rows[0];
  });
};

const deleteDisciplina = async (id) => {
  await pool.query('DELETE FROM disciplinas WHERE id = $1', [id]);
};

module.exports = { findAll, findById, create, update, delete: deleteDisciplina };
