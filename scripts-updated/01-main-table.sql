BEGIN;

-- 1. Roles
CREATE TABLE IF NOT EXISTS roles (
    role_id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

INSERT INTO roles (name) VALUES
('admin'),
('driver'),
('student')
ON CONFLICT (name) DO NOTHING;

-- 2. Users
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    role_id INTEGER NOT NULL REFERENCES roles(role_id) ON DELETE CASCADE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    country VARCHAR(50),
    language_pref VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (
    role_id, first_name, last_name, username, password_hash, email, phone, country, language_pref
)
VALUES (
    (SELECT role_id FROM roles WHERE name = 'admin'),
    'System',
    'Administrator',
    'admin',
    '$2b$10$h5vEphdR1ZsL9ZtRbZd9qe7xNZZ6HvZX.DQmnn/uhB4nH3Q9xdpYK',
    'admin@uniroute.edu',
    '+1-555-000-0000',
    'USA',
    'en'
)
ON CONFLICT (username) DO NOTHING;

-- 3. Buses
CREATE TABLE IF NOT EXISTS buses (
    bus_id SERIAL PRIMARY KEY,
    bus_number VARCHAR(50) UNIQUE NOT NULL,
    license_plate VARCHAR(20) UNIQUE NOT NULL,
    capacity INTEGER NOT NULL,
    model VARCHAR(50),
    year INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO buses (bus_number, license_plate, capacity, model, year)
VALUES
('Bus-101', 'ABC-1234', 50, 'Volvo B9R', 2018),
('Bus-102', 'XYZ-5678', 45, 'Mercedes Tourismo', 2019)
ON CONFLICT (bus_number) DO NOTHING;

-- 4. Routes
CREATE TABLE IF NOT EXISTS routes (
    route_id SERIAL PRIMARY KEY,
    route_name VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO routes (route_name) VALUES
('North Campus Loop'),
('City Center Express')
ON CONFLICT (route_name) DO NOTHING;

-- 5. Route Stops
CREATE TABLE IF NOT EXISTS route_stops (
    stop_id SERIAL PRIMARY KEY,
    route_id INTEGER NOT NULL REFERENCES routes(route_id) ON DELETE CASCADE,
    stop_name VARCHAR(100) NOT NULL,
    longitude DOUBLE PRECISION,
    latitude DOUBLE PRECISION,
    stop_order INTEGER NOT NULL,
    arrival_time TIME,
    estimated_duration INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO route_stops (route_id, stop_name, longitude, latitude, stop_order, arrival_time)
VALUES
((SELECT route_id FROM routes WHERE route_name = 'North Campus Loop'), 'North Gate', -122.406417, 37.785834, 1, '08:00:00'),
((SELECT route_id FROM routes WHERE route_name = 'North Campus Loop'), 'Library Stop', -122.405000, 37.786500, 2, '08:10:00'),
((SELECT route_id FROM routes WHERE route_name = 'City Center Express'), 'Main Station', -122.401000, 37.790000, 1, '08:30:00')
ON CONFLICT DO NOTHING;

-- 6. Route Times
CREATE TABLE IF NOT EXISTS route_times (
    route_time_id SERIAL PRIMARY KEY,
    route_id INTEGER NOT NULL REFERENCES routes(route_id) ON DELETE CASCADE,
    departure_time TIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_route_times_route_id ON route_times(route_id);
CREATE INDEX IF NOT EXISTS idx_route_times_departure_time ON route_times(departure_time);

-- Insert sample route times dynamically
INSERT INTO route_times (route_id, departure_time) VALUES
((SELECT route_id FROM routes WHERE route_name = 'North Campus Loop'), '07:45:00'),
((SELECT route_id FROM routes WHERE route_name = 'North Campus Loop'), '09:45:00'),
((SELECT route_id FROM routes WHERE route_name = 'North Campus Loop'), '11:45:00'),
((SELECT route_id FROM routes WHERE route_name = 'North Campus Loop'), '12:45:00'),
((SELECT route_id FROM routes WHERE route_name = 'North Campus Loop'), '13:45:00'),
((SELECT route_id FROM routes WHERE route_name = 'North Campus Loop'), '15:45:00'),
((SELECT route_id FROM routes WHERE route_name = 'North Campus Loop'), '17:30:00'),
((SELECT route_id FROM routes WHERE route_name = 'North Campus Loop'), '19:45:00'),
((SELECT route_id FROM routes WHERE route_name = 'City Center Express'), '08:00:00'),
((SELECT route_id FROM routes WHERE route_name = 'City Center Express'), '10:00:00'),
((SELECT route_id FROM routes WHERE route_name = 'City Center Express'), '14:00:00'),
((SELECT route_id FROM routes WHERE route_name = 'City Center Express'), '16:00:00'),
((SELECT route_id FROM routes WHERE route_name = 'City Center Express'), '18:00:00');

-- 7. Update estimated durations for route stops
UPDATE route_stops SET estimated_duration = 0 WHERE stop_order = 1;
UPDATE route_stops SET estimated_duration = 10 WHERE stop_order = 2;
UPDATE route_stops SET estimated_duration = 25 WHERE stop_order = 3;
UPDATE route_stops SET estimated_duration = 30 WHERE stop_order = 4;
UPDATE route_stops SET estimated_duration = 60 WHERE stop_order = 5;

-- 8. Messages
CREATE TABLE IF NOT EXISTS messages (
    message_id SERIAL PRIMARY KEY,
    message_text TEXT NOT NULL,
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO messages (message_text, category)
VALUES
('Emergency: Engine failure on Bus-101', 'emergency'),
('Route 1 schedule update: delayed by 10 minutes', 'schedule')
ON CONFLICT DO NOTHING;

COMMIT;


----------------------------------MAIN--------------------------------------------------
--Similar script same as above but added view for next upcoming route schedule
BEGIN;

-- 1. Roles
INSERT INTO roles (name) VALUES
('admin'),
('driver'),
('student')
ON CONFLICT (name) DO NOTHING;

-- 2. Users (bcrypt hash for "AdminPass123!")
INSERT INTO users (
    role_id, first_name, last_name, username, password_hash, email, phone, country, language_pref
)
VALUES (
    (SELECT role_id FROM roles WHERE name = 'admin'),
    'System',
    'Administrator',
    'admin',
    '$2b$10$h5vEphdR1ZsL9ZtRbZd9qe7xNZZ6HvZX.DQmnn/uhB4nH3Q9xdpYK',
    'admin@uniroute.edu',
    '+1-555-000-0000',
    'USA',
    'en'
)
ON CONFLICT (username) DO NOTHING;

-- 3. Buses
INSERT INTO buses (bus_number, license_plate, capacity, model, year)
VALUES
('Bus-101', 'ABC-1234', 50, 'Volvo B9R', 2018),
('Bus-102', 'XYZ-5678', 45, 'Mercedes Tourismo', 2019)
ON CONFLICT (bus_number) DO NOTHING;

-- 4. Routes details
INSERT INTO routes (route_name) VALUES
('North Campus Loop'),
('City Center Express')
ON CONFLICT (route_name) DO NOTHING;

-- 5. Route Stops 
INSERT INTO route_stops (route_id, stop_name, longitude, latitude, stop_order, arrival_time, estimated_duration)
VALUES
((SELECT route_id FROM routes WHERE route_name = 'North Campus Loop'), 'North Gate', -122.406417, 37.785834, 1, '08:00:00', 0),
((SELECT route_id FROM routes WHERE route_name = 'North Campus Loop'), 'Library Stop', -122.405000, 37.786500, 2, '08:10:00', 10),
((SELECT route_id FROM routes WHERE route_name = 'North Campus Loop'), 'Main Hall', -122.404500, 37.787000, 3, '08:25:00', 25),
((SELECT route_id FROM routes WHERE route_name = 'North Campus Loop'), 'Cafeteria', -122.404000, 37.787500, 4, '08:30:00', 30),
((SELECT route_id FROM routes WHERE route_name = 'North Campus Loop'), 'South Gate', -122.403500, 37.788000, 5, '09:00:00', 60),
((SELECT route_id FROM routes WHERE route_name = 'City Center Express'), 'Main Station', -122.401000, 37.790000, 1, '08:30:00', 0);

-- 6. Route Times
INSERT INTO route_times (route_id, departure_time) VALUES
((SELECT route_id FROM routes WHERE route_name = 'North Campus Loop'), '07:45:00'),
((SELECT route_id FROM routes WHERE route_name = 'North Campus Loop'), '09:45:00'),
((SELECT route_id FROM routes WHERE route_name = 'North Campus Loop'), '11:45:00'),
((SELECT route_id FROM routes WHERE route_name = 'North Campus Loop'), '12:45:00'),
((SELECT route_id FROM routes WHERE route_name = 'North Campus Loop'), '13:45:00'),
((SELECT route_id FROM routes WHERE route_name = 'North Campus Loop'), '15:45:00'),
((SELECT route_id FROM routes WHERE route_name = 'North Campus Loop'), '17:30:00'),
((SELECT route_id FROM routes WHERE route_name = 'North Campus Loop'), '19:45:00'),
((SELECT route_id FROM routes WHERE route_name = 'City Center Express'), '08:00:00'),
((SELECT route_id FROM routes WHERE route_name = 'City Center Express'), '10:00:00'),
((SELECT route_id FROM routes WHERE route_name = 'City Center Express'), '14:00:00'),
((SELECT route_id FROM routes WHERE route_name = 'City Center Express'), '16:00:00'),
((SELECT route_id FROM routes WHERE route_name = 'City Center Express'), '18:00:00');

-- 7. Messages
INSERT INTO messages (message_text, category)
VALUES
('Emergency: Engine failure on Bus-101', 'emergency'),
('Route 1 schedule update: delayed by 10 minutes', 'schedule')
ON CONFLICT DO NOTHING;

COMMIT;

-- 8. Create view for next upcoming route schedule
DROP VIEW IF EXISTS next_route_schedule;

CREATE VIEW next_route_schedule AS
WITH next_departures AS (
    SELECT
        rt.route_time_id,
        rt.route_id,
        rt.departure_time,
        ROW_NUMBER() OVER (PARTITION BY rt.route_id ORDER BY rt.departure_time) AS rn
    FROM route_times rt
    WHERE rt.is_active = TRUE
      AND rt.departure_time >= CURRENT_TIME
)
SELECT
    r.route_name,
    rs.stop_order,
    rs.stop_name,
    (nd.departure_time + (rs.estimated_duration * INTERVAL '1 minute')) AS arrival_time,
    nd.departure_time AS route_departure_time
FROM next_departures nd
JOIN routes r ON nd.route_id = r.route_id
JOIN route_stops rs ON r.route_id = rs.route_id
WHERE nd.rn = 1
ORDER BY r.route_name, rs.stop_order;
