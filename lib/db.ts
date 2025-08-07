// lib/db.ts
import { Pool } from 'pg'

// Ensure this file is only used in Node.js runtime
export const runtime = "nodejs"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
})

export default pool

// --------- Helper Queries ---------

export async function getBuses() {
  const result = await pool.query(`
    SELECT b.*, d.name as driver_name 
    FROM buses b 
    LEFT JOIN drivers d ON b.driver_id = d.id 
    ORDER BY b.created_at DESC
  `)
  return result.rows
}

export async function getDrivers() {
  const result = await pool.query(`SELECT * FROM drivers ORDER BY created_at DESC`)
  return result.rows
}

export async function getRoutes() {
  const result = await pool.query(`
    SELECT r.*, COUNT(rs.id) as stops_count
    FROM routes r 
    LEFT JOIN route_stops rs ON r.id = rs.route_id 
    GROUP BY r.id 
    ORDER BY r.created_at DESC
  `)
  return result.rows
}

export async function getSchedules() {
  const result = await pool.query(`
    SELECT s.*, 
           r.title as route_title,
           b.bus_number,
           d.name as driver_name
    FROM schedules s
    JOIN routes r ON s.route_id = r.id
    JOIN buses b ON s.bus_id = b.id
    JOIN drivers d ON s.driver_id = d.id
    ORDER BY s.created_at DESC
  `)
  return result.rows
}

export async function getUsers() {
  const result = await pool.query(`SELECT * FROM users ORDER BY created_at DESC`)
  return result.rows
}

export async function getSettings() {
  const result = await pool.query(`SELECT * FROM settings ORDER BY key`)
  return result.rows
}

export async function getDashboardStats() {
  const [buses, drivers, routes, schedules] = await Promise.all([
    pool.query(`SELECT COUNT(*) as count FROM buses WHERE status = 'active'`),
    pool.query(`SELECT COUNT(*) as count FROM drivers WHERE status = 'active'`),
    pool.query(`SELECT COUNT(*) as count FROM routes WHERE status = 'active'`),
    pool.query(`SELECT COUNT(*) as count FROM schedules WHERE status = 'active'`),
  ])

  return {
    buses: buses.rows[0].count,
    drivers: drivers.rows[0].count,
    routes: routes.rows[0].count,
    schedules: schedules.rows[0].count,
  }
}

// --------- Auth Helpers ---------

export function getSql() {
  return pool
}

export function isDatabaseConfigured(): boolean {
  return !!process.env.DATABASE_URL
}

export function isDemoMode(): boolean {
  return process.env.DEMO_MODE === "true"
}
