const test = require('node:test');
const assert = require('node:assert/strict');
const { createDemoUsers, DEMO_ACCOUNTS } = require('../scripts/createDemoUsers');

const createClient = ({ existing = [], studentId = 12 } = {}) => {
  const queries = [];
  return {
    queries,
    async query(sql, params = []) {
      const statement = sql.replace(/\s+/g, ' ').trim();
      queries.push({ statement, params });
      if (statement === 'SELECT email FROM usuarios WHERE LOWER(email) = ANY($1::text[])') {
        return { rows: existing };
      }
      if (statement.startsWith('SELECT id FROM alumnos')) {
        return { rows: studentId === null ? [] : [{ id: studentId }] };
      }
      if (statement.startsWith('INSERT INTO usuarios')) {
        return { rows: [] };
      }
      return { rows: [] };
    }
  };
};

test('creates demo role accounts with hashed passwords and linked student account', async () => {
  const client = createClient();
  let generated = 0;
  const accounts = await createDemoUsers(client, {
    generatePassword: () => `private-demo-password-${generated++}`,
    hashPassword: async (password) => `bcrypt-hash(${password})`
  });

  const inserts = client.queries.filter(({ statement }) => statement.startsWith('INSERT INTO usuarios'));
  assert.equal(inserts.length, 5);
  assert.deepEqual(accounts.map(({ rol }) => rol), ['admin', 'tesorero', 'recepcion', 'instructor', 'alumno']);
  assert.equal(accounts.every(({ email }) => email.endsWith('@forcafitness.com')), true);
  assert.equal(DEMO_ACCOUNTS.every(({ email, nombre }) => (
    !email.includes('demo') && !nombre.toLowerCase().includes('demo')
  )), true);
  assert.equal(accounts.every(({ password }) => password.startsWith('private-demo-password-')), true);
  accounts.forEach((account, index) => {
    assert.equal(inserts[index].params[2], `bcrypt-hash(${account.password})`);
  });
  assert.equal(inserts[4].params[4], 12);
  assert.deepEqual(client.queries.slice(-1).map(({ statement }) => statement), ['COMMIT']);
});

test('does not create accounts if demo emails already exist', async () => {
  const client = createClient({ existing: [{ email: 'director.demo@forcafitness.test' }] });

  await assert.rejects(
    createDemoUsers(client, {
      generatePassword: () => 'unused',
      hashPassword: async (password) => `bcrypt-hash(${password})`
    }),
    /Ya existen cuentas demo/
  );

  assert.equal(client.queries.some(({ statement }) => statement.startsWith('INSERT INTO usuarios')), false);
  assert.equal(client.queries.at(-1).statement, 'ROLLBACK');
});

test('rolls back demo accounts if the linked student record is missing', async () => {
  const client = createClient({ studentId: null });

  await assert.rejects(
    createDemoUsers(client, {
      generatePassword: () => 'unused',
      hashPassword: async (password) => `bcrypt-hash(${password})`
    }),
    /Falta el alumno demo/
  );

  assert.equal(client.queries.some(({ statement }) => statement.startsWith('INSERT INTO usuarios')), false);
  assert.equal(client.queries.at(-1).statement, 'ROLLBACK');
});
