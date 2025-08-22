import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Clock, CalendarDays, Bus, MapPin, AlertCircle } from "lucide-react"
import { getSchedules, getBusTimes, getSemesterSchedules } from "@/lib/db"
import { Alert, AlertDescription } from "@/components/ui/alert"

import DashboardLayout from "../dashboard-layout"

/**
 * Local lightweight types to avoid depending on /lib/types (which may not exist)
 */
interface Holiday {
  date: string // "YYYY-MM-DD"
  name?: string
}
interface SemesterSchedule {
  sem_schedule_id?: number
  academic_year?: string
  semester?: string
  start_date: string
  end_date: string
  holidays?: Holiday[] | string | null
}
interface BusTime {
  bus_time_id: number
  schedule_id: number
  route_stop_id?: number
  route_time_id?: number | null
  scheduled_departure_time: string // "HH:MM[:SS]"
  scheduled_arrival_time?: string
  status?: string
  stop_name?: string
}
interface Schedule {
  schedule_id: number
  route_name: string
  bus_number?: string
  academic_year?: string | null
  semester?: string | null
  sem_schedule_id?: number | null
  type_of_schedule: string
  start_date?: string | null
  end_date?: string | null
  days_of_week?: string | null // could be JSON string or null
  is_active: boolean
  created_at?: string
}

/* ---------- Helpers ---------- */

function isWithinSemester(date: Date, semester: SemesterSchedule) {
  if (!semester?.start_date || !semester?.end_date) return false
  const start = new Date(semester.start_date)
  const end = new Date(semester.end_date)
  // Normalize time-of-day by comparing date values
  return date >= start && date <= end
}

function parseHolidays(holidays: SemesterSchedule["holidays"]): Holiday[] {
  if (!holidays) return []
  if (Array.isArray(holidays)) return holidays
  if (typeof holidays === "string") {
    try {
      const parsed = JSON.parse(holidays)
      if (Array.isArray(parsed)) return parsed
    } catch {
      return []
    }
  }
  return []
}

function isHoliday(date: Date, semester: SemesterSchedule) {
  const holidays = parseHolidays(semester.holidays)
  return holidays.some((h) => {
    try {
      const hd = new Date(h.date)
      return (
        hd.getFullYear() === date.getFullYear() &&
        hd.getMonth() === date.getMonth() &&
        hd.getDate() === date.getDate()
      )
    } catch {
      return false
    }
  })
}

function parseDaysOfWeek(daysOfWeek: any): string[] {
  if (!daysOfWeek) return []
  if (Array.isArray(daysOfWeek)) return daysOfWeek
  if (typeof daysOfWeek === "string") {
    try {
      const parsed = JSON.parse(daysOfWeek)
      if (Array.isArray(parsed)) return parsed
    } catch {
      // maybe it's a plain comma separated string
      return daysOfWeek.split(",").map((s: string) => s.trim()).filter(Boolean)
    }
  }
  return []
}

/* Convert "HH:MM" or "HH:MM:SS" to Date for today */
function scheduledTimeToTodayDate(timeStr: string): Date | null {
  if (!timeStr) return null
  const parts = timeStr.split(":").map((p) => Number(p))
  if (parts.length < 2) return null
  const hours = parts[0] ?? 0
  const minutes = parts[1] ?? 0
  const now = new Date()
  const dt = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0, 0)
  return dt
}

/* ---------- Page (server component) ---------- */

