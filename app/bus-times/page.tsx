import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Clock, MapPin, Bus } from 'lucide-react'
import Link from "next/link"
import { getBusTimes } from "@/lib/db"


import DashboardLayout from "../dashboard-layout"

import { Button } from "@/components/ui/button"

export default async function BusTimesPage() {
  const busTimes = await getBusTimes()

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Bus Times</h2>
            <p className="text-muted-foreground">Manage specific bus times at route stops</p>
          </div>
          {/* Note: Adding new bus times is primarily done via the New Schedule page */}
          {/* <Button asChild>
            <Link href="/bus-times/new">
              <Plus className="mr-2 h-4 w-4" />
              Add New Bus Time
            </Link>
          </Button> */}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Bus Stop Times</CardTitle>
            <CardDescription>A detailed list of scheduled bus arrivals and departures at each stop.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Bus</TableHead>
                  <TableHead>Stop Name</TableHead>
                  <TableHead>Scheduled Departure</TableHead>
                  <TableHead>Scheduled Arrival</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {busTimes.map((bt) => (
                  <TableRow key={bt.bus_time_id}>
                    <TableCell className="font-medium">Schedule #{bt.schedule_id}</TableCell>
                    <TableCell>{bt.route_name}</TableCell>
                    <TableCell>{bt.bus_number}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {bt.stop_name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {bt.scheduled_departure_time}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {bt.scheduled_arrival_time}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{bt.status}</Badge>
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
    </DashboardLayout>
  )
}
