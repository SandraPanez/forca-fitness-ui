/**
 * auth.js — Control de roles y navegación dinámica
 * Forca & Fitness · feature/control-roles
 *
 * ROLES EN BD: admin, tesorero, recepcion, instructor
 * LÓGICA FRONTEND:
 *   - admin + tesorero → vista de gestión (dashboard con stats, alumnos, matrículas, tesorería)
 *   - recepcion + instructor → vista de alumno/cliente (clases, pagos, perfil)
 */

// ── HELPER: normaliza cualquier rol al grupo de vista ─────────────────────────
// Devuelve 'admin' o 'alumno' (dos vistas posibles en el frontend)
function _getRolVista(rolBD) {
  var r = (rolBD || '').trim().toLowerCase();
  if (r === 'admin' || r === 'tesorero') return 'admin';
  return 'alumno'; // recepcion, instructor, o cualquier otro
}

// ── GUARD DE ROL ─────────────────────────────────────────────────────────────
// vistasPermitidas: ['admin'] solo admins/tesoreros, ['alumno'] solo alumnos,
//                  [] o sin arg → cualquier usuario autenticado
function requireRol(vistasPermitidas) {
  const token = localStorage.getItem('token');
  if (!token) { location.href = 'login.html'; return; }
  if (vistasPermitidas && vistasPermitidas.length > 0) {
    const usuario = _getUsuario();
    const vista = _getRolVista(usuario.rol);
    const permitido = vistasPermitidas.some(function(v) {
      return v.toLowerCase() === vista;
    });
    if (!permitido) {
      alert('No tienes permiso para acceder a esta sección.');
      location.href = 'index.html';
    }
  }
}

// ── CONFIGURACIÓN DE NAVEGACIÓN POR VISTA ────────────────────────────────────
const NAV_CONFIG = {
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

// ── INICIALIZAR BARRA DE NAVEGACIÓN ──────────────────────────────────────────
function initNav() {
  const usuario = _getUsuario();
  const vista = _getRolVista(usuario.rol);
  const links = NAV_CONFIG[vista] || NAV_CONFIG['alumno'];
  const paginaActual = location.pathname.split('/').pop() || 'index.html';

  // Inyectar links
  const navLinksEl = document.getElementById('navLinks');
  if (navLinksEl) {
    navLinksEl.innerHTML = links.map(function(l) {
      var activo = paginaActual === l.href ? 'active' : '';
      return '<a href="' + l.href + '" class="' + activo + '">' + l.label + '</a>';
    }).join('');
  }

  // Inyectar datos del usuario en nav-right
  if (usuario.nombre) {
    var ini = usuario.nombre.substring(0, 2).toUpperCase();
    var avatarEl = document.getElementById('navAvatar');
    var nombreEl = document.getElementById('navNombre');
    var rolEl    = document.getElementById('navRol');
    // Etiqueta legible del rol para mostrar al usuario
    var rolLabels = { admin: 'Administrador', tesorero: 'Tesorería', recepcion: 'Alumno', instructor: 'Instructor' };
    var rolLabel = rolLabels[(usuario.rol || '').toLowerCase()] || usuario.rol || '';
    if (avatarEl) avatarEl.textContent = ini;
    if (nombreEl) nombreEl.textContent = usuario.nombre;
    if (rolEl)    rolEl.textContent    = rolLabel + (usuario.disciplina ? ' · ' + usuario.disciplina : '');
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
