import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Users, Bus, Route, Calendar, MessageSquare, Mail } from 'lucide-react'
import { getDashboardStats, getBuses, getUsers, getMessages } from "@/lib/db"

export default async function ReportsPage() {
  const stats = await getDashboardStats()
  const buses = await getBuses()
  const drivers = await getUsers("driver")
  const feedbackMessages = await getMessages("feedback")

  const activeBuses = buses.filter((b) => b.status === "active")

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
          <p className="text-muted-foreground">System analytics and reports</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fleet Utilization</CardTitle>
            <Bus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {buses.length > 0 ? Math.round((activeBuses.length / buses.length) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {activeBuses.length} of {buses.length} buses active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Drivers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.drivers}</div>
            <p className="text-xs text-muted-foreground">Licensed drivers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Routes</CardTitle>
            <Route className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.routes}</div>
            <p className="text-xs text-muted-foreground">Active routes in network</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Schedules</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.schedules}</div>
            <p className="text-xs text-muted-foreground">Currently active schedules</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Feedback</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.feedback}</div>
            <p className="text-xs text-muted-foreground">Unread feedback messages</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Bus Fleet Status</CardTitle>
            <CardDescription>Current status of all buses</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bus Number</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Capacity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {buses.slice(0, 5).map((bus) => (
                  <TableRow key={bus.bus_id}>
                    <TableCell className="font-medium">{bus.bus_number}</TableCell>
                    <TableCell>
                      <Badge variant={bus.status === "active" ? "default" : "secondary"}>{bus.status}</Badge>
                    </TableCell>
                    <TableCell>{bus.capacity}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Feedback</CardTitle>
            <CardDescription>Latest feedback messages from users</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Message</TableHead>
                  <TableHead>Received At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feedbackMessages.slice(0, 5).map((message) => (
                  <TableRow key={message.message_id}>
                    <TableCell className="font-medium max-w-[200px] truncate">
                      {message.message_text}
                    </TableCell>
                    <TableCell>{new Date(message.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
                {feedbackMessages.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground">
                      No feedback yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
