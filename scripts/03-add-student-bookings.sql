-- Add student bookings table
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

-- Add sessions table for authentication
CREATE TABLE IF NOT EXISTS sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add password_hash column to users table if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

-- Update users table with password hash (for demo purposes - password: "password")
UPDATE users SET password_hash = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' WHERE email = 'admin@uniroute.edu';
UPDATE users SET password_hash = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' WHERE email = 'manager@uniroute.edu';
UPDATE users SET password_hash = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' WHERE email = 'student@uniroute.edu';

-- Insert sample student bookings
INSERT INTO student_bookings (student_name, student_email, student_id, phone, schedule_id, booking_date, pickup_stop, drop_stop) VALUES
('Alice Johnson', 'alice.j@student.edu', 'STU001', '+1234567801', 1, CURRENT_DATE, 'University Campus', 'City Center'),
('Bob Smith', 'bob.s@student.edu', 'STU002', '+1234567802', 1, CURRENT_DATE, 'Library Junction', 'Downtown Station'),
('Carol Davis', 'carol.d@student.edu', 'STU003', '+1234567803', 2, CURRENT_DATE + 1, 'University Campus', 'Terminal 1'),
('David Wilson', 'david.w@student.edu', 'STU004', '+1234567804', 3, CURRENT_DATE + 2, 'University Campus', 'Shopping Mall'),
('Emma Brown', 'emma.b@student.edu', 'STU005', '+1234567805', 1, CURRENT_DATE, 'University Campus', 'City Center');
