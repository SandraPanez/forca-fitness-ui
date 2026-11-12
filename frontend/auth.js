/**
 * auth.js — Control de roles y navegación dinámica
 * Forca & Fitness · feature/control-roles
 *
 * DOS VISTAS:
 *   admin  → admin, tesorero
 *   alumno → recepcion, instructor
 */

// ── Normaliza el rol de BD a vista frontend ───────────────────────────────────
function _getRolVista(rolBD) {
  var r = (rolBD || '').trim().toLowerCase();
  if (r === 'admin' || r === 'tesorero') return 'admin';
  return 'alumno';
}

// ── Guard: redirige si no tiene permiso ───────────────────────────────────────
// vistasPermitidas: ['admin'] solo gestión, ['alumno'] solo alumnos, [] cualquiera
function requireRol(vistasPermitidas) {
  var token = localStorage.getItem('token');
  if (!token) { location.href = 'login.html'; return; }
  if (vistasPermitidas && vistasPermitidas.length > 0) {
    var usuario = _getUsuario();
    var vista = _getRolVista(usuario.rol);
    var ok = vistasPermitidas.some(function(v) { return v.toLowerCase() === vista; });
    if (!ok) {
      alert('No tienes permiso para acceder a esta sección.');
      location.href = 'index.html';
    }
  }
}

// ── Nav por vista ─────────────────────────────────────────────────────────────
var NAV_CONFIG = {
  admin: [
    { href: 'index.html',          label: '📊 Dashboard' },
    { href: 'alumnos.html',        label: '👥 Alumnos' },
    { href: 'mis-matriculas.html', label: '📋 Matrículas' },
    { href: 'tesoreria.html',      label: '💰 Tesorería' },
    { href: 'control_acceso.html', label: '🛡 Control Acceso' },
    { href: 'perfil.html',         label: '👤 Mi Perfil' },
  ],
  alumno: [
    { href: 'index.html',          label: '🏠 Inicio' },
    { href: 'mis-membresias.html', label: '🎫 Mi Membresía' },
    { href: 'disciplinas.html',    label: '🥋 Mis Clases' },
    { href: 'pagos.html',          label: '💳 Pagar' },
    { href: 'perfil.html',         label: '👤 Mi Perfil' },
  ],
};

// ── Inicializar barra de navegación ──────────────────────────────────────────
function initNav() {
  var usuario = _getUsuario();
  var vista = _getRolVista(usuario.rol);
  var links = NAV_CONFIG[vista] || NAV_CONFIG['alumno'];
  var paginaActual = location.pathname.split('/').pop() || 'index.html';

  var navLinksEl = document.getElementById('navLinks');
  if (navLinksEl) {
    navLinksEl.innerHTML = links.map(function(l) {
      var activo = paginaActual === l.href ? 'active' : '';
      return '<a href="' + l.href + '" class="' + activo + '">' + l.label + '</a>';
    }).join('');
  }

  if (usuario.nombre) {
    var ini = usuario.nombre.substring(0, 2).toUpperCase();
    var rolLabels = { admin: 'Administrador', tesorero: 'Tesorería', recepcion: 'Alumno', instructor: 'Instructor' };
    var rolLabel = rolLabels[(usuario.rol || '').toLowerCase()] || usuario.rol || '';
    var avatarEl = document.getElementById('navAvatar');
    var nombreEl = document.getElementById('navNombre');
    var rolEl    = document.getElementById('navRol');
    if (avatarEl) avatarEl.textContent = ini;
    if (nombreEl) nombreEl.textContent = usuario.nombre;
    if (rolEl)    rolEl.textContent    = rolLabel + (usuario.disciplina ? ' · ' + usuario.disciplina : '');
  }
}

// ── Cerrar sesión ─────────────────────────────────────────────────────────────
function cerrarSesion() {
  if (confirm('¿Seguro que deseas cerrar sesión?')) {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    location.href = 'login.html';
  }
}

// ── Helper interno ────────────────────────────────────────────────────────────
function _getUsuario() {
  try { return JSON.parse(localStorage.getItem('usuario') || '{}'); }
  catch(e) { return {}; }
}
