
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Clock, CalendarDays, Bus, MapPin } from 'lucide-react'
import { getSchedules, getBusTimes } from "@/lib/db"
import DashboardLayout from "../dashboard-layout"

export default async function StudentSchedulesPage() {
  const schedules = await getSchedules()
  const busTimes = await getBusTimes() // Fetch all bus times to display details

  // Group bus times by schedule for easier display
  const schedulesWithBusTimes = schedules.map((schedule) => ({
    ...schedule,
    detailed_bus_times: busTimes.filter((bt) => bt.schedule_id === schedule.schedule_id),
  }))

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">My Schedules</h2>
            <p className="text-muted-foreground">View your assigned bus schedules</p>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>My Bus Schedules</CardTitle>
            <CardDescription>Your assigned bus schedules for the semester.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Route</TableHead>
                  <TableHead>Bus</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedulesWithBusTimes.map((schedule) => (
                  <TableRow key={schedule.schedule_id}>
                    <TableCell className="font-medium">{schedule.route_name}</TableCell>
                    <TableCell>{schedule.bus_number}</TableCell>
                    <TableCell>{schedule.driver_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{schedule.type_of_schedule}</Badge>
                    </TableCell>
                    <TableCell>
                      {schedule.start_date && schedule.end_date ? (
                        <div className="flex items-center gap-1 text-sm">
                          <CalendarDays className="h-4 w-4" />
                          {new Date(schedule.start_date).toLocaleDateString()} -{" "}
                          {new Date(schedule.end_date).toLocaleDateString()}
                        </div>
                      ) : (
                        "N/A"
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {schedule.days_of_week ? JSON.parse(schedule.days_of_week).join(", ") : "Daily"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={schedule.is_active ? "default" : "secondary"}>
                        {schedule.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
