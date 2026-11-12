BEGIN;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = 'usuarios'
      AND column_name = 'password'
  ) AND EXISTS (SELECT 1 FROM usuarios) THEN
    RAISE EXCEPTION 'usuarios contiene contraseñas heredadas. Migra o restablece esas cuentas de forma segura antes de continuar';
  END IF;

  IF EXISTS (
    SELECT LOWER(email)
    FROM usuarios
    GROUP BY LOWER(email)
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'Hay correos duplicados sin distinguir mayúsculas/minúsculas en usuarios.email';
  END IF;
END $$;

ALTER TABLE usuarios
  ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255),
  ADD COLUMN IF NOT EXISTS alumno_id INTEGER;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = 'usuarios'
      AND column_name = 'password'
  ) THEN
    ALTER TABLE usuarios DROP COLUMN password;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'usuarios_alumno_id_fkey'
      AND conrelid = 'usuarios'::regclass
  ) THEN
    ALTER TABLE usuarios
      ADD CONSTRAINT usuarios_alumno_id_fkey
      FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE RESTRICT;
  END IF;
END $$;

ALTER TABLE usuarios
  ALTER COLUMN password_hash SET NOT NULL,
  ALTER COLUMN activo SET NOT NULL,
  ALTER COLUMN activo SET DEFAULT TRUE;

ALTER TABLE usuarios
  DROP CONSTRAINT IF EXISTS usuarios_rol_check,
  DROP CONSTRAINT IF EXISTS usuarios_rol_valid_role_check,
  DROP CONSTRAINT IF EXISTS usuarios_rol_alumno_link_check;

ALTER TABLE usuarios
  ADD CONSTRAINT usuarios_rol_valid_role_check
    CHECK (rol IN ('admin','tesorero','recepcion','instructor','alumno')),
  ADD CONSTRAINT usuarios_rol_alumno_link_check
    CHECK ((rol = 'alumno' AND alumno_id IS NOT NULL) OR (rol <> 'alumno' AND alumno_id IS NULL));

CREATE UNIQUE INDEX IF NOT EXISTS idx_usuarios_alumno_id_unique
  ON usuarios (alumno_id)
  WHERE alumno_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_usuarios_email_lower_unique
  ON usuarios (LOWER(email));

COMMIT;
