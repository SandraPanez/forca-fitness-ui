const pool = require('../../config/db');

const findAll = async ({ estado, medio } = {}) => {
  let query = `
    SELECT p.*,
      a.nombre || ' ' || a.apellido_paterno AS alumno,
      d.nombre AS disciplina
    FROM pagos p
    JOIN alumnos a ON a.id = p.id_alumno
    LEFT JOIN matriculas m ON m.id = p.id_matricula
    LEFT JOIN disciplinas d ON d.id = m.id_disciplina
    WHERE 1=1
  `;
  const params = [];
  if (estado) { params.push(estado); query += ` AND p.estado = $${params.length}`; }
  if (medio)  { params.push(medio);  query += ` AND p.medio_pago = $${params.length}`; }
  query += ' ORDER BY p.fecha_pago DESC';
  const { rows } = await pool.query(query, params);
  return rows;
};

const findPendientes = async () => {
  const { rows } = await pool.query(
    `SELECT p.*, a.nombre || ' ' || a.apellido_paterno AS alumno, d.nombre AS disciplina
     FROM pagos p
     JOIN alumnos a ON a.id = p.id_alumno
     LEFT JOIN matriculas m ON m.id = p.id_matricula
     LEFT JOIN disciplinas d ON d.id = m.id_disciplina
     WHERE p.estado = 'pendiente'
     ORDER BY p.fecha_pago ASC`
  );
  return rows;
};

const findById = async (id) => {
  const { rows } = await pool.query('SELECT * FROM pagos WHERE id = $1', [id]);
  return rows[0];
};

const findByAlumno = async (id_alumno) => {
  const { rows } = await pool.query(
    'SELECT * FROM pagos WHERE id_alumno = $1 ORDER BY fecha_pago DESC',
    [id_alumno]
  );
  return rows;
};

const create = async ({ id_alumno, id_matricula, monto, medio_pago, concepto }) => {
  const { rows } = await pool.query(
    `INSERT INTO pagos (id_alumno, id_matricula, monto, medio_pago, concepto, estado, fecha_pago)
     VALUES ($1,$2,$3,$4,$5,'pendiente',NOW()) RETURNING *`,
    [id_alumno, id_matricula, monto, medio_pago, concepto]
  );
  return rows[0];
};

const updateEstado = async (id, estado) => {
  const { rows } = await pool.query(
    `UPDATE pagos SET estado=$1, fecha_confirmacion=NOW() WHERE id=$2 RETURNING *`,
    [estado, id]
  );
  return rows[0];
};

module.exports = { findAll, findPendientes, findById, findByAlumno, create, updateEstado };
