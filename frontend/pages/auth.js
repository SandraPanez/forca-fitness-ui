/**
 * auth.js — Control de roles y navegación dinámica
 * Forca & Fitness · feature/control-roles
 */

// ── GUARD DE ROL ─────────────────────────────────────────────────────────────
function requireRol(rolesPermitidos) {
  const token = localStorage.getItem('token');
  if (!token) { location.href = '../auth/login.html'; return; }
  if (rolesPermitidos && rolesPermitidos.length > 0) {
    const usuario = _getUsuario();
    const rol = _normalizeRole(usuario.rol);
    const permitido = rolesPermitidos.some(r => _normalizeRole(r) === rol);
    if (!permitido) {
      alert('No tienes permiso para acceder a esta sección.');
      location.href = _homeForRole(rol);
    }
  }
}

// ── CONFIGURACIÓN DE NAVEGACIÓN POR ROL ──────────────────────────────────────
const NAV_CONFIG = {
  alumno: [
    { href: '../portal/mis-matriculas.html', label: '🏠 Inicio' },
    { href: '../portal/disciplinas.html',    label: '🥋 Mis Clases' },
    { href: '../portal/renovar.html',        label: '🔄 Renovar' },
    { href: '../portal/pagos.html',          label: '💳 Pagos' },
    { href: '../portal/perfil.html',         label: '👤 Mi Perfil' },
  ],
  admin: [
    { href: '../admin/index.html',          label: '📊 Dashboard' },
    { href: '../admin/alumnos.html',        label: '👥 Alumnos' },
    { href: '../portal/mis-matriculas.html', label: '📋 Matrículas' },
    { href: '../admin/tesoreria.html',      label: '💰 Tesorería' },
    { href: '../admin/control_acceso.html', label: '🛡 Control Acceso' },
    { href: '../portal/perfil.html',        label: '👤 Mi Perfil' },
  ],
  instructor: [
    { href: '../portal/mis-matriculas.html', label: '🏠 Inicio' },
    { href: '../portal/disciplinas.html',    label: '🥋 Mis Clases' },
    { href: '../portal/perfil.html',         label: '👤 Mi Perfil' },
  ],
  tesorero: [
    { href: '../admin/index.html',           label: '📊 Dashboard' },
    { href: '../admin/alumnos.html',         label: '👥 Alumnos' },
    { href: '../portal/mis-matriculas.html', label: '📋 Matrículas' },
    { href: '../admin/tesoreria.html',       label: '💰 Tesorería' },
    { href: '../portal/pagos.html',          label: '💳 Pagos' },
    { href: '../portal/perfil.html',         label: '👤 Mi Perfil' },
  ],
  default: [
    { href: '../portal/mis-matriculas.html', label: '🏠 Inicio' },
    { href: '../portal/perfil.html',         label: '👤 Mi Perfil' },
  ],
};

// ── INICIALIZAR BARRA DE NAVEGACIÓN ──────────────────────────────────────────
function initNav() {
  const usuario = _getUsuario();
  const rol = (usuario.rol || '').trim();
  const links = NAV_CONFIG[_normalizeRole(rol)] || NAV_CONFIG['default'];
  const paginaActual = location.pathname;

  // Inyectar links
  const navLinksEl = document.getElementById('navLinks');
  if (navLinksEl) {
    navLinksEl.innerHTML = links.map(function(l) {
      var activo = paginaActual === new URL(l.href, location.href).pathname ? ' active' : '';
      return '<a href="' + l.href + '" class="' + activo.trim() + '">' + l.label + '</a>';
    }).join('');
  }

  // Inyectar datos del usuario en nav-right
  if (usuario.nombre) {
    var ini = usuario.nombre.substring(0, 2).toUpperCase();
    var avatarEl  = document.getElementById('navAvatar');
    var nombreEl  = document.getElementById('navNombre');
    var rolEl     = document.getElementById('navRol');
    if (avatarEl) avatarEl.textContent = ini;
    if (nombreEl) nombreEl.textContent = usuario.nombre;
    if (rolEl)    rolEl.textContent    = rol + (usuario.disciplina ? ' · ' + usuario.disciplina : '');
  }
}

// ── CERRAR SESIÓN ─────────────────────────────────────────────────────────────
function cerrarSesion() {
  if (confirm('¿Seguro que deseas cerrar sesión?')) {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    location.href = '../auth/login.html';
  }
}

// ── HELPER INTERNO ───────────────────────────────────────────────────────────
function _normalizeRole(role) {
  const normalized = (role || '').trim().toLowerCase();
  if (normalized === 'tesorería' || normalized === 'tesoreria') return 'tesorero';
  return normalized;
}

function _homeForRole(role) {
  return ['admin', 'tesorero', 'recepcion'].includes(_normalizeRole(role))
    ? '../admin/index.html'
    : '../portal/mis-matriculas.html';
}

function _getUsuario() {
  try { return JSON.parse(localStorage.getItem('usuario') || '{}'); }
  catch (e) { return {}; }
}
