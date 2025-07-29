import { neon } from "@neondatabase/serverless"

// Demo data for offline mode
const DEMO_DATA = {
  buses: [
    {
      id: 1,
      bus_number: "UNI-001",
      capacity: 45,
      model: "Volvo B7R",
      year: 2020,
      status: "active",
      driver_name: "Michael Johnson",
      driver_id: 1,
    },
    {
      id: 2,
      bus_number: "UNI-002",
      capacity: 50,
      model: "Tata Starbus",
      year: 2021,
      status: "active",
      driver_name: "Sarah Williams",
      driver_id: 2,
    },
    {
      id: 3,
      bus_number: "UNI-003",
      capacity: 40,
      model: "Ashok Leyland",
      year: 2019,
      status: "maintenance",
      driver_name: "David Brown",
      driver_id: 3,
    },
    {
      id: 4,
      bus_number: "UNI-004",
      capacity: 45,
      model: "Volvo B9R",
      year: 2022,
      status: "active",
      driver_name: "Lisa Davis",
      driver_id: 4,
    },
  ],
  drivers: [
    {
      id: 1,
      name: "Michael Johnson",
      email: "michael.j@uniroute.edu",
      phone: "+1234567893",
      license_number: "DL123456789",
      experience_years: 5,
      status: "active",
    },
    {
      id: 2,
      name: "Sarah Williams",
      email: "sarah.w@uniroute.edu",
      phone: "+1234567894",
      license_number: "DL987654321",
      experience_years: 8,
      status: "active",
    },
    {
      id: 3,
      name: "David Brown",
      email: "david.b@uniroute.edu",
      phone: "+1234567895",
      license_number: "DL456789123",
      experience_years: 3,
      status: "active",
    },
    {
      id: 4,
      name: "Lisa Davis",
      email: "lisa.d@uniroute.edu",
      phone: "+1234567896",
      license_number: "DL789123456",
      experience_years: 6,
      status: "on_leave",
    },
  ],
  routes: [
    {
      id: 1,
      title: "Campus to Downtown",
      from_location: "University Campus",
      to_location: "Downtown Station",
      distance_km: 15.5,
      estimated_duration: 45,
      status: "active",
      stops_count: 4,
    },
    {
      id: 2,
      title: "Campus to Airport",
      from_location: "University Campus",
      to_location: "City Airport",
      distance_km: 25.0,
      estimated_duration: 60,
      status: "active",
      stops_count: 4,
    },
    {
      id: 3,
      title: "Campus to Mall",
      from_location: "University Campus",
      to_location: "Shopping Mall",
      distance_km: 8.2,
      estimated_duration: 25,
      status: "active",
      stops_count: 3,
    },
    {
      id: 4,
      title: "Campus to Hospital",
      from_location: "University Campus",
      to_location: "City Hospital",
      distance_km: 12.0,
      estimated_duration: 35,
      status: "active",
      stops_count: 3,
    },
  ],
  schedules: [
    {
      id: 1,
      route_id: 1,
      bus_id: 1,
      driver_id: 1,
      departure_time: "08:00:00",
      arrival_time: "08:45:00",
      days_of_week: '["Monday","Tuesday","Wednesday","Thursday","Friday"]',
      status: "active",
      route_title: "Campus to Downtown",
      bus_number: "UNI-001",
      driver_name: "Michael Johnson",
    },
    {
      id: 2,
      route_id: 1,
      bus_id: 2,
      driver_id: 2,
      departure_time: "14:00:00",
      arrival_time: "14:45:00",
      days_of_week: '["Monday","Tuesday","Wednesday","Thursday","Friday"]',
      status: "active",
      route_title: "Campus to Downtown",
      bus_number: "UNI-002",
      driver_name: "Sarah Williams",
    },
    {
      id: 3,
      route_id: 2,
      bus_id: 3,
      driver_id: 3,
      departure_time: "09:00:00",
      arrival_time: "10:00:00",
      days_of_week: '["Monday","Wednesday","Friday"]',
      status: "active",
      route_title: "Campus to Airport",
      bus_number: "UNI-003",
      driver_name: "David Brown",
    },
    {
      id: 4,
      route_id: 3,
      bus_id: 4,
      driver_id: 4,
      departure_time: "10:30:00",
      arrival_time: "10:55:00",
      days_of_week: '["Tuesday","Thursday","Saturday"]',
      status: "active",
      route_title: "Campus to Mall",
      bus_number: "UNI-004",
      driver_name: "Lisa Davis",
    },
  ],
  users: [
    {
      id: 1,
      name: "Admin User",
      email: "admin@uniroute.edu",
      role: "admin",
      phone: "+1234567890",
      created_at: new Date().toISOString(),
    },
    {
      id: 2,
      name: "John Manager",
      email: "manager@uniroute.edu",
      role: "manager",
      phone: "+1234567891",
      created_at: new Date().toISOString(),
    },
    {
      id: 3,
      name: "Student User",
      email: "student@uniroute.edu",
      role: "student",
      phone: "+1234567892",
      created_at: new Date().toISOString(),
    },
  ],
  settings: [
    { id: 1, key: "system_name", value: "UniRoute", description: "System name" },
    { id: 2, key: "max_capacity_per_bus", value: "50", description: "Maximum capacity per bus" },
    { id: 3, key: "booking_advance_days", value: "7", description: "Days in advance booking is allowed" },
    { id: 4, key: "support_email", value: "support@uniroute.edu", description: "Support email address" },
    { id: 5, key: "support_phone", value: "+1234567890", description: "Support phone number" },
  ],
  studentBookings: [
    {
      id: 1,
      student_name: "Alice Johnson",
      student_email: "alice.j@student.edu",
      student_id: "STU001",
      phone: "+1234567801",
      schedule_id: 1,
      booking_date: new Date().toISOString().split("T")[0],
      pickup_stop: "University Campus",
      drop_stop: "City Center",
      status: "confirmed",
      route_title: "Campus to Downtown",
      bus_number: "UNI-001",
      created_at: new Date().toISOString(),
    },
    {
      id: 2,
      student_name: "Bob Smith",
      student_email: "bob.s@student.edu",
      student_id: "STU002",
      phone: "+1234567802",
      schedule_id: 1,
      booking_date: new Date().toISOString().split("T")[0],
      pickup_stop: "Library Junction",
      drop_stop: "Downtown Station",
      status: "confirmed",
      route_title: "Campus to Downtown",
      bus_number: "UNI-001",
      created_at: new Date().toISOString(),
    },
    {
      id: 3,
      student_name: "Carol Davis",
      student_email: "carol.d@student.edu",
      student_id: "STU003",
      phone: "+1234567803",
      schedule_id: 2,
      booking_date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
      pickup_stop: "University Campus",
      drop_stop: "Terminal 1",
      status: "pending",
      route_title: "Campus to Downtown",
      bus_number: "UNI-002",
      created_at: new Date().toISOString(),
    },
  ],
}

