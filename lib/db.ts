import { Pool } from "pg"

let pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

// Demo data for offline mode, updated to new schema
const DEMO_DATA = {
  roles: [
    { role_id: 1, name: "admin" },
    { role_id: 2, name: "driver" },
    { role_id: 3, name: "student" },
  ],
  users: [
    {
      user_id: 1,
      role_id: 1,
      first_name: "Admin",
      last_name: "User",
      username: "admin",
      email: "admin@uniroute.edu",
      phone: "+1234567890",
      country: "USA",
      photo_url: "/placeholder.svg?height=32&width=32",
      language_pref: "en",
      unique_id: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      role_name: "admin", // Added for convenience in frontend
    },
    {
      user_id: 2,
      role_id: 2,
      first_name: "Michael",
      last_name: "Johnson",
      username: "mjohnson",
      email: "michael.j@uniroute.edu",
      phone: "+1234567893",
      country: "USA",
      photo_url: "/placeholder.svg?height=32&width=32",
      language_pref: "en",
      unique_id: "b2c3d4e5-f6a7-8901-2345-67890abcdef0",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      role_name: "driver",
    },
    {
      user_id: 3,
      role_id: 2,
      first_name: "Sarah",
      last_name: "Williams",
      username: "swilliams",
      email: "sarah.w@uniroute.edu",
      phone: "+1234567894",
      country: "USA",
      photo_url: "/placeholder.svg?height=32&width=32",
      language_pref: "en",
      unique_id: "c3d4e5f6-a7b8-9012-3456-7890abcdef01",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      role_name: "driver",
    },
    {
      user_id: 4,
      role_id: 3,
      first_name: "Student",
      last_name: "User",
      username: "student",
      email: "student@uniroute.edu",
      phone: "+1234567892",
      country: "USA",
      photo_url: "/placeholder.svg?height=32&width=32",
      language_pref: "en",
      unique_id: "d4e5f6a7-b8c9-0123-4567-890abcdef012",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      role_name: "student",
    },
    {
      user_id: 5,
      role_id: 3,
      first_name: "Alice",
      last_name: "Johnson",
      username: "ajohnson",
      email: "alice.j@student.edu",
      phone: "+1234567801",
      country: "USA",
      photo_url: "/placeholder.svg?height=32&width=32",
      language_pref: "en",
      unique_id: "e5f6a7b8-c9d0-1234-5678-90abcdef0123",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      role_name: "student",
    },
  ],
  buses: [
    {
      bus_id: 1,
      bus_number: "UNI-001",
      license_plate: "ABC-123",
      capacity: 45,
      model: "Volvo B7R",
      year: 2020,
      status: "active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      bus_id: 2,
      bus_number: "UNI-002",
      license_plate: "DEF-456",
      capacity: 50,
      model: "Tata Starbus",
      year: 2021,
      status: "active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      bus_id: 3,
      bus_number: "UNI-003",
      license_plate: "GHI-789",
      capacity: 40,
      model: "Ashok Leyland",
      year: 2019,
      status: "maintenance",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  messages: [
    {
      message_id: 1,
      message_text: "Emergency: Bus UNI-001 breakdown near Library Junction. Assistance dispatched.",
      category: "emergency",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      message_id: 2,
      message_text: "Reminder: Your 8 AM bus to Downtown is on schedule.",
      category: "schedule",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      message_id: 3,
      message_text: "Welcome to UniRoute Admin Dashboard!",
      category: "admin",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      message_id: 4,
      message_text: "Great service today!",
      category: "feedback",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  routes: [
    {
      route_id: 1,
      route_name: "Campus to Downtown",
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      route_id: 2,
      route_name: "Campus to Airport",
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      route_id: 3,
      route_name: "Campus to Mall",
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  route_stops: [
    {
      route_stop_id: 1,
      route_id: 1,
      stop_name: "University Campus",
      longitude: -77.0369,
      latitude: 38.9072,
      stop_order: 1,
      arrival_time: "08:00:00",
      created_at: new Date().toISOString(),
    },
    {
      route_stop_id: 2,
      route_id: 1,
      stop_name: "Library Junction",
      longitude: -77.045,
      latitude: 38.915,
      stop_order: 2,
      arrival_time: "08:10:00",
      created_at: new Date().toISOString(),
    },
    {
      route_stop_id: 3,
      route_id: 1,
      stop_name: "Downtown Station",
      longitude: -77.02,
      latitude: 38.9,
      stop_order: 3,
      arrival_time: "08:25:00",
      created_at: new Date().toISOString(),
    },
    {
      route_stop_id: 4,
      route_id: 2,
      stop_name: "University Campus",
      longitude: -77.0369,
      latitude: 38.9072,
      stop_order: 1,
      arrival_time: "09:00:00",
      created_at: new Date().toISOString(),
    },
    {
      route_stop_id: 5,
      route_id: 2,
      stop_name: "City Airport Terminal",
      longitude: -77.0,
      latitude: 38.85,
      stop_order: 2,
      arrival_time: "09:30:00",
      created_at: new Date().toISOString(),
    },
  ],
  emergency_notifications: [
    {
      notification_id: 1,
      route_id: 1,
      bus_id: 1,
      user_id: 2, // Michael Johnson
      message_id: 1, // Emergency message
      triggered_at: new Date().toISOString(),
      location_longitude: -77.045,
      location_latitude: 38.915,
      status: "active",
      route_name: "Campus to Downtown",
      bus_number: "UNI-001",
      driver_name: "Michael Johnson",
      message_text: "Emergency: Bus UNI-001 breakdown near Library Junction. Assistance dispatched.",
    },
  ],
  schedules: [
    {
      schedule_id: 1,
      route_id: 1,
      bus_id: 1,
      driver_user_id: 2, // Michael Johnson
      type_of_schedule: "weekly",
      start_date: null,
      end_date: null,
      days_of_week: '["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      route_name: "Campus to Downtown",
      bus_number: "UNI-001",
      driver_name: "Michael Johnson",
    },
    {
      schedule_id: 2,
      route_id: 2,
      bus_id: 2,
      driver_user_id: 3, // Sarah Williams
      type_of_schedule: "daily",
      start_date: new Date().toISOString().split("T")[0],
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      days_of_week: null,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      route_name: "Campus to Airport",
      bus_number: "UNI-002",
      driver_name: "Sarah Williams",
    },
  ],
  schedule_notifications: [], // No demo data for now
  semester_schedules: [
    {
      sem_schedule_id: 1,
      academic_year: "2023-2024",
      semester: "fall",
      start_date: "2023-09-01",
      end_date: "2023-12-15",
      holidays: '[{"date": "2023-11-23", "name": "Thanksgiving"}]',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  bus_times: [
    {
      bus_time_id: 1,
      schedule_id: 1,
      route_stop_id: 1,
      scheduled_departure_time: "08:00:00",
      scheduled_arrival_time: "08:00:00",
      actual_departure_time: null,
      actual_arrival_time: null,
      status: "on_time",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      stop_name: "University Campus",
      route_name: "Campus to Downtown",
      bus_number: "UNI-001",
    },
    {
      bus_time_id: 2,
      schedule_id: 1,
      route_stop_id: 2,
      scheduled_departure_time: "08:10:00",
      scheduled_arrival_time: "08:10:00",
      actual_departure_time: null,
      actual_arrival_time: null,
      status: "on_time",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      stop_name: "Library Junction",
      route_name: "Campus to Downtown",
      bus_number: "UNI-001",
    },
    {
      bus_time_id: 3,
      schedule_id: 1,
      route_stop_id: 3,
      scheduled_departure_time: "08:25:00",
      scheduled_arrival_time: "08:25:00",
      actual_departure_time: null,
      actual_arrival_time: null,
      status: "on_time",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      stop_name: "Downtown Station",
      route_name: "Campus to Downtown",
      bus_number: "UNI-001",
    },
    {
      bus_time_id: 4,
      schedule_id: 2,
      route_stop_id: 4,
      scheduled_departure_time: "09:00:00",
      scheduled_arrival_time: "09:00:00",
      actual_departure_time: null,
      actual_arrival_time: null,
      status: "on_time",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      stop_name: "University Campus",
      route_name: "Campus to Airport",
      bus_number: "UNI-002",
    },
    {
      bus_time_id: 5,
      schedule_id: 2,
      route_stop_id: 5,
      scheduled_departure_time: "09:30:00",
      scheduled_arrival_time: "09:30:00",
      actual_departure_time: null,
      actual_arrival_time: null,
      status: "on_time",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      stop_name: "City Airport Terminal",
      route_name: "Campus to Airport",
      bus_number: "UNI-002",
    },
  ],
  settings: [
    { id: 1, key: "system_name", value: "UniRoute", description: "System name" },
    { id: 2, key: "max_capacity_per_bus", value: "50", description: "Maximum capacity per bus" },
    { id: 3, key: "booking_advance_days", value: "7", description: "Days in advance booking is allowed" },
    { id: 4, key: "support_email", value: "support@uniroute.edu", description: "Support email address" },
    { id: 5, key: "support_phone", value: "+1234567890", description: "Support phone number" },
  ],
  user_activity_logs: [
    {
      log_id: 1,
      user_id: 1,
      activity_type: "login",
      details: { message: "Admin user logged in" },
      ip_address: "127.0.0.1",
      user_agent: "Mozilla/5.0",
      timestamp: new Date().toISOString(),
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
function initializePool() {
  const databaseUrl = getDatabaseUrl()

  if (!databaseUrl) {
    throw new Error("Database not configured")
  }

  if (!pool) {
    pool = new Pool({ connectionString: databaseUrl })
  }

  return pool
}

export function getSql() {
  const pool = initializePool()

  return {
    query: (text: string, params?: any[]) => pool.query(text, params),
  }
}

// Optional helper if you need raw access to the pool elsewhere
export function getPool(): Pool {
  return initializePool()
}

// Export a function to get SQL connection
/* Removed duplicate getSql function */

// Check if database is configured
export function isDatabaseConfigured(): boolean {
  return !!process.env.DATABASE_URL
}

// Database helper functions with demo mode support
export async function getRoles() {
  try {
    if (isDemoMode()) {
      return DEMO_DATA.roles
    }

    if (!isDatabaseConfigured()) {
      return []
    }

    const client = await pool.connect()
    try {
      const result = await client.query("SELECT * FROM roles ORDER BY name")
      return result.rows
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("Error fetching roles:", error)
    return DEMO_DATA.roles
  }
}

export async function getUsers() {
  try {
    if (isDemoMode()) {
      return DEMO_DATA.users.map((user) => ({
        ...user,
        role_name: DEMO_DATA.roles.find((r) => r.role_id === user.role_id)?.name || "unknown",
      }))
    }
    if (!isDatabaseConfigured()) return []
    const sql = getSql()
    return (await sql.query(
      `SELECT u.*, r.name as role_name
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.role_id
      ORDER BY u.created_at DESC`
    )).rows
  } catch (error) {
    console.error("Error fetching users:", error)
    return DEMO_DATA.users
  }
}

export async function getBuses() {
  try {
    if (isDemoMode()) {
      return DEMO_DATA.buses
    }
    if (!isDatabaseConfigured()) return []
    const sql = getSql()
    return (await sql.query("SELECT * FROM buses ORDER BY created_at DESC")).rows
  } catch (error) {
    console.error("Error fetching buses:", error)
    return DEMO_DATA.buses
  }
}

export async function getMessages(category?: string) {
  try {
    if (isDemoMode()) {
      return category
        ? DEMO_DATA.messages.filter((msg) => msg.category === category)
        : DEMO_DATA.messages
    }
    if (!isDatabaseConfigured()) return []
    const sql = getSql()
    if (category) {
      return (await sql.query("SELECT * FROM messages WHERE category = $1 ORDER BY created_at DESC", [category])).rows
    }
    return (await sql.query("SELECT * FROM messages ORDER BY created_at DESC")).rows
  } catch (error) {
    console.error("Error fetching messages:", error)
    return DEMO_DATA.messages
  }
}

export async function getRoutes() {
  try {
    if (isDemoMode()) {
      return DEMO_DATA.routes.map((route) => ({
        ...route,
        stops_count: DEMO_DATA.route_stops.filter((stop) => stop.route_id === route.route_id).length,
      }))
    }
    if (!isDatabaseConfigured()) return []
    const sql = getSql()
    const result = await sql.query(
      `SELECT r.*, COUNT(rs.route_stop_id) as stops_count
      FROM routes r
      LEFT JOIN route_stops rs ON r.route_id = rs.route_id
      GROUP BY r.route_id
      ORDER BY r.created_at DESC`
    )
    return result.rows
  } catch (error) {
    console.error("Error fetching routes:", error)
    return DEMO_DATA.routes
  }
}

export async function getRouteStops(routeId?: number) {
  try {
    if (isDemoMode()) {
      return routeId
        ? DEMO_DATA.route_stops.filter((stop) => stop.route_id === routeId)
        : DEMO_DATA.route_stops
    }
    if (!isDatabaseConfigured()) return []
    const sql = getSql()
    if (routeId) {
      return (await sql.query("SELECT * FROM route_stops WHERE route_id = $1 ORDER BY stop_order", [routeId])).rows
    }
    return (await sql.query("SELECT * FROM route_stops ORDER BY stop_order")).rows
  } catch (error) {
    console.error("Error fetching route stops:", error)
    return DEMO_DATA.route_stops
  }
}

export async function getEmergencyNotifications() {
  try {
    if (isDemoMode()) {
      return DEMO_DATA.emergency_notifications.map((notif) => ({
        ...notif,
        route_name: DEMO_DATA.routes.find((r) => r.route_id === notif.route_id)?.route_name || "N/A",
        bus_number: DEMO_DATA.buses.find((b) => b.bus_id === notif.bus_id)?.bus_number || "N/A",
        driver_name:
          DEMO_DATA.users.find((u) => u.user_id === notif.user_id)?.first_name +
            " " +
            DEMO_DATA.users.find((u) => u.user_id === notif.user_id)?.last_name || "N/A",
        message_text: DEMO_DATA.messages.find((m) => m.message_id === notif.message_id)?.message_text || "N/A",
      }))
    }
    if (!isDatabaseConfigured()) return []
    const sql = getSql()
    return (
      await sql.query(
        `SELECT en.*, r.route_name, b.bus_number, u.first_name || ' ' || u.last_name as driver_name, m.message_text
        FROM emergency_notifications en
        LEFT JOIN routes r ON en.route_id = r.route_id
        LEFT JOIN buses b ON en.bus_id = b.bus_id
        LEFT JOIN users u ON en.user_id = u.user_id
        LEFT JOIN messages m ON en.message_id = m.message_id
        ORDER BY en.triggered_at DESC`
      )
    ).rows
  } catch (error) {
    console.error("Error fetching emergency notifications:", error)
    return DEMO_DATA.emergency_notifications
  }
}

export async function getSchedules() {
  try {
    if (isDemoMode()) {
      return DEMO_DATA.schedules.map((schedule) => ({
        ...schedule,
        route_name: DEMO_DATA.routes.find((r) => r.route_id === schedule.route_id)?.route_name || "N/A",
        bus_number: DEMO_DATA.buses.find((b) => b.bus_id === schedule.bus_id)?.bus_number || "N/A",
        driver_name:
          DEMO_DATA.users.find((u) => u.user_id === schedule.driver_user_id)?.first_name +
            " " +
            DEMO_DATA.users.find((u) => u.user_id === schedule.driver_user_id)?.last_name || "N/A",
      }))
    }
    if (!isDatabaseConfigured()) return []
    const sql = getSql()
    const result = await sql.query(
      `SELECT s.*, r.route_name, b.bus_number, u.first_name || ' ' || u.last_name as driver_name
      FROM schedules s
      JOIN routes r ON s.route_id = r.route_id
      JOIN buses b ON s.bus_id = b.bus_id
      LEFT JOIN users u ON s.driver_user_id = u.user_id
      ORDER BY s.created_at DESC`
    )
    return result.rows
  } catch (error) {
    console.error("Error fetching schedules:", error)
    return DEMO_DATA.schedules
  }
}

export async function getScheduleNotifications() {
  try {
    if (isDemoMode()) {
      return DEMO_DATA.schedule_notifications
    }
    if (!isDatabaseConfigured()) return []
    const sql = getSql()
    const result = await sql.query(
      `SELECT sn.*, m.message_text, s.type_of_schedule, r.route_name
      FROM schedule_notifications sn
      JOIN messages m ON sn.message_id = m.message_id
      JOIN schedules s ON sn.schedule_id = s.schedule_id
      JOIN routes r ON s.route_id = r.route_id
      ORDER BY sn.sent_at DESC`
    )
    return result.rows
  } catch (error) {
    console.error("Error fetching schedule notifications:", error)
    return DEMO_DATA.schedule_notifications
  }
}

export async function getSemesterSchedules() {
  try {
    if (isDemoMode()) {
      return DEMO_DATA.semester_schedules
    }
    if (!isDatabaseConfigured()) return []
    const sql = getSql()
    return (await sql.query("SELECT * FROM semester_schedules ORDER BY academic_year DESC, semester")).rows
  } catch (error) {
    console.error("Error fetching semester schedules:", error)
    return DEMO_DATA.semester_schedules
  }
}

export async function getBusTimes(scheduleId?: number) {
  try {
    if (isDemoMode()) {
      const filteredBusTimes = scheduleId
        ? DEMO_DATA.bus_times.filter((bt) => bt.schedule_id === scheduleId)
        : DEMO_DATA.bus_times
      return filteredBusTimes.map((bt) => ({
        ...bt,
        stop_name: DEMO_DATA.route_stops.find((rs) => rs.route_stop_id === bt.route_stop_id)?.stop_name || "N/A",
        route_name:
          DEMO_DATA.routes.find(
            (r) =>
              DEMO_DATA.schedules.find((s) => s.schedule_id === bt.schedule_id)?.route_id === r.route_id,
          )?.route_name || "N/A",
        bus_number:
          DEMO_DATA.buses.find(
            (b) => DEMO_DATA.schedules.find((s) => s.schedule_id === bt.schedule_id)?.bus_id === b.bus_id,
          )?.bus_number || "N/A",
      }))
    }
    if (!isDatabaseConfigured()) return []
    const sql = getSql()
    if (scheduleId) {
      return (
        await sql.query(
          `SELECT bt.*, rs.stop_name, r.route_name, b.bus_number
          FROM bus_times bt
          JOIN route_stops rs ON bt.route_stop_id = rs.route_stop_id
          JOIN schedules s ON bt.schedule_id = s.schedule_id
          JOIN routes r ON s.route_id = r.route_id
          JOIN buses b ON s.bus_id = b.bus_id
          WHERE bt.schedule_id = $1
          ORDER BY bt.scheduled_departure_time`,
          [scheduleId]
        )
      ).rows
    }
    return (
      await sql.query(
        `SELECT bt.*, rs.stop_name, r.route_name, b.bus_number
        FROM bus_times bt
        JOIN route_stops rs ON bt.route_stop_id = rs.route_stop_id
        JOIN schedules s ON bt.schedule_id = s.schedule_id
        JOIN routes r ON s.route_id = r.route_id
        JOIN buses b ON s.bus_id = b.bus_id
        ORDER BY bt.created_at DESC`
      )
    ).rows
  } catch (error) {
    console.error("Error fetching bus times:", error)
    return DEMO_DATA.bus_times
  }
}

export async function getSettings() {
  try {
    if (isDemoMode()) {
      return DEMO_DATA.settings
    }
    if (!isDatabaseConfigured()) return []
    const sql = getSql()
    return (await sql.query("SELECT * FROM settings ORDER BY key")).rows
  } catch (error) {
    console.error("Error fetching settings:", error)
    return DEMO_DATA.settings
  }
}

export async function getUserActivityLogs(userId?: number) {
  try {
    if (isDemoMode()) {
      return userId
        ? DEMO_DATA.user_activity_logs.filter((log) => log.user_id === userId)
        : DEMO_DATA.user_activity_logs
    }
    if (!isDatabaseConfigured()) return []
    const sql = getSql()
    if (userId) {
      return (await sql.query("SELECT * FROM user_activity_logs WHERE user_id = $1 ORDER BY timestamp DESC", [userId])).rows
    }
    return (await sql.query("SELECT * FROM user_activity_logs ORDER BY timestamp DESC")).rows
  } catch (error) {
    console.error("Error fetching user activity logs:", error)
    return DEMO_DATA.user_activity_logs
  }
}

export async function getDashboardStats() {
  try {
    if (isDemoMode()) {
      return {
        buses: DEMO_DATA.buses.filter((b) => b.status === "active").length,
        drivers: DEMO_DATA.users.filter((u) => u.role_name === "driver").length,
        routes: DEMO_DATA.routes.filter((r) => r.is_active).length,
        schedules: DEMO_DATA.schedules.filter((s) => s.is_active).length,
        messages: DEMO_DATA.messages.length,
        feedback: DEMO_DATA.messages.filter((m) => m.category === "feedback").length,
      }
    }
    if (!isDatabaseConfigured()) {
      return {
        buses: 0,
        drivers: 0,
        routes: 0,
        schedules: 0,
        messages: 0,
        feedback: 0,
      }
    }

    const sql = getSql()
    const busCountResult = await sql.query("SELECT COUNT(*) as count FROM buses WHERE status = 'active'")
    const driverCountResult = await sql.query(
      `SELECT COUNT(u.user_id) as count
      FROM users u
      JOIN roles r ON u.role_id = r.role_id
      WHERE r.name = 'driver'`
    )
    const routeCountResult = await sql.query("SELECT COUNT(*) as count FROM routes WHERE is_active = TRUE")
    const scheduleCountResult = await sql.query("SELECT COUNT(*) as count FROM schedules WHERE is_active = TRUE")
    const messageCountResult = await sql.query("SELECT COUNT(*) as count FROM messages")
    const feedbackCountResult = await sql.query("SELECT COUNT(*) as count FROM messages WHERE category = 'feedback'")

    return {
      buses: Number(busCountResult.rows[0].count),
      drivers: Number(driverCountResult.rows[0].count),
      routes: Number(routeCountResult.rows[0].count),
      schedules: Number(scheduleCountResult.rows[0].count),
      messages: Number(messageCountResult.rows[0].count),
      feedback: Number(feedbackCountResult.rows[0].count),
    }
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return {
      buses: 3,
      drivers: 2,
      routes: 3,
      schedules: 2,
      messages: 4,
      feedback: 1,
    }
  }
}
