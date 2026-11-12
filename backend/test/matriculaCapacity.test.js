const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');

const dbPath = require.resolve('../config/db');
const fakePool = {};
const dbModule = new Module(dbPath);
dbModule.filename = dbPath;
dbModule.loaded = true;
dbModule.exports = fakePool;
require.cache[dbPath] = dbModule;

const Matricula = require('../src/models/Matricula');
const Disciplina = require('../src/models/Disciplina');

const createDatabase = (t, options) => {
  const state = {
    capacity: options.capacity,
    enrolled: options.enrolled,
    matricula: options.matricula || {
      id: 10,
      id_disciplina: 7,
      estado: 'activa',
      activa: true,
      fecha_vencimiento: new Date('2027-01-01')
    }
  };
  const queries = [];
  const originalConnect = fakePool.connect;

  fakePool.connect = async () => ({
    query: async (text, params = []) => {
      const sql = text.replace(/\s+/g, ' ').trim();
      queries.push({ sql, params });

      if (['BEGIN', 'COMMIT', 'ROLLBACK'].includes(sql)) return { rows: [] };
      if (sql.startsWith('SELECT * FROM matriculas')) {
        return { rows: state.matricula ? [state.matricula] : [] };
      }
      if (sql.startsWith('SELECT cupos_max FROM disciplinas')) {
        return { rows: [{ cupos_max: state.capacity }] };
      }
      if (sql.startsWith('SELECT COUNT(*)::int AS total')) {
        let total = state.enrolled;
        if (
          sql.includes('id <> $2') &&
          state.matricula &&
          state.matricula.id === params[1] &&
          state.matricula.estado === 'activa' &&
          state.matricula.activa
        ) {
          total--;
        }
        return { rows: [{ total }] };
      }
      if (sql.startsWith('INSERT INTO matriculas')) {
        state.enrolled++;
        return { rows: [{ id: 99, estado: 'activa', activa: true }] };
      }
      if (sql.startsWith('UPDATE matriculas SET')) {
        const [estado, fecha_vencimiento, activa, id] = params;
        if (state.matricula.estado === 'activa' && state.matricula.activa) state.enrolled--;
        if (estado === 'activa' && activa) state.enrolled++;
        state.matricula = { ...state.matricula, id, estado, fecha_vencimiento, activa };
        return { rows: [state.matricula] };
      }
      if (sql.startsWith('UPDATE disciplinas SET')) {
        return { rows: [{ id: 7, cupos_max: params[5] }] };
      }

      throw new Error(`Consulta no prevista en la prueba: ${sql}`);
    },
    release: () => {}
  });

  t.after(() => {
    fakePool.connect = originalConnect;
  });

  return { queries, state };
};

test('rechaza una matrícula cuando se alcanza el aforo y revierte la transacción', async (t) => {
  const { queries } = createDatabase(t, { capacity: 1, enrolled: 1 });

  await assert.rejects(
    Matricula.create({ id_alumno: 20, id_disciplina: 7, periodo_meses: 1, precio_total: 100 }),
    (error) => error.status === 409
  );

  const sql = queries.map((query) => query.sql);
  assert.ok(sql.findIndex((query) => query.includes('FOR UPDATE')) < sql.findIndex((query) => query.startsWith('SELECT COUNT')));
  assert.equal(sql.some((query) => query.startsWith('INSERT INTO matriculas')), false);
  assert.equal(sql.at(-1), 'ROLLBACK');
});

test('admite una matrícula con cupo y confirma la transacción', async (t) => {
  const { queries } = createDatabase(t, { capacity: 2, enrolled: 1 });

  const matricula = await Matricula.create({
    id_alumno: 20,
    id_disciplina: 7,
    periodo_meses: 1,
    precio_total: 100
  });

  assert.equal(matricula.id, 99);
  assert.equal(queries.at(-1).sql, 'COMMIT');
});

test('cancelar una matrícula libera el cupo para una nueva inscripción', async (t) => {
  const { state } = createDatabase(t, { capacity: 1, enrolled: 1 });

  await Matricula.update(10, { estado: 'cancelada' });
  assert.equal(state.matricula.activa, false);
  assert.equal(state.enrolled, 0);

  const matricula = await Matricula.create({
    id_alumno: 20,
    id_disciplina: 7,
    periodo_meses: 1,
    precio_total: 100
  });

  assert.equal(matricula.id, 99);
});

test('impide reactivar una matrícula si ya no quedan cupos', async (t) => {
  const { queries } = createDatabase(t, {
    capacity: 1,
    enrolled: 1,
    matricula: {
      id: 10,
      id_disciplina: 7,
      estado: 'cancelada',
      activa: false,
      fecha_vencimiento: new Date('2027-01-01')
    }
  });

  await assert.rejects(
    Matricula.update(10, { estado: 'activa' }),
    (error) => error.status === 409
  );

  assert.equal(queries.some((query) => query.sql.startsWith('UPDATE matriculas SET')), false);
  assert.equal(queries.at(-1).sql, 'ROLLBACK');
});

test('impide reducir el aforo por debajo de las matrículas activas', async (t) => {
  const { queries } = createDatabase(t, { capacity: 2, enrolled: 2 });

  await assert.rejects(
    Disciplina.update(7, {
      nombre: 'Muay Thai',
      cupos_max: 1,
      precio_mensual: 150
    }),
    (error) => error.status === 409
  );

  assert.equal(queries.some((query) => query.sql.startsWith('UPDATE disciplinas SET')), false);
  assert.equal(queries.at(-1).sql, 'ROLLBACK');
});

test('rechaza aforos nulos, negativos o fraccionarios al crear disciplinas', async () => {
  for (const cupos_max of [null, -1, 1.5, '']) {
    await assert.rejects(
      Disciplina.create({ nombre: 'Muay Thai', cupos_max }),
      (error) => error.status === 400
    );
  }
});
