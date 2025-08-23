-- Add route_times table to store multiple time slots for each route
CREATE TABLE IF NOT EXISTS route_times (
  route_time_id SERIAL PRIMARY KEY,
  route_id INTEGER NOT NULL REFERENCES routes(route_id) ON DELETE CASCADE,
  departure_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_route_times_route_id ON route_times(route_id);
CREATE INDEX IF NOT EXISTS idx_route_times_departure_time ON route_times(departure_time);

-- Update route_stops to include estimated_duration (minutes from route start)
ALTER TABLE route_stops 
ADD COLUMN IF NOT EXISTS estimated_duration INTEGER DEFAULT 0;

-- Update the arrival_time to be calculated based on route_times + estimated_duration
-- We'll keep arrival_time for backward compatibility but it will be calculated

-- Insert sample route times for existing routes
INSERT INTO route_times (route_id, departure_time) VALUES
(1, '07:45:00'),
(1, '09:45:00'),
(1, '11:45:00'),
(1, '12:45:00'),
(1, '13:45:00'),
(1, '15:45:00'),
(1, '17:30:00'),
(1, '19:45:00'),
(2, '08:00:00'),
(2, '10:00:00'),
(2, '14:00:00'),
(2, '16:00:00'),
(2, '18:00:00');

-- Update existing route_stops with estimated durations
UPDATE route_stops SET estimated_duration = 0 WHERE stop_order = 1;
UPDATE route_stops SET estimated_duration = 10 WHERE stop_order = 2;
UPDATE route_stops SET estimated_duration = 25 WHERE stop_order = 3;
UPDATE route_stops SET estimated_duration = 30 WHERE stop_order = 4;
UPDATE route_stops SET estimated_duration = 60 WHERE stop_order = 5;
