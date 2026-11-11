const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ── Middleware ──────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use((req, res, next) => { res.setHeader('Content-Type', 'application/json; charset=utf-8'); next(); });

// ── Rutas ───────────────────────────────────────────────────
app.use('/api/alumnos',     require('./src/routes/alumnos'));
app.use('/api/disciplinas', require('./src/routes/disciplinas'));
app.use('/api/matriculas',  require('./src/routes/matriculas'));
app.use('/api/pagos',       require('./src/routes/pagos'));
app.use('/api/accesos',     require('./src/routes/accesos'));
app.use('/api/auth',        require('./src/routes/auth'));

// ── Ruta raíz (health check) ────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    sistema: 'Forca & Fitness API',
    version: '1.0.0',
    estado: 'activo',
    timestamp: new Date().toISOString()
  });
});

// ── Ruta no encontrada ──────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// ── Servidor ────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
