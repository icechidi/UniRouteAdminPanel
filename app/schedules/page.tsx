"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, CalendarDays } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

import DashboardLayout from "../dashboard-layout"

interface Schedule {
  schedule_id: number
  route_name: string
  bus_number: string
  academic_year: string | null
  semester: string | null
  type_of_schedule: string
  start_date: string | null
  end_date: string | null
  days_of_week: string | null
  is_active: boolean
  created_at: string
}

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchSchedules()
  }, [])

  const fetchSchedules = async () => {
    try {
      const response = await fetch("/api/schedules")
      if (response.ok) {
        const data = await response.json()
        setSchedules(data)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch schedules",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (scheduleId: number, routeName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete the schedule for route "${routeName}"? This will also delete all associated bus times.`,
      )
    ) {
      return
    }

    try {
      const response = await fetch(`/api/schedules/${scheduleId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setSchedules(schedules.filter((schedule) => schedule.schedule_id !== scheduleId))
        toast({
          title: "Success",
          description: `Schedule for "${routeName}" deleted successfully`,
        })
      } else {
        throw new Error("Failed to delete schedule")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete schedule",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">Loading...</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
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
                  <TableHead>Academic Year</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedules.map((schedule) => (
                  <TableRow key={schedule.schedule_id}>
                    <TableCell className="font-medium">{schedule.route_name}</TableCell>
                    <TableCell>{schedule.bus_number}</TableCell>
                    <TableCell>
                      {schedule.academic_year && schedule.semester ? (
                        <div className="text-sm">
                          <div className="font-medium">{schedule.academic_year}</div>
                          <div className="text-muted-foreground capitalize">{schedule.semester}</div>
                        </div>
                      ) : (
                        "N/A"
                      )}
                    </TableCell>
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
                        {schedule.days_of_week
                          ? (() => {
                              const value = String(schedule.days_of_week);
                              if (value.trim().startsWith("[")) {
                                try {
                                  return JSON.parse(value).join(", ");
                                } catch {
                                  return value;
                                }
                              }
                              return value.split(",").map(day => day.trim()).join(", ");
                            })()
                          : "Daily"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={schedule.is_active ? "default" : "secondary"}>
                        {schedule.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/schedules/edit/${schedule.schedule_id}`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(schedule.schedule_id, schedule.route_name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {schedules.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      No schedules found. Add some schedules to get started.
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
