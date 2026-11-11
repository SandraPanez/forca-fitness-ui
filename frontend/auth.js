/**
 * auth.js — Control de roles y navegación dinámica
 * Forca & Fitness · feature/control-roles
 */

const API = 'https://forca-fitness-backend.onrender.com';

// ── GUARD DE ROL ─────────────────────────────────────────────────────────────
function requireRol(rolesPermitidos) {
  const token = localStorage.getItem('token');
  if (!token) { location.href = 'login.html'; return; }
  if (rolesPermitidos && rolesPermitidos.length > 0) {
    const usuario = _getUsuario();
    const rol = (usuario.rol || '').trim();
    const permitido = rolesPermitidos.some(r => r.toLowerCase() === rol.toLowerCase());
    if (!permitido) {
      alert('No tienes permiso para acceder a esta sección.');
      location.href = 'index.html';
    }
  }
}

// ── CONFIGURACIÓN DE NAVEGACIÓN POR ROL ──────────────────────────────────────
const NAV_CONFIG = {
  Alumno: [
    { href: 'index.html',        label: '🏠 Inicio' },
    { href: 'disciplinas.html',  label: '🥋 Mis Clases' },
    { href: 'renovar.html',      label: '🔄 Renovar' },
    { href: 'pagos.html',        label: '💳 Pagos' },
    { href: 'perfil.html',       label: '👤 Mi Perfil' },
  ],
  Admin: [
    { href: 'index.html',          label: '📊 Dashboard' },
    { href: 'alumnos.html',        label: '👥 Alumnos' },
    { href: 'mis-matriculas.html', label: '📋 Matrículas' },
    { href: 'tesoreria.html',      label: '💰 Tesorería' },
    { href: 'control_acceso.html', label: '🛡 Control Acceso' },
    { href: 'perfil.html',         label: '👤 Mi Perfil' },
  ],
  Instructor: [
    { href: 'index.html',       label: '🏠 Inicio' },
    { href: 'disciplinas.html', label: '🥋 Mis Clases' },
    { href: 'perfil.html',      label: '👤 Mi Perfil' },
  ],
  Tesorería: [
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
