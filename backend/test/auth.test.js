const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const dbPath = require.resolve('../config/db');
const fakePool = { query: async () => ({ rows: [] }) };
const dbModule = new Module(dbPath);
dbModule.filename = dbPath;
dbModule.loaded = true;
dbModule.exports = fakePool;
require.cache[dbPath] = dbModule;

const authController = require('../src/controllers/authController');
const { createRequireAuth } = require('../src/middleware/requireAuth');
const SECRET = 'a-test-secret-with-at-least-32-bytes';
const PASSWORD_HASH = bcrypt.hashSync('CorrectHorseBatteryStaple!', 4);

const createResponse = () => ({
  statusCode: 200,
  body: null,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(body) {
    this.body = body;
    return this;
  }
});

test('login normalizes email, checks bcrypt hash, and returns a signed token', async (t) => {
  const originalSecret = process.env.JWT_SECRET;
  process.env.JWT_SECRET = SECRET;
  fakePool.query = async (sql, params) => {
    assert.match(sql, /LOWER\(email\) = \$1/);
    assert.deepEqual(params, ['admin@example.com']);
    return {
      rows: [{
        id: 8,
        nombre: 'Directora',
        email: 'admin@example.com',
        password_hash: PASSWORD_HASH,
        rol: 'admin',
        alumno_id: null,
        activo: true
      }]
    };
  };
  t.after(() => {
    if (originalSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = originalSecret;
  });

  const response = createResponse();
  await authController.login({
    body: { email: '  ADMIN@Example.com ', password: 'CorrectHorseBatteryStaple!' }
  }, response);

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.usuario.id, 8);
  assert.equal(response.body.usuario.rol, 'admin');
  assert.equal(Object.hasOwn(response.body.usuario, 'password_hash'), false);

  const payload = jwt.verify(response.body.token, SECRET, {
    algorithms: ['HS256'],
    issuer: 'forca-fitness-api',
    audience: 'forca-fitness-app'
  });
  assert.equal(payload.sub, '8');
  assert.equal(payload.rol, 'admin');
});

test('login rejects incorrect passwords and inactive accounts', async (t) => {
  const originalSecret = process.env.JWT_SECRET;
  process.env.JWT_SECRET = SECRET;
  t.after(() => {
    if (originalSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = originalSecret;
  });

  fakePool.query = async () => ({
    rows: [{
      id: 8,
      nombre: 'Directora',
      email: 'admin@example.com',
      password_hash: PASSWORD_HASH,
      rol: 'admin',
      alumno_id: null,
      activo: true
    }]
  });
  const wrongPassword = createResponse();
  await authController.login({
    body: { email: 'admin@example.com', password: 'wrong-password' }
  }, wrongPassword);
  assert.equal(wrongPassword.statusCode, 401);
  assert.deepEqual(wrongPassword.body, { error: 'Credenciales inválidas' });

  fakePool.query = async () => ({
    rows: [{
      id: 8,
      nombre: 'Directora',
      email: 'admin@example.com',
      password_hash: PASSWORD_HASH,
      rol: 'admin',
      alumno_id: null,
      activo: false
    }]
  });
  const inactive = createResponse();
  await authController.login({
    body: { email: 'admin@example.com', password: 'CorrectHorseBatteryStaple!' }
  }, inactive);
  assert.equal(inactive.statusCode, 401);
});

test('login fails closed when JWT secret is missing or too short', async (t) => {
  const originalSecret = process.env.JWT_SECRET;
  delete process.env.JWT_SECRET;
  t.after(() => {
    if (originalSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = originalSecret;
  });

  const response = createResponse();
  await authController.login({
    body: { email: 'admin@example.com', password: 'any-password' }
  }, response);

  assert.equal(response.statusCode, 500);
  assert.deepEqual(response.body, { error: 'Autenticación no configurada correctamente' });
});

test('authentication middleware accepts valid tokens and rejects missing or invalid tokens', () => {
  const middleware = createRequireAuth(() => SECRET);
  const token = jwt.sign(
    { email: 'student@example.com', rol: 'alumno', alumnoId: 25 },
    SECRET,
    {
      algorithm: 'HS256',
      subject: '11',
      issuer: 'forca-fitness-api',
      audience: 'forca-fitness-app',
      expiresIn: '1h'
    }
  );
  const req = { get: (name) => name === 'authorization' ? `Bearer ${token}` : undefined };
  let nextCalled = false;
  middleware(req, createResponse(), () => { nextCalled = true; });

  assert.equal(nextCalled, true);
  assert.deepEqual(req.user, {
    id: 11,
    email: 'student@example.com',
    rol: 'alumno',
    alumno_id: 25
  });

  for (const authorization of ['', 'Basic token', 'Bearer invalid']) {
    const response = createResponse();
    middleware(
      { get: () => authorization },
      response,
      () => assert.fail('No debe aceptar un token inválido')
    );
    assert.equal(response.statusCode, 401);
  }
});