// Check if we're in demo mode
export function isDemoMode(): boolean {
  return (
    process.env.DEMO_MODE === "true" || !process.env.DATABASE_URL || process.env.DATABASE_URL === "your_database_url"
  )
}

// Get database URL from environment or return null if not configured
function getDatabaseUrl(): string | null {
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl || databaseUrl === "your_database_url") {
    return null
  }

  return databaseUrl
}

// Create SQL connection only if database URL is available
function createSqlConnection() {
  const databaseUrl = getDatabaseUrl()

  if (!databaseUrl) {
    throw new Error("Database not configured")
  }

  // For local PostgreSQL, we'll use neon but it should work with any PostgreSQL connection string
  return neon(databaseUrl)
}

// Export a function to get SQL connection
export function getSql() {
  return createSqlConnection()
}

// Check if database is configured
export function isDatabaseConfigured(): boolean {
  return getDatabaseUrl() !== null && !isDemoMode()
}

// Database helper functions with demo mode support
export async function getBuses() {
  try {
    if (isDemoMode()) {
      return DEMO_DATA.buses
    }

    if (!isDatabaseConfigured()) {
      return []
    }

    const sql = getSql()
    const buses = await sql`
      SELECT b.*, d.name as driver_name 
      FROM buses b 
      LEFT JOIN drivers d ON b.driver_id = d.id 
      ORDER BY b.created_at DESC
    `
    return buses
  } catch (error) {
    console.error("Error fetching buses:", error)
    return DEMO_DATA.buses // Fallback to demo data
  }
}

export async function getDrivers() {
  try {
    if (isDemoMode()) {
      return DEMO_DATA.drivers
    }

    if (!isDatabaseConfigured()) {
      return []
    }

    const sql = getSql()
    const drivers = await sql`
      SELECT * FROM drivers ORDER BY created_at DESC
    `
    return drivers
  } catch (error) {
    console.error("Error fetching drivers:", error)
    return DEMO_DATA.drivers // Fallback to demo data
  }
}

