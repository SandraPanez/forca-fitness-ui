const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');

const frontendRoot = path.resolve(__dirname, '../../frontend/pages');
const authSource = fs.readFileSync(path.join(frontendRoot, 'auth.js'), 'utf8');
let token = null;
const context = { localStorage: { getItem: () => token } };
vm.runInNewContext(
  `${authSource}\nthis.roleHelpers = { normalize: _normalizeRole, home: _homeForRole, nav: NAV_CONFIG, hasSession: _hasSession };`,
  context
);

const allowedRoles = (page) => {
  const html = fs.readFileSync(path.join(frontendRoot, page), 'utf8');
  const match = html.match(/requireRol\(\[([^\]]*)\]\)/);
  return match ? [...match[1].matchAll(/'([^']+)'/g)].map((role) => role[1]) : [];
};

test('maps C4 role names to the application role codes', () => {
  const normalize = context.roleHelpers.normalize;
  assert.equal(normalize('Director'), 'admin');
  assert.equal(normalize('Profesor'), 'instructor');
  assert.equal(normalize('Recepcionista'), 'recepcion');
  assert.equal(normalize('Tesorero'), 'tesorero');
  assert.equal(normalize('Alumno'), 'alumno');
});

test('routes each supported role to an appropriate existing landing view', () => {
  const home = context.roleHelpers.home;
  assert.equal(home('Director'), '../admin/index.html');
  assert.equal(home('Tesorero'), '../admin/index.html');
  assert.equal(home('Profesor'), '../portal/disciplinas.html');
  assert.equal(home('Alumno'), '../portal/mis-matriculas.html');
  assert.equal(home('Recepcionista'), '../portal/perfil.html');
});

test('does not treat an undefined token as an authenticated session', () => {
  const hasSession = context.roleHelpers.hasSession;
  for (const invalidToken of [null, '', 'undefined', 'null', '  ']) {
    token = invalidToken;
    assert.equal(hasSession(), false);
  }
  token = 'signed-token';
  assert.equal(hasSession(), true);
});

test('keeps instructor and student navigation within their allowed pages', () => {
  const nav = context.roleHelpers.nav;
  assert.equal(nav.instructor.some((link) => link.href === '../portal/disciplinas.html'), true);
  assert.equal(nav.instructor.some((link) => link.href === '../portal/mis-matriculas.html'), false);
  assert.deepEqual(allowedRoles('portal/disciplinas.html'), ['Alumno', 'Instructor']);
  assert.deepEqual(allowedRoles('portal/mis-matriculas.html'), ['Alumno']);
});

test('all configured navigation destinations resolve to existing pages', () => {
  for (const links of Object.values(context.roleHelpers.nav)) {
    for (const base of ['admin', 'portal']) {
      for (const link of links) {
        const target = path.resolve(frontendRoot, base, link.href);
        assert.equal(fs.existsSync(target), true, `${link.href} should exist from ${base}`);
      }
    }
  }

  for (const role of ['Director', 'Tesorero', 'Profesor', 'Alumno', 'Recepcionista']) {
    const target = path.resolve(frontendRoot, 'auth', context.roleHelpers.home(role));
    assert.equal(fs.existsSync(target), true, `${role} landing page should exist`);
  }
});

test('restricts the management dashboard to director/admin and treasury roles', () => {
  assert.deepEqual(allowedRoles('admin/index.html'), ['Admin', 'Tesorería']);
  assert.deepEqual(allowedRoles('admin/tesoreria.html'), ['Admin', 'Tesorería']);
  assert.deepEqual(allowedRoles('portal/renovar.html'), ['Alumno']);
  assert.deepEqual(allowedRoles('portal/pagos.html'), ['Alumno']);
  assert.deepEqual(allowedRoles('portal/comprobante.html'), ['Alumno']);
});
