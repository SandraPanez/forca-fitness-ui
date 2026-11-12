DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM disciplinas WHERE cupos_max IS NULL OR cupos_max < 0
  ) THEN
    RAISE EXCEPTION 'Corrige los valores nulos o negativos de disciplinas.cupos_max antes de aplicar esta migración';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'disciplinas_cupos_max_nonnegative'
      AND conrelid = 'disciplinas'::regclass
  ) THEN
    ALTER TABLE disciplinas
      ADD CONSTRAINT disciplinas_cupos_max_nonnegative CHECK (cupos_max >= 0);
  END IF;
END $$;

ALTER TABLE disciplinas
  ALTER COLUMN cupos_max SET NOT NULL;
