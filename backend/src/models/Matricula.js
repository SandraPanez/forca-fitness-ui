const pool = require('../../config/db');

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

const create = async ({ id_alumno, id_disciplina, periodo_meses, precio_total }) => {
  const fecha_inicio = new Date();
  const fecha_vencimiento = new Date();
  fecha_vencimiento.setMonth(fecha_vencimiento.getMonth() + parseInt(periodo_meses));

  const { rows } = await pool.query(
    `INSERT INTO matriculas (id_alumno, id_disciplina, fecha_inicio, fecha_vencimiento, periodo_meses, precio_total, estado, activa)
     VALUES ($1,$2,$3,$4,$5,$6,'activa',true) RETURNING *`,
    [id_alumno, id_disciplina, fecha_inicio, fecha_vencimiento, periodo_meses, precio_total]
  );
  return rows[0];
};

const update = async (id, campos) => {
  const { estado, fecha_vencimiento, activa } = campos;
  const { rows } = await pool.query(
    `UPDATE matriculas SET estado=$1, fecha_vencimiento=$2, activa=$3 WHERE id=$4 RETURNING *`,
    [estado, fecha_vencimiento, activa, id]
  );
  return rows[0];
};

const deleteMatricula = async (id) => {
  await pool.query('DELETE FROM matriculas WHERE id = $1', [id]);
};

module.exports = { findAll, findById, findByAlumno, create, update, delete: deleteMatricula };
