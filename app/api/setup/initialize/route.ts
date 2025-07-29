import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function POST(request: NextRequest) {
  try {
    const { databaseUrl } = await request.json()

    if (!databaseUrl || databaseUrl === "your_neon_database_url") {
      return NextResponse.json({ message: "Please provide a valid database URL" }, { status: 400 })
    }

    const sql = neon(databaseUrl)

    // Create all tables and insert initial data
    await sql`
      -- Create database schema for UniRoute system

      -- Users table for authentication and user management
      CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          role VARCHAR(50) DEFAULT 'user',
          phone VARCHAR(20),
          password_hash VARCHAR(255),
          google_id VARCHAR(255),
          avatar_url VARCHAR(500),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Drivers table
      CREATE TABLE IF NOT EXISTS drivers (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          phone VARCHAR(20) NOT NULL,
          license_number VARCHAR(50) UNIQUE NOT NULL,
          experience_years INTEGER DEFAULT 0,
          status VARCHAR(20) DEFAULT 'active',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Buses table
      CREATE TABLE IF NOT EXISTS buses (
          id SERIAL PRIMARY KEY,
          bus_number VARCHAR(50) UNIQUE NOT NULL,
          capacity INTEGER NOT NULL,
          model VARCHAR(100),
          year INTEGER,
          status VARCHAR(20) DEFAULT 'active',
          driver_id INTEGER REFERENCES drivers(id),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Routes table
      CREATE TABLE IF NOT EXISTS routes (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          from_location VARCHAR(255) NOT NULL,
          to_location VARCHAR(255) NOT NULL,
          distance_km DECIMAL(10,2),
          estimated_duration INTEGER,
          status VARCHAR(20) DEFAULT 'active',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Route stops table
      CREATE TABLE IF NOT EXISTS route_stops (
          id SERIAL PRIMARY KEY,
          route_id INTEGER REFERENCES routes(id) ON DELETE CASCADE,
          stop_name VARCHAR(255) NOT NULL,
          stop_order INTEGER NOT NULL,
          arrival_time TIME,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Schedules table
      CREATE TABLE IF NOT EXISTS schedules (
          id SERIAL PRIMARY KEY,
          route_id INTEGER REFERENCES routes(id),
          bus_id INTEGER REFERENCES buses(id),
          driver_id INTEGER REFERENCES drivers(id),
          departure_time TIME NOT NULL,
          arrival_time TIME NOT NULL,
          days_of_week VARCHAR(200) NOT NULL,
          status VARCHAR(20) DEFAULT 'active',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Student bookings table
      CREATE TABLE IF NOT EXISTS student_bookings (
          id SERIAL PRIMARY KEY,
          student_name VARCHAR(255) NOT NULL,
          student_email VARCHAR(255) NOT NULL,
          student_id VARCHAR(50) NOT NULL,
          phone VARCHAR(20),
          schedule_id INTEGER REFERENCES schedules(id),
          booking_date DATE NOT NULL,
          pickup_stop VARCHAR(255) NOT NULL,
          drop_stop VARCHAR(255) NOT NULL,
          status VARCHAR(20) DEFAULT 'confirmed',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Sessions table for authentication
      CREATE TABLE IF NOT EXISTS sessions (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          session_token VARCHAR(255) UNIQUE NOT NULL,
          expires_at TIMESTAMP NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Settings table for system configuration
      CREATE TABLE IF NOT EXISTS settings (
          id SERIAL PRIMARY KEY,
          key VARCHAR(100) UNIQUE NOT NULL,
          value TEXT,
          description TEXT,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
      CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(session_token);
    `

    // Insert sample data
    await sql`
      -- Insert sample users with hashed passwords
      INSERT INTO users (name, email, role, phone, password_hash) VALUES
      ('Admin User', 'admin@uniroute.edu', 'admin', '+1234567890', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
      ('John Manager', 'manager@uniroute.edu', 'manager', '+1234567891', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
      ('Student User', 'student@uniroute.edu', 'student', '+1234567892', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi')
      ON CONFLICT (email) DO NOTHING;

      -- Insert sample drivers
      INSERT INTO drivers (name, email, phone, license_number, experience_years) VALUES
      ('Michael Johnson', 'michael.j@uniroute.edu', '+1234567893', 'DL123456789', 5),
      ('Sarah Williams', 'sarah.w@uniroute.edu', '+1234567894', 'DL987654321', 8),
      ('David Brown', 'david.b@uniroute.edu', '+1234567895', 'DL456789123', 3),
      ('Lisa Davis', 'lisa.d@uniroute.edu', '+1234567896', 'DL789123456', 6)
      ON CONFLICT (email) DO NOTHING;

      -- Insert sample buses
      INSERT INTO buses (bus_number, capacity, model, year, driver_id) VALUES
      ('UNI-001', 45, 'Volvo B7R', 2020, 1),
      ('UNI-002', 50, 'Tata Starbus', 2021, 2),
      ('UNI-003', 40, 'Ashok Leyland', 2019, 3),
      ('UNI-004', 45, 'Volvo B9R', 2022, 4)
      ON CONFLICT (bus_number) DO NOTHING;

      -- Insert sample routes
      INSERT INTO routes (title, from_location, to_location, distance_km, estimated_duration) VALUES
      ('Campus to Downtown', 'University Campus', 'Downtown Station', 15.5, 45),
      ('Campus to Airport', 'University Campus', 'City Airport', 25.0, 60),
      ('Campus to Mall', 'University Campus', 'Shopping Mall', 8.2, 25),
      ('Campus to Hospital', 'University Campus', 'City Hospital', 12.0, 35);

      -- Insert sample settings
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
