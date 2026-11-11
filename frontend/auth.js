/**
 * auth.js — Control de roles y navegación dinámica
 * Forca & Fitness · feature/control-roles
 */

const API = 'https://forca-fitness-backend.onrender.com';

// ── MAPEO DE ROLES (BD → frontend) ───────────────────────────────────────────
// BD usa: admin, tesorero, recepcion, instructor
// Frontend acepta también: Admin, Tesorería, Alumno, Instructor (legacy)
const ROL_MAP = {
  'admin':      'admin',
  'tesorero':   'tesorero',
  'recepcion':  'recepcion',
  'instructor': 'instructor',
  // aliases con mayúscula (por compatibilidad)
  'Admin':      'admin',
  'Tesorería':  'tesorero',
  'Tesoreria':  'tesorero',
  'Alumno':     'recepcion',
  'Instructor': 'instructor',
};

// ── GUARD DE ROL ─────────────────────────────────────────────────────────────
// rolesPermitidos: array de roles en minúscula según BD
// Ej: requireRol(['admin','tesorero']) o requireRol([]) para cualquier usuario
function requireRol(rolesPermitidos) {
  const token = localStorage.getItem('token');
  if (!token) { location.href = 'login.html'; return; }
  if (rolesPermitidos && rolesPermitidos.length > 0) {
    const usuario = _getUsuario();
    const rolOriginal = (usuario.rol || '').trim();
    const rol = (ROL_MAP[rolOriginal] || rolOriginal).toLowerCase();
    const permitido = rolesPermitidos.some(r => r.toLowerCase() === rol);
    if (!permitido) {
      alert('No tienes permiso para acceder a esta sección.');
      location.href = 'index.html';
    }
  }
}

// ── CONFIGURACIÓN DE NAVEGACIÓN POR ROL ──────────────────────────────────────
// Roles en BD: admin, tesorero, recepcion, instructor (todos minúscula)
const NAV_CONFIG = {
  recepcion: [
    { href: 'index.html',        label: '🏠 Inicio' },
    { href: 'disciplinas.html',  label: '🥋 Mis Clases' },
    { href: 'renovar.html',      label: '🔄 Renovar' },
    { href: 'pagos.html',        label: '💳 Pagos' },
    { href: 'perfil.html',       label: '👤 Mi Perfil' },
  ],
  admin: [
    { href: 'index.html',          label: '📊 Dashboard' },
    { href: 'alumnos.html',        label: '👥 Alumnos' },
    { href: 'mis-matriculas.html', label: '📋 Matrículas' },
    { href: 'tesoreria.html',      label: '💰 Tesorería' },
    { href: 'control_acceso.html', label: '🛡 Control Acceso' },
    { href: 'perfil.html',         label: '👤 Mi Perfil' },
  ],
  instructor: [
    { href: 'index.html',       label: '🏠 Inicio' },
    { href: 'disciplinas.html', label: '🥋 Mis Clases' },
    { href: 'perfil.html',      label: '👤 Mi Perfil' },
  ],
  tesorero: [
    { href: 'index.html',          label: '📊 Dashboard' },
    { href: 'alumnos.html',        label: '👥 Alumnos' },
    { href: 'mis-matriculas.html', label: '📋 Matrículas' },
    { href: 'tesoreria.html',      label: '💰 Tesorería' },
    { href: 'pagos.html',          label: '💳 Pagos' },
    { href: 'perfil.html',         label: '👤 Mi Perfil' },
  ],
  default: [
    { href: 'index.html',  label: '🏠 Inicio' },
    { href: 'perfil.html', label: '👤 Mi Perfil' },
  ],
};

// ── INICIALIZAR BARRA DE NAVEGACIÓN ──────────────────────────────────────────
function initNav() {
  const usuario = _getUsuario();
  const rol = (usuario.rol || '').trim();
  const links = NAV_CONFIG[rol] || NAV_CONFIG['default'];
  const paginaActual = location.pathname.split('/').pop() || 'index.html';

  // Inyectar links
  const navLinksEl = document.getElementById('navLinks');
  if (navLinksEl) {
    navLinksEl.innerHTML = links.map(function(l) {
      var activo = paginaActual === l.href ? ' active' : '';
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
    location.href = 'login.html';
  }
}

// ── HELPER INTERNO ───────────────────────────────────────────────────────────
function _getUsuario() {
  try { return JSON.parse(localStorage.getItem('usuario') || '{}'); }
  catch (e) { return {}; }
}
