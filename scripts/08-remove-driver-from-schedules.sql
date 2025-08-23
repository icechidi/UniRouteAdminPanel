-- Remove driver_user_id from schedules table
ALTER TABLE schedules DROP COLUMN IF EXISTS driver_user_id;

-- Update schedules to work with academic schedules
-- Add reference to semester schedule
ALTER TABLE schedules 
ADD COLUMN IF NOT EXISTS sem_schedule_id INTEGER REFERENCES semester_schedules(sem_schedule_id) ON DELETE SET NULL;

-- Update existing schedules to use current academic year
UPDATE schedules 
SET sem_schedule_id = (
  SELECT sem_schedule_id 
  FROM semester_schedules 
  WHERE academic_year = '2023-2024' 
  AND semester = 'fall' 
  LIMIT 1
)
WHERE sem_schedule_id IS NULL;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_schedules_sem_schedule_id ON schedules(sem_schedule_id);

-- Update bus_times to remove dependency on driver
-- The bus_times table already has schedule_id and route_stop_id, so no changes needed there
