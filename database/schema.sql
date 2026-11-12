-- ============================================================
--  FORCA & FITNESS — Esquema de Base de Datos PostgreSQL
--  Proyecto: Arquitectura de Software — USMP Ciclo 7
--  Profesor: Ing. Fred Duarte
-- ============================================================

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
  cupos_max       INTEGER NOT NULL DEFAULT 20
                    CONSTRAINT disciplinas_cupos_max_nonnegative CHECK (cupos_max >= 0),
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
