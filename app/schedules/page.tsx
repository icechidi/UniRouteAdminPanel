import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Clock } from "lucide-react"
import Link from "next/link"
import { getSchedules } from "@/lib/db"

export default async function SchedulesPage() {
  const schedules = await getSchedules()

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Schedules</h2>
          <p className="text-muted-foreground">Manage bus schedules</p>
        </div>
        <Button asChild>
          <Link href="/schedules/new">
            <Plus className="mr-2 h-4 w-4" />
            Add New Schedule
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bus Schedules</CardTitle>
          <CardDescription>A list of all scheduled bus routes.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Route</TableHead>
                <TableHead>Bus</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Departure</TableHead>
                <TableHead>Arrival</TableHead>
                <TableHead>Days</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedules.map((schedule) => (
                <TableRow key={schedule.id}>
                  <TableCell className="font-medium">{schedule.route_title}</TableCell>
                  <TableCell>{schedule.bus_number}</TableCell>
                  <TableCell>{schedule.driver_name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {schedule.departure_time}
                    </div>
                  </TableCell>
                  <TableCell>{schedule.arrival_time}</TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {JSON.parse(schedule.days_of_week).join(", ")}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={schedule.status === "active" ? "default" : "secondary"}>{schedule.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