export async function getRoutes() {
  try {
    if (isDemoMode()) {
      return DEMO_DATA.routes
    }

    if (!isDatabaseConfigured()) {
      return []
    }

    const sql = getSql()
    const routes = await sql`
      SELECT r.*, 
             COUNT(rs.id) as stops_count
      FROM routes r 
      LEFT JOIN route_stops rs ON r.id = rs.route_id 
      GROUP BY r.id 
      ORDER BY r.created_at DESC
    `
    return routes
  } catch (error) {
    console.error("Error fetching routes:", error)
    return DEMO_DATA.routes // Fallback to demo data
  }
}

export async function getSchedules() {
  try {
    if (isDemoMode()) {
      return DEMO_DATA.schedules
    }

    if (!isDatabaseConfigured()) {
      return []
    }

    const sql = getSql()
    const schedules = await sql`
      SELECT s.*, 
             r.title as route_title,
             b.bus_number,
             d.name as driver_name
      FROM schedules s
      JOIN routes r ON s.route_id = r.id
      JOIN buses b ON s.bus_id = b.id
      JOIN drivers d ON s.driver_id = d.id
      ORDER BY s.created_at DESC
    `
    return schedules
  } catch (error) {
    console.error("Error fetching schedules:", error)
    return DEMO_DATA.schedules // Fallback to demo data
  }
}

export async function getUsers() {
  try {
    if (isDemoMode()) {
      return DEMO_DATA.users
    }

    if (!isDatabaseConfigured()) {
      return []
    }

    const sql = getSql()
    const users = await sql`
      SELECT * FROM users ORDER BY created_at DESC
    `
    return users
  } catch (error) {
    console.error("Error fetching users:", error)
    return DEMO_DATA.users // Fallback to demo data
  }
}

export async function getSettings() {
  try {
    if (isDemoMode()) {
      return DEMO_DATA.settings
    }

    if (!isDatabaseConfigured()) {
      return []
    }

    const sql = getSql()
    const settings = await sql`
      SELECT * FROM settings ORDER BY key
    `
    return settings
  } catch (error) {
    console.error("Error fetching settings:", error)
    return DEMO_DATA.settings // Fallback to demo data
  }
}

export async function getStudentBookings() {
  try {
    if (isDemoMode()) {
      return DEMO_DATA.studentBookings
    }

    if (!isDatabaseConfigured()) {
      return []
    }

    const sql = getSql()
    const bookings = await sql`
      SELECT sb.*, 
             s.departure_time,
             s.arrival_time,
             r.title as route_title,
             b.bus_number
      FROM student_bookings sb
      JOIN schedules s ON sb.schedule_id = s.id
      JOIN routes r ON s.route_id = r.id
      JOIN buses b ON s.bus_id = b.id
      ORDER BY sb.created_at DESC
    `
    return bookings
  } catch (error) {
    console.error("Error fetching student bookings:", error)
    return DEMO_DATA.studentBookings // Fallback to demo data
  }
}

export async function getDashboardStats() {
  try {
    if (isDemoMode()) {
      return {
        buses: DEMO_DATA.buses.filter((b) => b.status === "active").length,
        drivers: DEMO_DATA.drivers.filter((d) => d.status === "active").length,
        routes: DEMO_DATA.routes.filter((r) => r.status === "active").length,
        schedules: DEMO_DATA.schedules.filter((s) => s.status === "active").length,
      }
    }

    if (!isDatabaseConfigured()) {
      return {
        buses: 0,
        drivers: 0,
        routes: 0,
        schedules: 0,
      }
    }

    const sql = getSql()
    const [busCount] = await sql`SELECT COUNT(*) as count FROM buses WHERE status = 'active'`
    const [driverCount] = await sql`SELECT COUNT(*) as count FROM drivers WHERE status = 'active'`
    const [routeCount] = await sql`SELECT COUNT(*) as count FROM routes WHERE status = 'active'`
    const [scheduleCount] = await sql`SELECT COUNT(*) as count FROM schedules WHERE status = 'active'`

    return {
      buses: busCount.count,
      drivers: driverCount.count,
      routes: routeCount.count,
      schedules: scheduleCount.count,
    }
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return {
      buses: 4,
      drivers: 4,
      routes: 4,
      schedules: 4,
    }
  }
}
