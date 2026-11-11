-- ============================================================
--  FORCA & FITNESS — Esquema de Base de Datos PostgreSQL
--  Proyecto: Arquitectura de Software — USMP Ciclo 7
--  Profesor: Ing. Fred Duarte
-- ============================================================

-- Limpiar tablas si ya existen (orden inverso por FK)
DROP TABLE IF EXISTS accesos      CASCADE;
DROP TABLE IF EXISTS pagos        CASCADE;
DROP TABLE IF EXISTS matriculas   CASCADE;
DROP TABLE IF EXISTS usuarios     CASCADE;
DROP TABLE IF EXISTS alumnos      CASCADE;
DROP TABLE IF EXISTS disciplinas  CASCADE;

-- ============================================================
-- 1. DISCIPLINAS
-- ============================================================
CREATE TABLE disciplinas (
  id              SERIAL PRIMARY KEY,
  nombre          VARCHAR(100) NOT NULL,
  descripcion     TEXT,
  profesor        VARCHAR(150),
  horario         VARCHAR(200),
  sede            VARCHAR(100) DEFAULT 'Principal',
  cupos_max       INTEGER DEFAULT 20,
  precio_mensual  DECIMAL(8,2) NOT NULL,
  activa          BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 2. ALUMNOS
-- ============================================================
CREATE TABLE alumnos (
  id                  SERIAL PRIMARY KEY,
  nombre              VARCHAR(100) NOT NULL,
  apellido_paterno    VARCHAR(100) NOT NULL,
  apellido_materno    VARCHAR(100),
  dni                 VARCHAR(20) UNIQUE NOT NULL,
  email               VARCHAR(150) UNIQUE,
  telefono            VARCHAR(20),
  fecha_nacimiento    DATE,
  fecha_inscripcion   DATE DEFAULT CURRENT_DATE,
  sede                VARCHAR(100) DEFAULT 'Principal',
  foto_url            TEXT,
  created_at          TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 3. MATRICULAS
-- ============================================================
CREATE TABLE matriculas (
  id                  SERIAL PRIMARY KEY,
  id_alumno           INTEGER NOT NULL REFERENCES alumnos(id) ON DELETE CASCADE,
  id_disciplina       INTEGER NOT NULL REFERENCES disciplinas(id),
  fecha_inicio        DATE NOT NULL DEFAULT CURRENT_DATE,
  fecha_vencimiento   DATE NOT NULL,
  periodo_meses       INTEGER NOT NULL DEFAULT 1,
  precio_total        DECIMAL(8,2) NOT NULL,
  estado              VARCHAR(20) NOT NULL DEFAULT 'activa'
                        CHECK (estado IN ('activa','vencida','suspendida','cancelada')),
  activa              BOOLEAN DEFAULT TRUE,
  created_at          TIMESTAMP DEFAULT NOW()
);

-- Solo una matrícula activa por alumno a la vez
CREATE UNIQUE INDEX idx_matricula_activa_unica
  ON matriculas (id_alumno) WHERE activa = TRUE;

-- ============================================================
-- 4. PAGOS
-- ============================================================
CREATE TABLE pagos (
  id                  SERIAL PRIMARY KEY,
  id_alumno           INTEGER NOT NULL REFERENCES alumnos(id) ON DELETE CASCADE,
  id_matricula        INTEGER REFERENCES matriculas(id),
  monto               DECIMAL(8,2) NOT NULL,
  medio_pago          VARCHAR(50) NOT NULL
                        CHECK (medio_pago IN ('efectivo','transferencia','tarjeta','yape','plin')),
  concepto            VARCHAR(200),
  estado              VARCHAR(20) NOT NULL DEFAULT 'pendiente'
                        CHECK (estado IN ('pendiente','aprobado','rechazado')),
  fecha_pago          TIMESTAMP DEFAULT NOW(),
  fecha_confirmacion  TIMESTAMP,
  comprobante_num     VARCHAR(50),
  created_at          TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 5. ACCESOS
-- ============================================================
CREATE TABLE accesos (
  id          SERIAL PRIMARY KEY,
  id_alumno   INTEGER NOT NULL REFERENCES alumnos(id) ON DELETE CASCADE,
  tipo        VARCHAR(20) DEFAULT 'ingreso' CHECK (tipo IN ('ingreso','salida')),
  sede        VARCHAR(100) DEFAULT 'Principal',
  resultado   VARCHAR(20) DEFAULT 'permitido' CHECK (resultado IN ('permitido','denegado')),
  observacion TEXT,
  fecha_hora  TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 6. USUARIOS (staff del sistema)
-- ============================================================
CREATE TABLE usuarios (
  id          SERIAL PRIMARY KEY,
  nombre      VARCHAR(150) NOT NULL,
  email       VARCHAR(150) UNIQUE NOT NULL,
  password    VARCHAR(255) NOT NULL,
  rol         VARCHAR(30) NOT NULL DEFAULT 'recepcion'
                CHECK (rol IN ('admin','tesorero','recepcion','instructor')),
  activo      BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- ÍNDICES DE RENDIMIENTO
-- ============================================================
CREATE INDEX idx_alumnos_dni         ON alumnos(dni);
CREATE INDEX idx_alumnos_sede        ON alumnos(sede);
CREATE INDEX idx_matriculas_alumno   ON matriculas(id_alumno);
CREATE INDEX idx_matriculas_estado   ON matriculas(estado);
CREATE INDEX idx_pagos_alumno        ON pagos(id_alumno);
CREATE INDEX idx_pagos_estado        ON pagos(estado);
CREATE INDEX idx_accesos_alumno      ON accesos(id_alumno);
CREATE INDEX idx_accesos_fecha       ON accesos(fecha_hora);

-- ============================================================
-- DATOS DE PRUEBA
-- ============================================================

-- Disciplinas
INSERT INTO disciplinas (nombre, descripcion, profesor, horario, sede, cupos_max, precio_mensual) VALUES
  ('Muay Thai',    'Arte marcial tailandés de golpes',      'Prof. Carlos Ríos',      'Lun/Mié/Vie 7:00–9:00am',  'Principal', 20, 150.00),
  ('BJJ',          'Brazilian Jiu-Jitsu – grappling',       'Prof. Diego Vargas',     'Mar/Jue 6:30–8:30pm',      'Principal', 15, 180.00),
  ('Kick Boxing',  'Boxeo con patadas – cardio y técnica',  'Prof. Ana Medina',       'Lun/Mié/Vie 6:00–7:30pm',  'Los Olivos', 25, 130.00),
  ('MMA',          'Mixed Martial Arts completo',           'Prof. Roberto Chávez',   'Mar/Jue/Sáb 8:00–10:00am', 'Principal', 12, 200.00),
  ('Judo',         'Arte marcial olímpico de proyecciones', 'Prof. Yuki Tanaka',      'Mié/Vie 5:00–7:00pm',      'Miraflores', 20, 140.00),
  ('Karate',       'Arte marcial japonés tradicional',      'Prof. Luis Mendoza',     'Lun/Mié 4:00–6:00pm',      'Los Olivos', 20, 120.00);

-- Alumnos
INSERT INTO alumnos (nombre, apellido_paterno, apellido_materno, dni, email, telefono, fecha_nacimiento, sede) VALUES
  ('Martín',    'Gómez',    'Silva',    '74521036', 'martin.gomez@email.com',    '987654321', '2000-03-15', 'Principal'),
  ('Ana',       'Torres',   'Vega',     '62384951', 'ana.torres@email.com',      '976543210', '1998-07-22', 'Principal'),
  ('Luis',      'Ramírez',  'Flores',   '58147263', 'luis.ramirez@email.com',    '965432109', '2002-11-08', 'Los Olivos'),
  ('Sofia',     'Castro',   'López',    '71293845', 'sofia.castro@email.com',    '954321098', '1995-04-30', 'Miraflores'),
  ('Carlos',    'Mendoza',  'Quispe',   '83746251', 'carlos.mendoza@email.com',  '943210987', '2001-09-14', 'Principal'),
  ('Lucía',     'Vargas',   'Pérez',    '94857362', 'lucia.vargas@email.com',    '932109876', '1999-12-25', 'Los Olivos');

-- Matrículas
INSERT INTO matriculas (id_alumno, id_disciplina, fecha_inicio, fecha_vencimiento, periodo_meses, precio_total, estado, activa) VALUES
  (1, 1, '2026-09-01', '2026-12-01', 3, 450.00, 'activa',    TRUE),
  (2, 2, '2026-10-01', '2027-01-01', 3, 540.00, 'activa',    TRUE),
  (3, 3, '2026-08-01', '2026-11-01', 3, 390.00, 'vencida',   FALSE),
  (4, 5, '2026-10-01', '2026-11-01', 1, 140.00, 'activa',    TRUE),
  (5, 4, '2026-09-01', '2026-12-01', 3, 600.00, 'activa',    TRUE),
  (6, 6, '2026-07-01', '2026-10-01', 3, 360.00, 'vencida',   FALSE);

-- Pagos
INSERT INTO pagos (id_alumno, id_matricula, monto, medio_pago, concepto, estado, fecha_confirmacion) VALUES
  (1, 1, 450.00, 'yape',         'Matrícula 3 meses – Muay Thai',   'aprobado',  NOW()),
  (2, 2, 540.00, 'transferencia','Matrícula 3 meses – BJJ',          'aprobado',  NOW()),
  (3, 3, 390.00, 'efectivo',     'Matrícula 3 meses – Kick Boxing',  'aprobado',  NOW()),
  (4, 4, 140.00, 'tarjeta',      'Matrícula 1 mes – Judo',           'pendiente', NULL),
  (5, 5, 600.00, 'plin',         'Matrícula 3 meses – MMA',          'aprobado',  NOW()),
  (6, 6, 360.00, 'efectivo',     'Matrícula 3 meses – Karate',       'rechazado', NOW()),
  (1, NULL, 150.00, 'yape',      'Renovación mensual – Muay Thai',   'pendiente', NULL),
  (2, NULL, 180.00, 'transferencia', 'Renovación mensual – BJJ',     'pendiente', NULL);

-- Accesos
INSERT INTO accesos (id_alumno, tipo, sede, resultado, observacion, fecha_hora) VALUES
  (1, 'ingreso', 'Principal', 'permitido', 'Acceso habilitado',   NOW() - INTERVAL '2 hours'),
  (1, 'salida',  'Principal', 'permitido', 'Salida registrada',   NOW() - INTERVAL '1 hour'),
  (2, 'ingreso', 'Principal', 'permitido', 'Acceso habilitado',   NOW() - INTERVAL '30 minutes'),
  (3, 'ingreso', 'Los Olivos','denegado',  'Matrícula vencida',   NOW() - INTERVAL '5 hours'),
  (5, 'ingreso', 'Principal', 'permitido', 'Acceso habilitado',   NOW() - INTERVAL '1 hour');

-- Usuario admin de prueba (password: admin123 — cambiar en producción)
INSERT INTO usuarios (nombre, email, password, rol) VALUES
  ('Administrador', 'admin@forcafitness.pe',    'admin123',    'admin'),
  ('Tesorero',      'tesorero@forcafitness.pe', 'tesorero123', 'tesorero'),
  ('Recepción',     'recepcion@forcafitness.pe','recepcion123','recepcion');
