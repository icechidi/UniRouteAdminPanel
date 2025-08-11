import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { databaseUrl } = await request.json()

    if (!databaseUrl || databaseUrl === "your_database_url") {
      return NextResponse.json({ message: "Please provide a valid database URL" }, { status: 400 })
    }

    const sql = neon(databaseUrl)

    // Define the new schema directly in the API route for initialization
    // This ensures the setup process uses the latest schema
    const schemaSql = `
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
    `
    await sql.unsafe(schemaSql)

    // Seed initial data
    const hashedPassword = await bcrypt.hash("password", 10)

    await sql`
      -- Insert Roles
      INSERT INTO roles (name) VALUES
      ('admin'),
      ('driver'),
      ('student')
      ON CONFLICT (name) DO NOTHING;
    `

    // Fetch role IDs
    const roles = await sql`SELECT role_id, name FROM roles;`
    const roleMap = roles.reduce((acc: any, role: any) => {
      acc[role.name] = role.role_id
      return acc
    }, {})

    await sql`
      -- Insert Users
      INSERT INTO users (role_id, first_name, last_name, username, password_hash, email, phone, country, language_pref) VALUES
      (${roleMap.admin}, 'Admin', 'User', 'admin', ${hashedPassword}, 'admin@uniroute.edu', '+1234567890', 'USA', 'en'),
      (${roleMap.driver}, 'Michael', 'Johnson', 'mjohnson', ${hashedPassword}, 'michael.j@uniroute.edu', '+1234567893', 'USA', 'en'),
      (${roleMap.driver}, 'Sarah', 'Williams', 'swilliams', ${hashedPassword}, 'sarah.w@uniroute.edu', '+1234567894', 'USA', 'en'),
      (${roleMap.student}, 'Student', 'User', 'student', ${hashedPassword}, 'student@uniroute.edu', '+1234567892', 'USA', 'en'),
      (${roleMap.student}, 'Alice', 'Johnson', 'ajohnson', ${hashedPassword}, 'alice.j@student.edu', '+1234567801', 'USA', 'en')
      ON CONFLICT (email) DO NOTHING;
    `

    // Fetch user IDs
    const users = await sql`SELECT user_id, email FROM users;`
    const userMap = users.reduce((acc: any, user: any) => {
      acc[user.email] = user.user_id
      return acc
    }, {})

    await sql`
      -- Insert Buses
      INSERT INTO buses (bus_number, license_plate, capacity, model, year, status) VALUES
      ('UNI-001', 'ABC-123', 45, 'Volvo B7R', 2020, 'active'),
      ('UNI-002', 'DEF-456', 50, 'Tata Starbus', 2021, 'active'),
      ('UNI-003', 'GHI-789', 40, 'Ashok Leyland', 2019, 'maintenance')
      ON CONFLICT (bus_number) DO NOTHING;
    `

    // Fetch bus IDs
    const buses = await sql`SELECT bus_id, bus_number FROM buses;`
    const busMap = buses.reduce((acc: any, bus: any) => {
      acc[bus.bus_number] = bus.bus_id
      return acc
    }, {})

    await sql`
      -- Insert Routes
      INSERT INTO routes (route_name, is_active) VALUES
      ('Campus to Downtown', TRUE),
      ('Campus to Airport', TRUE),
      ('Campus to Mall', TRUE)
      ON CONFLICT (route_name) DO NOTHING;
    `

    // Fetch route IDs
    const routes = await sql`SELECT route_id, route_name FROM routes;`
    const routeMap = routes.reduce((acc: any, route: any) => {
      acc[route.route_name] = route.route_id
      return acc
    }, {})

    await sql`
      -- Insert Route Stops
      INSERT INTO route_stops (route_id, stop_name, longitude, latitude, stop_order, arrival_time) VALUES
      (${routeMap['Campus to Downtown']}, 'University Campus', -77.0369, 38.9072, 1, '08:00:00'),
      (${routeMap['Campus to Downtown']}, 'Library Junction', -77.0450, 38.9150, 2, '08:10:00'),
      (${routeMap['Campus to Downtown']}, 'Downtown Station', -77.0200, 38.9000, 3, '08:25:00'),
      (${routeMap['Campus to Airport']}, 'University Campus', -77.0369, 38.9072, 1, '09:00:00'),
      (${routeMap['Campus to Airport']}, 'City Airport Terminal', -77.0000, 38.8500, 2, '09:30:00')
      ON CONFLICT DO NOTHING;
    `

    // Fetch route stop IDs
    const routeStops = await sql`SELECT route_stop_id, stop_name FROM route_stops;`
    const routeStopMap = routeStops.reduce((acc: any, stop: any) => {
      acc[stop.stop_name] = stop.route_stop_id
      return acc
    }, {})

    await sql`
      -- Insert Schedules
      INSERT INTO schedules (route_id, bus_id, driver_user_id, type_of_schedule, start_date, end_date, days_of_week, is_active) VALUES
      (${routeMap['Campus to Downtown']}, ${busMap['UNI-001']}, ${userMap['michael.j@uniroute.edu']}, 'weekly', NULL, NULL, '["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]'::jsonb, TRUE),
      (${routeMap['Campus to Airport']}, ${busMap['UNI-002']}, ${userMap['sarah.w@uniroute.edu']}, 'daily', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', NULL, TRUE)
      ON CONFLICT DO NOTHING;
    `

    // Fetch schedule IDs
    const schedules = await sql`SELECT schedule_id, route_id, bus_id FROM schedules;`
    const scheduleMap = schedules.reduce((acc: any, sched: any) => {
      acc[`${sched.route_id}-${sched.bus_id}`] = sched.schedule_id
      return acc
    }, {})

    await sql`
      -- Insert Bus Times for Campus to Downtown (Schedule 1)
      INSERT INTO bus_times (schedule_id, route_stop_id, scheduled_departure_time, scheduled_arrival_time) VALUES
      (${scheduleMap[`${routeMap['Campus to Downtown']}-${busMap['UNI-001']}`]}, ${routeStopMap['University Campus']}, '08:00:00', '08:00:00'),
      (${scheduleMap[`${routeMap['Campus to Downtown']}-${busMap['UNI-001']}`]}, ${routeStopMap['Library Junction']}, '08:10:00', '08:10:00'),
      (${scheduleMap[`${routeMap['Campus to Downtown']}-${busMap['UNI-001']}`]}, ${routeStopMap['Downtown Station']}, '08:25:00', '08:25:00');

      -- Insert Bus Times for Campus to Airport (Schedule 2)
      INSERT INTO bus_times (schedule_id, route_stop_id, scheduled_departure_time, scheduled_arrival_time) VALUES
      (${scheduleMap[`${routeMap['Campus to Airport']}-${busMap['UNI-002']}`]}, ${routeStopMap['University Campus']}, '09:00:00', '09:00:00'),
      (${scheduleMap[`${routeMap['Campus to Airport']}-${busMap['UNI-002']}`]}, ${routeStopMap['City Airport Terminal']}, '09:30:00', '09:30:00');
    `

    await sql`
      -- Insert Messages
      INSERT INTO messages (message_text, category) VALUES
      ('Emergency: Bus UNI-001 breakdown near Library Junction. Assistance dispatched.', 'emergency'),
      ('Reminder: Your 8 AM bus to Downtown is on schedule.', 'schedule'),
      ('Welcome to UniRoute Admin Dashboard!', 'admin'),
      ('New route added: Campus to Hospital.', 'admin'),
      ('Driver Michael Johnson has started his shift.', 'driver'),
      ('Great service today!', 'feedback'),
      ('Bus UNI-003 is currently under maintenance.', 'admin')
      ON CONFLICT DO NOTHING;
    `

    await sql`
      -- Insert Semester Schedules
      INSERT INTO semester_schedules (academic_year, semester, start_date, end_date, holidays) VALUES
      ('2023-2024', 'fall', '2023-09-01', '2023-12-15', '[{"date": "2023-11-23", "name": "Thanksgiving"}]'::jsonb),
      ('2023-2024', 'spring', '2024-01-10', '2024-05-20', '[{"date": "2024-03-15", "name": "Spring Break"}]'::jsonb)
      ON CONFLICT (academic_year, semester) DO NOTHING;
    `

    await sql`
      -- Insert Settings
      INSERT INTO settings (key, value, description) VALUES
      ('system_name', 'UniRoute', 'System name'),
      ('max_capacity_per_bus', '50', 'Maximum capacity per bus'),
      ('booking_advance_days', '7', 'Days in advance booking is allowed'),
      ('support_email', 'support@uniroute.edu', 'Support email address'),
      ('support_phone', '+1234567890', 'Support phone number')
      ON CONFLICT (key) DO NOTHING;
    `

    // Store the database URL in environment (this would typically be done differently in production)
    process.env.DATABASE_URL = databaseUrl

    return NextResponse.json({ success: true, message: "Database initialized successfully" })
  } catch (error) {
    console.error("Database initialization failed:", error)
    return NextResponse.json({ message: "Database initialization failed" }, { status: 500 })
  }
}
