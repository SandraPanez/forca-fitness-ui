-- Datos de demostración. Ejecutar solo en una base local/de prueba.

INSERT INTO disciplinas (nombre, descripcion, profesor, horario, sede, cupos_max, precio_mensual) VALUES
  ('Muay Thai',    'Arte marcial tailandés de golpes',      'Prof. Carlos Ríos',    'Lun/Mié/Vie 7:00–9:00am',  'Principal', 20, 150.00),
  ('BJJ',          'Brazilian Jiu-Jitsu – grappling',       'Prof. Diego Vargas',   'Mar/Jue 6:30–8:30pm',      'Principal', 15, 180.00),
  ('Kick Boxing',  'Boxeo con patadas – cardio y técnica',  'Prof. Ana Medina',     'Lun/Mié/Vie 6:00–7:30pm',  'Los Olivos', 25, 130.00),
  ('MMA',          'Mixed Martial Arts completo',           'Prof. Roberto Chávez', 'Mar/Jue/Sáb 8:00–10:00am', 'Principal', 12, 200.00),
  ('Judo',         'Arte marcial olímpico de proyecciones', 'Prof. Yuki Tanaka',    'Mié/Vie 5:00–7:00pm',      'Miraflores', 20, 140.00),
  ('Karate',       'Arte marcial japonés tradicional',      'Prof. Luis Mendoza',   'Lun/Mié 4:00–6:00pm',      'Los Olivos', 20, 120.00);

INSERT INTO alumnos (nombre, apellido_paterno, apellido_materno, dni, email, telefono, fecha_nacimiento, sede) VALUES
  ('Martín', 'Gómez', 'Silva', '74521036', 'martin.gomez@forcafitness.com', '987654321', '2000-03-15', 'Principal'),
  ('Ana', 'Torres', 'Vega', '62384951', 'ana.torres@email.com', '976543210', '1998-07-22', 'Principal'),
  ('Luis', 'Ramírez', 'Flores', '58147263', 'luis.ramirez@email.com', '965432109', '2002-11-08', 'Los Olivos'),
  ('Sofia', 'Castro', 'López', '71293845', 'sofia.castro@email.com', '954321098', '1995-04-30', 'Miraflores'),
  ('Carlos', 'Mendoza', 'Quispe', '83746251', 'carlos.mendoza@email.com', '943210987', '2001-09-14', 'Principal'),
  ('Lucía', 'Vargas', 'Pérez', '94857362', 'lucia.vargas@email.com', '932109876', '1999-12-25', 'Los Olivos');

INSERT INTO matriculas (id_alumno, id_disciplina, fecha_inicio, fecha_vencimiento, periodo_meses, precio_total, estado, activa) VALUES
  (1, 1, '2026-09-01', '2026-12-01', 3, 450.00, 'activa', TRUE),
  (2, 2, '2026-10-01', '2027-01-01', 3, 540.00, 'activa', TRUE),
  (3, 3, '2026-08-01', '2026-11-01', 3, 390.00, 'vencida', FALSE),
  (4, 5, '2026-10-01', '2026-11-01', 1, 140.00, 'activa', TRUE),
  (5, 4, '2026-09-01', '2026-12-01', 3, 600.00, 'activa', TRUE),
  (6, 6, '2026-07-01', '2026-10-01', 3, 360.00, 'vencida', FALSE);

INSERT INTO pagos (id_alumno, id_matricula, monto, medio_pago, concepto, estado, fecha_confirmacion) VALUES
  (1, 1, 450.00, 'yape', 'Matrícula 3 meses – Muay Thai', 'aprobado', NOW()),
  (2, 2, 540.00, 'transferencia', 'Matrícula 3 meses – BJJ', 'aprobado', NOW()),
  (3, 3, 390.00, 'efectivo', 'Matrícula 3 meses – Kick Boxing', 'aprobado', NOW()),
  (4, 4, 140.00, 'tarjeta', 'Matrícula 1 mes – Judo', 'pendiente', NULL),
  (5, 5, 600.00, 'plin', 'Matrícula 3 meses – MMA', 'aprobado', NOW()),
  (6, 6, 360.00, 'efectivo', 'Matrícula 3 meses – Karate', 'rechazado', NOW()),
  (1, NULL, 150.00, 'yape', 'Renovación mensual – Muay Thai', 'pendiente', NULL),
  (2, NULL, 180.00, 'transferencia', 'Renovación mensual – BJJ', 'pendiente', NULL);

INSERT INTO accesos (id_alumno, tipo, sede, resultado, observacion, fecha_hora) VALUES
  (1, 'ingreso', 'Principal', 'permitido', 'Acceso habilitado', NOW() - INTERVAL '2 hours'),
  (1, 'salida', 'Principal', 'permitido', 'Salida registrada', NOW() - INTERVAL '1 hour'),
  (2, 'ingreso', 'Principal', 'permitido', 'Acceso habilitado', NOW() - INTERVAL '30 minutes'),
  (3, 'ingreso', 'Los Olivos', 'denegado', 'Matrícula vencida', NOW() - INTERVAL '5 hours'),
  (5, 'ingreso', 'Principal', 'permitido', 'Acceso habilitado', NOW() - INTERVAL '1 hour');
