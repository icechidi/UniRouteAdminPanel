import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Activity, User } from 'lucide-react'
import { getUserActivityLogs, getUsers } from "@/lib/db"


import DashboardLayout from "../dashboard-layout"

export default async function ActivityLogsPage() {
  const logs = await getUserActivityLogs()
  const users = await getUsers() // Fetch all users to map user_id to name
  const userMap = new Map(users.map(user => [user.user_id, `${user.first_name} ${user.last_name}`]));
  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Activity Logs</h2>
            <p className="text-muted-foreground">Track user activities within the system</p>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>System Activity</CardTitle>
            <CardDescription>A chronological record of user actions.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Activity Type</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.log_id}>
                    <TableCell className="font-medium flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      {userMap.get(log.user_id) || `User ID: ${log.user_id}`}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{log.activity_type}</Badge>
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate text-sm text-muted-foreground">
                      {log.details ? JSON.stringify(log.details) : "N/A"}
                    </TableCell>
                    <TableCell>{log.ip_address || "N/A"}</TableCell>
                    <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
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
