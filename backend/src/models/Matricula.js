const pool = require('../../config/db');
const HttpError = require('../errors/HttpError');
const parseCuposMax = require('../utils/cupos');
const withTransaction = require('../utils/withTransaction');

const findAll = async () => {
  const { rows } = await pool.query(
    `SELECT m.*,
       a.nombre || ' ' || a.apellido_paterno AS alumno,
       d.nombre AS disciplina
     FROM matriculas m
     JOIN alumnos a ON a.id = m.id_alumno
     JOIN disciplinas d ON d.id = m.id_disciplina
     ORDER BY m.fecha_vencimiento ASC`
  );
  return rows;
};

const findById = async (id) => {
  const { rows } = await pool.query(
    `SELECT m.*, a.nombre || ' ' || a.apellido_paterno AS alumno, d.nombre AS disciplina
     FROM matriculas m
     JOIN alumnos a ON a.id = m.id_alumno
     JOIN disciplinas d ON d.id = m.id_disciplina
     WHERE m.id = $1`,
    [id]
  );
  return rows[0];
};

const findByAlumno = async (id_alumno) => {
  const { rows } = await pool.query(
    `SELECT m.*, d.nombre AS disciplina
     FROM matriculas m
     JOIN disciplinas d ON d.id = m.id_disciplina
     WHERE m.id_alumno = $1
     ORDER BY m.fecha_inicio DESC`,
    [id_alumno]
  );
  return rows;
};

const assertHasCapacity = async (client, id_disciplina, excludeMatriculaId) => {
  const { rows: disciplinas } = await client.query(
    'SELECT cupos_max FROM disciplinas WHERE id = $1 FOR UPDATE',
    [id_disciplina]
  );
  if (!disciplinas[0]) throw new HttpError(404, 'Disciplina no encontrada');

  const cuposMax = parseCuposMax(disciplinas[0].cupos_max);
  if (cuposMax === null) {
    throw new HttpError(500, 'La disciplina tiene un aforo inválido');
  }

  const countQuery = excludeMatriculaId === undefined
    ? `SELECT COUNT(*)::int AS total
       FROM matriculas
       WHERE id_disciplina = $1 AND estado = 'activa' AND activa = TRUE`
    : `SELECT COUNT(*)::int AS total
       FROM matriculas
       WHERE id_disciplina = $1 AND estado = 'activa' AND activa = TRUE AND id <> $2`;
  const params = excludeMatriculaId === undefined
    ? [id_disciplina]
    : [id_disciplina, excludeMatriculaId];
  const { rows: inscritos } = await client.query(countQuery, params);

  if (Number(inscritos[0].total) >= cuposMax) {
    throw new HttpError(409, 'La disciplina no tiene cupos disponibles');
  }
};

const create = async ({ id_alumno, id_disciplina, periodo_meses, precio_total }) => {
  const fecha_inicio = new Date();
  const fecha_vencimiento = new Date();
  fecha_vencimiento.setMonth(fecha_vencimiento.getMonth() + parseInt(periodo_meses));

  return withTransaction(async (client) => {
    await assertHasCapacity(client, id_disciplina);

    const { rows } = await client.query(
      `INSERT INTO matriculas (id_alumno, id_disciplina, fecha_inicio, fecha_vencimiento, periodo_meses, precio_total, estado, activa)
       VALUES ($1,$2,$3,$4,$5,$6,'activa',true) RETURNING *`,
      [id_alumno, id_disciplina, fecha_inicio, fecha_vencimiento, periodo_meses, precio_total]
    );
    return rows[0];
  });
};

const update = async (id, campos) => {
  const { estado, fecha_vencimiento, activa } = campos;

  return withTransaction(async (client) => {
    const { rows: matriculas } = await client.query(
      'SELECT * FROM matriculas WHERE id = $1 FOR UPDATE',
      [id]
    );
    const matricula = matriculas[0];
    if (!matricula) return undefined;

    const nuevoEstado = estado === undefined ? matricula.estado : estado;
    let estadoSolicitaActiva;
    if (activa !== undefined) {
      estadoSolicitaActiva = activa === true || activa === 'true';
    } else if (estado !== undefined) {
      estadoSolicitaActiva = nuevoEstado === 'activa';
    } else {
      estadoSolicitaActiva = matricula.activa;
    }
    const nuevaActiva = nuevoEstado === 'activa' && estadoSolicitaActiva;

    if (nuevaActiva) {
      await assertHasCapacity(client, matricula.id_disciplina, id);
    }

    const { rows } = await client.query(
      `UPDATE matriculas SET estado=$1, fecha_vencimiento=$2, activa=$3 WHERE id=$4 RETURNING *`,
      [nuevoEstado, fecha_vencimiento === undefined ? matricula.fecha_vencimiento : fecha_vencimiento, nuevaActiva, id]
    );
    return rows[0];
  });
};

const deleteMatricula = async (id) => {
  await pool.query('DELETE FROM matriculas WHERE id = $1', [id]);
};

module.exports = { findAll, findById, findByAlumno, create, update, delete: deleteMatricula };
