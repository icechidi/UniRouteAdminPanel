"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Clock, MapPin, Bus } from 'lucide-react'
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

import { getBusTimes } from "@/lib/db"
import DashboardLayout from "../dashboard-layout"
import { Button } from "@/components/ui/button"

interface BusTime {
  bus_time_id: number
  schedule_id: number
  route_stop_id: number
  scheduled_departure_time: string
  scheduled_arrival_time: string
  actual_departure_time: string | null
  actual_arrival_time: string | null
  status: string
  stop_name: string
  route_name: string
  bus_number: string
  type_of_schedule: string
}

export default function BusTimesPage() {
  // const busTimes = await getBusTimes()
  const [busTimes, setBusTimes] = useState<BusTime[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchBusTimes()
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
  
  if (busTimes.length === 0) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <h2 className="text-3xl font-bold tracking-tight">Bus Times</h2>
          <p className="text-muted-foreground">No bus times found. Add some schedules to generate bus times.</p>
        </div>
      </DashboardLayout>
    )
  } 

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Bus Times</h2>
            <p className="text-muted-foreground">Manage specific bus times at route stops</p>
          </div>
          <Button asChild>
            <Link href="/bus-times/new">
              <Plus className="mr-2 h-4 w-4" />
              Add New Bus Time
            </Link>
          </Button>
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
                      No bus times found. Add some schedules to generate bus times.
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
