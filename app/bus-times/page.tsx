"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Clock, MapPin } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import DashboardLayout from "../dashboard-layout"

interface BusTime {
  bus_time_id: number
  schedule_id: number
  route_stop_id: number
  route_time_id: number | null
  scheduled_departure_time: string
  scheduled_arrival_time: string
  actual_departure_time: string | null
  actual_arrival_time: string | null
  status: string
  stop_name: string
  route_name: string
  bus_number: string
  route_departure_time: string | null
}

export default function BusTimesPage() {
  const [busTimes, setBusTimes] = useState<BusTime[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchBusTimes()
    fetchRouteTimes()
  }, [])

  const fetchBusTimes = async () => {
    try {
      const response = await fetch("/api/bus-times")
      if (response.ok) {
        const data = await response.json()
        setBusTimes(data)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch bus times",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

const [routeTimes, setRouteTimes] = useState<any[]>([])

const fetchRouteTimes = async () => {
  try {
    const response = await fetch("/api/route-times")
    if (response.ok) {
      const data = await response.json()
      setRouteTimes(data)
    }
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to fetch route times",
      variant: "destructive",
    })
  }
}

  const handleDelete = async (busTimeId: number, stopName: string) => {
    if (!confirm(`Are you sure you want to delete the bus time for stop "${stopName}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/bus-times/${busTimeId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setBusTimes(busTimes.filter((bt) => bt.bus_time_id !== busTimeId))
        toast({
          title: "Success",
          description: `Bus time for "${stopName}" deleted successfully`,
        })
      } else {
        throw new Error("Failed to delete bus time")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete bus time",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Bus Times</h2>
            <p className="text-muted-foreground">
              Manage specific bus times at route stops based on route departure times
            </p>
          </div>
          <Button asChild>
            <Link href="/bus-times/new">
              <Plus className="mr-2 h-4 w-4" />
              Add New Bus Time
            </Link>
          </Button>
        </div>

        {/* Bus Route Times Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Bus Route Times</CardTitle>
            <CardDescription>
              List of route departure times for all routes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Route</TableHead>
                  <TableHead>Departure Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {routeTimes.map((rt) => (
                  <TableRow key={rt.route_time_id}>
                    <TableCell>{rt.route_name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {rt.departure_time}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{rt.is_active ? "Active" : "Inactive"}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/route-times/edit/${rt.route_time_id}`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {/* handle delete logic here */}}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {routeTimes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      No route times found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
    
        {/* Bus Stop Times Card */}
        <Card>
          <CardHeader>
            <CardTitle>Bus Stop Times</CardTitle>
            <CardDescription>
              Detailed list of bus arrivals and departures calculated from route departure times and stop durations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Bus</TableHead>
                  <TableHead>Stop Name</TableHead>
                  <TableHead>Route Departure</TableHead>
                  <TableHead>Calculated Arrival</TableHead>
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
                        {bt.route_departure_time || bt.scheduled_departure_time}
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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/bus-times/edit/${bt.bus_time_id}`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(bt.bus_time_id, bt.stop_name)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {busTimes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      No bus times found. Create schedules to generate bus times automatically.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