export default async function StudentSchedulesPage() {
  const schedules = (await getSchedules()) as Schedule[]
  const busTimes = (await getBusTimes()) as BusTime[]
  const semesterSchedules = (await getSemesterSchedules()) as SemesterSchedule[]

  const currentDate = new Date()
  const currentSemester = semesterSchedules.find((sem) => isWithinSemester(currentDate, sem))

  // Filter schedules for active + current semester (or global)
  const activeSchedules = schedules.filter(
    (schedule) =>
      schedule.is_active &&
      (!schedule.sem_schedule_id || schedule.sem_schedule_id === currentSemester?.sem_schedule_id),
  )

  // Build schedules with their bus times and computed next arrival
  const schedulesWithBusTimes = activeSchedules.map((schedule) => {
    const detailed_bus_times = busTimes
      .filter((bt) => bt.schedule_id === schedule.schedule_id)
      // ensure scheduled_departure_time exists
      .filter((bt) => !!bt.scheduled_departure_time)

    // compute next arrival time (today only)
    const now = new Date()
    const nextTimeDate = detailed_bus_times
      .map((bt) => scheduledTimeToTodayDate(bt.scheduled_departure_time))
      .filter((d): d is Date => d instanceof Date && !isNaN(d.getTime()))
      .filter((d) => d > now)
      .sort((a, b) => a.getTime() - b.getTime())[0] || null

    const next_arrival_time = nextTimeDate
      ? nextTimeDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : null

    return {
      ...schedule,
      detailed_bus_times,
      next_arrival_time,
    }
  })

  const isTodayHoliday = currentSemester ? isHoliday(currentDate, currentSemester) : false

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Student Schedules</h2>
            <p className="text-muted-foreground">View available bus schedules for the current academic period</p>
          </div>
        </div>

        {currentSemester && (
          <Card className="border-blue-200 bg-blue-50 bg-white/0 shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                Current Academic Period
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="font-medium">Academic Year</div>
                  <div className="text-muted-foreground">{currentSemester.academic_year}</div>
                </div>
                <div>
                  <div className="font-medium">Semester</div>
                  <div className="text-muted-foreground capitalize">{currentSemester.semester}</div>
                </div>
                <div>
                  <div className="font-medium">Period</div>
                  <div className="text-muted-foreground">
                    {new Date(currentSemester.start_date).toLocaleDateString()} -{" "}
                    {new Date(currentSemester.end_date).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {isTodayHoliday && (
                <Alert className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>Today is a holiday. Bus services may be limited or unavailable.</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Available Bus Schedules</CardTitle>
            <CardDescription>
              Active bus schedules for the current academic period. Times shown are based on route departure times and
              estimated stop durations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {schedulesWithBusTimes.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No active schedules available for the current academic period.
              </div>
            ) : (
              <div className="space-y-6">
                {schedulesWithBusTimes.map((schedule) => (
                  <Card key={schedule.schedule_id} className="border-2 border-primary/20">
                    <CardHeader className="bg-primary/5 p-4 rounded-t-lg">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Bus className="h-5 w-5" />
                        {schedule.route_name} {schedule.bus_number ? `- ${schedule.bus_number}` : ""}
                      </CardTitle>

                      <CardDescription className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4" />
                          {schedule.type_of_schedule === "weekly" && schedule.days_of_week
                            ? parseDaysOfWeek(schedule.days_of_week).join(", ")
                            : schedule.type_of_schedule === "daily"
                            ? `Daily (${schedule.start_date ? new Date(schedule.start_date).toLocaleDateString() : "N/A"} - ${schedule.end_date ? new Date(schedule.end_date).toLocaleDateString() : "N/A"})`
                            : `Semester (${schedule.start_date ? new Date(schedule.start_date).toLocaleDateString() : "N/A"} - ${schedule.end_date ? new Date(schedule.end_date).toLocaleDateString() : "N/A"})`}
                        </div>

                        <Badge variant={schedule.is_active ? "default" : "secondary"}>
                          {schedule.is_active ? "Active" : "Inactive"}
                        </Badge>

                        {schedule.academic_year && (
                          <div className="text-sm text-muted-foreground">
                            {schedule.academic_year} {schedule.semester ? `- ${schedule.semester}` : ""}
                          </div>
                        )}

                        {schedule.next_arrival_time && (
                          <div className="flex items-center gap-2 text-green-600 font-medium">
                            <Clock className="h-4 w-4" />
                            Next: {schedule.next_arrival_time}
                          </div>
                        )}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="p-4">
                      <h3 className="text-md font-semibold mb-3">Route Stops & Times:</h3>

                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Order</TableHead>
                            <TableHead>Stop Name</TableHead>
                            <TableHead>Scheduled Time</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>

                        <TableBody>
                          {schedule.detailed_bus_times.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center text-muted-foreground">
                                No bus times defined for this schedule.
                              </TableCell>
                            </TableRow>
                          ) : (
                            schedule.detailed_bus_times
                              .sort((a, b) => a.scheduled_departure_time.localeCompare(b.scheduled_departure_time))
                              .map((bt, index) => (
                                <TableRow key={bt.bus_time_id}>
                                  <TableCell>{index + 1}</TableCell>
                                  <TableCell className="font-medium flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    {bt.stop_name}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-4 w-4" />
                                      {bt.scheduled_departure_time}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="outline">{bt.status || "unknown"}</Badge>
                                  </TableCell>
                                </TableRow>
                              ))
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
