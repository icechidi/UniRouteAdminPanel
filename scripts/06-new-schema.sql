-- Drop existing tables if they exist to ensure a clean rebuild
DROP TABLE IF EXISTS user_activity_logs CASCADE;
DROP TABLE IF EXISTS schedule_notifications CASCADE;
DROP TABLE IF EXISTS emergency_notifications CASCADE;
DROP TABLE IF EXISTS bus_times CASCADE;
DROP TABLE IF EXISTS student_bookings CASCADE; -- This table is being replaced
DROP TABLE IF EXISTS schedules CASCADE;
DROP TABLE IF EXISTS route_stops CASCADE;
DROP TABLE IF EXISTS routes CASCADE;
DROP TABLE IF EXISTS buses CASCADE;
DROP TABLE IF EXISTS drivers CASCADE; -- Drivers are now users with a role
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS semester_schedules CASCADE;
DROP TABLE IF EXISTS settings CASCADE;

-- 1. Roles Table
CREATE TABLE IF NOT EXISTS roles (
    role_id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL -- e.g., 'admin', 'driver', 'student'
);

-- 2. Users Table
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    role_id INTEGER REFERENCES roles(role_id) ON DELETE SET NULL, -- Link to roles table
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    username VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255), -- For manual logins
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    country VARCHAR(100),
    photo_url VARCHAR(500),
    language_pref VARCHAR(10),
    unique_id UUID DEFAULT gen_random_uuid(), -- Unique identifier for external systems/tracking
    google_id VARCHAR(255), -- For Google OAuth
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Buses Table
CREATE TABLE IF NOT EXISTS buses (
    bus_id SERIAL PRIMARY KEY,
    bus_number VARCHAR(50) UNIQUE NOT NULL,
    license_plate VARCHAR(50) UNIQUE,
    capacity INTEGER NOT NULL,
    model VARCHAR(100),
    year INTEGER,
    status VARCHAR(20) DEFAULT 'active', -- e.g., 'active', 'maintenance', 'inactive'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Messages Table
CREATE TYPE MESSAGE_CATEGORY AS ENUM ('emergency', 'schedule', 'admin', 'driver', 'feedback');
CREATE TABLE IF NOT EXISTS messages (
    message_id SERIAL PRIMARY KEY,
    message_text TEXT NOT NULL,
    category MESSAGE_CATEGORY NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Routes Table
CREATE TABLE IF NOT EXISTS routes (
    route_id SERIAL PRIMARY KEY,
    route_name VARCHAR(255) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. RouteStops Table
CREATE TABLE IF NOT EXISTS route_stops (
    route_stop_id SERIAL PRIMARY KEY,
    route_id INTEGER REFERENCES routes(route_id) ON DELETE CASCADE,
    stop_name VARCHAR(255) NOT NULL,
    longitude DECIMAL(10,7),
    latitude DECIMAL(10,7),
    stop_order INTEGER NOT NULL,
    arrival_time TIME, -- Expected arrival time at this stop
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. EmergencyNotification Table
CREATE TABLE IF NOT EXISTS emergency_notifications (
    notification_id SERIAL PRIMARY KEY,
    route_id INTEGER REFERENCES routes(route_id) ON DELETE SET NULL,
    bus_id INTEGER REFERENCES buses(bus_id) ON DELETE SET NULL,
    user_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL, -- Driver who triggered it
    message_id INTEGER REFERENCES messages(message_id) ON DELETE SET NULL, -- Emergency message
    triggered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    location_longitude DECIMAL(10,7), -- Current location of emergency
    location_latitude DECIMAL(10,7),
    status VARCHAR(50) DEFAULT 'active' -- e.g., 'active', 'resolved'
);

-- 8. Schedules Table (Recurring schedule definitions)
CREATE TYPE SCHEDULE_TYPE AS ENUM ('weekly', 'daily', 'semester');
CREATE TABLE IF NOT EXISTS schedules (
    schedule_id SERIAL PRIMARY KEY,
    route_id INTEGER REFERENCES routes(route_id) ON DELETE CASCADE,
    bus_id INTEGER REFERENCES buses(bus_id) ON DELETE SET NULL,
    driver_user_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL, -- User with 'driver' role
    type_of_schedule SCHEDULE_TYPE NOT NULL,
    start_date DATE, -- For daily/semester schedules
    end_date DATE,   -- For daily/semester schedules
    days_of_week JSONB, -- e.g., '["Monday", "Wednesday", "Friday"]' for weekly
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. ScheduleNotification Table
CREATE TABLE IF NOT EXISTS schedule_notifications (
    schedule_notification_id SERIAL PRIMARY KEY,
    message_id INTEGER REFERENCES messages(message_id) ON DELETE CASCADE, -- Schedule-related message
    schedule_id INTEGER REFERENCES schedules(schedule_id) ON DELETE CASCADE,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. SemesterSchedule Table
CREATE TYPE SEMESTER_TYPE AS ENUM ('fall', 'spring', 'summer', 'winter');
CREATE TABLE IF NOT EXISTS semester_schedules (
    sem_schedule_id SERIAL PRIMARY KEY,
    academic_year VARCHAR(9) NOT NULL, -- e.g., '2023-2024'
    semester SEMESTER_TYPE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    holidays JSONB, -- e.g., '[{"date": "2023-12-25", "name": "Christmas"}]'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (academic_year, semester)
);

-- 11. BusTime Table (Specific times a bus is at a stop for a given schedule)
CREATE TABLE IF NOT EXISTS bus_times (
    bus_time_id SERIAL PRIMARY KEY,
    schedule_id INTEGER REFERENCES schedules(schedule_id) ON DELETE CASCADE,
    route_stop_id INTEGER REFERENCES route_stops(route_stop_id) ON DELETE CASCADE,
    scheduled_departure_time TIME NOT NULL,
    scheduled_arrival_time TIME NOT NULL,
    actual_departure_time TIME, -- For real-time tracking
    actual_arrival_time TIME,   -- For real-time tracking
    status VARCHAR(50) DEFAULT 'on_time', -- e.g., 'on_time', 'delayed', 'completed'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. Settings Table (Keep as is, but ensure it's created)
CREATE TABLE IF NOT EXISTS settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 13. Sessions Table (Keep as is, but ensure it's created)
CREATE TABLE IF NOT EXISTS sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 14. User Activity Logs
CREATE TABLE IF NOT EXISTS user_activity_logs (
    log_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    activity_type VARCHAR(100) NOT NULL, -- e.g., 'login', 'logout', 'view_page', 'create_bus'
    details JSONB, -- Additional details about the activity
    ip_address VARCHAR(45),
    user_agent TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_buses_status ON buses(status);
CREATE INDEX IF NOT EXISTS idx_routes_is_active ON routes(is_active);
CREATE INDEX IF NOT EXISTS idx_route_stops_route_id ON route_stops(route_id);
CREATE INDEX IF NOT EXISTS idx_schedules_route_id ON schedules(route_id);
CREATE INDEX IF NOT EXISTS idx_schedules_bus_id ON schedules(bus_id);
CREATE INDEX IF NOT EXISTS idx_schedules_driver_user_id ON schedules(driver_user_id);
CREATE INDEX IF NOT EXISTS idx_bus_times_schedule_id ON bus_times(schedule_id);
CREATE INDEX IF NOT EXISTS idx_bus_times_route_stop_id ON bus_times(route_stop_id);
CREATE INDEX IF NOT EXISTS idx_emergency_notifications_route_id ON emergency_notifications(route_id);
CREATE INDEX IF NOT EXISTS idx_emergency_notifications_bus_id ON emergency_notifications(bus_id);
CREATE INDEX IF NOT EXISTS idx_emergency_notifications_user_id ON emergency_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_category ON messages(category);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_user_id ON user_activity_logs(user_id);
