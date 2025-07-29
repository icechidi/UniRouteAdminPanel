-- Insert sample data for testing

-- Insert sample users
INSERT INTO users (name, email, role, phone) VALUES
('Admin User', 'admin@uniroute.edu', 'admin', '+1234567890'),
('John Manager', 'manager@uniroute.edu', 'manager', '+1234567891'),
('Student User', 'student@uniroute.edu', 'student', '+1234567892');

-- Insert sample drivers
INSERT INTO drivers (name, email, phone, license_number, experience_years) VALUES
('Michael Johnson', 'michael.j@uniroute.edu', '+1234567893', 'DL123456789', 5),
('Sarah Williams', 'sarah.w@uniroute.edu', '+1234567894', 'DL987654321', 8),
('David Brown', 'david.b@uniroute.edu', '+1234567895', 'DL456789123', 3),
('Lisa Davis', 'lisa.d@uniroute.edu', '+1234567896', 'DL789123456', 6);

-- Insert sample buses
INSERT INTO buses (bus_number, capacity, model, year, driver_id) VALUES
('UNI-001', 45, 'Volvo B7R', 2020, 1),
('UNI-002', 50, 'Tata Starbus', 2021, 2),
('UNI-003', 40, 'Ashok Leyland', 2019, 3),
('UNI-004', 45, 'Volvo B9R', 2022, 4);

-- Insert sample routes
INSERT INTO routes (title, from_location, to_location, distance_km, estimated_duration) VALUES
('Campus to Downtown', 'University Campus', 'Downtown Station', 15.5, 45),
('Campus to Airport', 'University Campus', 'City Airport', 25.0, 60),
('Campus to Mall', 'University Campus', 'Shopping Mall', 8.2, 25),
('Campus to Hospital', 'University Campus', 'City Hospital', 12.0, 35);

-- Insert sample route stops
INSERT INTO route_stops (route_id, stop_name, stop_order, arrival_time) VALUES
(1, 'University Campus', 1, '08:00:00'),
(1, 'Library Junction', 2, '08:10:00'),
(1, 'City Center', 3, '08:25:00'),
(1, 'Downtown Station', 4, '08:45:00'),
(2, 'University Campus', 1, '09:00:00'),
(2, 'Highway Junction', 2, '09:20:00'),
(2, 'Terminal 1', 3, '09:45:00'),
(2, 'City Airport', 4, '10:00:00');

-- Insert sample schedules
INSERT INTO schedules (route_id, bus_id, driver_id, departure_time, arrival_time, days_of_week) VALUES
(1, 1, 1, '08:00:00', '08:45:00', '["Monday","Tuesday","Wednesday","Thursday","Friday"]'),
(1, 2, 2, '14:00:00', '14:45:00', '["Monday","Tuesday","Wednesday","Thursday","Friday"]'),
(2, 3, 3, '09:00:00', '10:00:00', '["Monday","Wednesday","Friday"]'),
(3, 4, 4, '10:30:00', '10:55:00', '["Tuesday","Thursday","Saturday"]');

-- Insert system settings
INSERT INTO settings (key, value, description) VALUES
('system_name', 'UniRoute', 'System name'),
('max_capacity_per_bus', '50', 'Maximum capacity per bus'),
('booking_advance_days', '7', 'Days in advance booking is allowed'),
('support_email', 'support@uniroute.edu', 'Support email address'),
('support_phone', '+1234567890', 'Support phone number');
