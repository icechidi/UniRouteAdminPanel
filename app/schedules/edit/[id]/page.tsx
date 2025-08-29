"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"

interface Schedule {
  schedule_id: number
  route_id: number
  bus_id: number
  sem_schedule_id: number | null
  type_of_schedule: string
  start_date: string | null
  end_date: string | null
  days_of_week: string | null
  is_active: boolean
}

interface Route {
  route_id: number
  route_name: string
}

interface Bus {
  bus_id: number
  bus_number: string
}

interface SemesterSchedule {
  sem_schedule_id: number
  academic_year: string
  semester: string
}

interface RouteStop {
  route_stop_id: number
  stop_name: string
  estimated_duration: number
}

interface RouteTime {
  route_time_id: number
  departure_time: string
}

interface BusTime {
  bus_time_id: number
  route_stop_id: number
  route_time_id: number
  scheduled_departure_time: string
  scheduled_arrival_time: string
}

const daysOfWeekOptions = [
  { id: "Monday", label: "Monday" },
  { id: "Tuesday", label: "Tuesday" },
  { id: "Wednesday", label: "Wednesday" },
  { id: "Thursday", label: "Thursday" },
  { id: "Friday", label: "Friday" },
  { id: "Saturday", label: "Saturday" },
  { id: "Sunday", label: "Sunday" },
]

export default function EditSchedulePage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [schedule, setSchedule] = useState<Schedule | null>(null)
  const [routes, setRoutes] = useState<Route[]>([])
  const [buses, setBuses] = useState<Bus[]>([])
  const [semesterSchedules, setSemesterSchedules] = useState<SemesterSchedule[]>([])
  const [routeStops, setRouteStops] = useState<RouteStop[]>([])
  const [routeTimes, setRouteTimes] = useState<RouteTime[]>([])
  const [busTimes, setBusTimes] = useState<BusTime[]>([])
  const [selectedDays, setSelectedDays] = useState<string[]>([])

  useEffect(() => {
    if (params.id) {
      fetchData()
    }
  }, [params.id])

  useEffect(() => {
    if (schedule && schedule.route_id) {
      fetchRouteStops(schedule.route_id)
      fetchRouteTimes(schedule.route_id)
    }
  }, [schedule])

  const fetchData = async () => {
    try {
      const [scheduleRes, routesRes, busesRes, semesterRes, busTimesRes] = await Promise.all([
        fetch(`/api/schedules/${params.id}`),
        fetch("/api/routes"),
        fetch("/api/buses"),
        fetch("/api/semester-schedules"),
        fetch(`/api/bus-times?schedule_id=${params.id}`),
      ])

      if (scheduleRes.ok && routesRes.ok && busesRes.ok && semesterRes.ok && busTimesRes.ok) {
        const scheduleData = await scheduleRes.json()
        const routesData = await routesRes.json()
        const busesData = await busesRes.json()
        const semesterData = await semesterRes.json()
        const busTimesData = await busTimesRes.json()

        setSchedule(scheduleData)
        setRoutes(routesData)
        setBuses(busesData)
        setSemesterSchedules(semesterData)
        setBusTimes(busTimesData)

        if (scheduleData.days_of_week) {
          setSelectedDays(JSON.parse(scheduleData.days_of_week))
        }
      } else {
        throw new Error("Failed to fetch schedule data")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load schedule data",
        variant: "destructive",
      })
      router.push("/schedules")
    } finally {
      setFetchLoading(false)
    }
  }

  const fetchRouteStops = async (routeId: number) => {
    try {
      const response = await fetch(`/api/routes/stops?route_id=${routeId}`)
      const data = await response.json()
      setRouteStops(data)
    } catch (error) {
      console.error("Failed to fetch route stops:", error)
    }
  }

  const fetchRouteTimes = async (routeId: number) => {
    try {
      const response = await fetch(`/api/route-times?route_id=${routeId}`)
      const data = await response.json()
      setRouteTimes(data)
    } catch (error) {
      console.error("Failed to fetch route times:", error)
    }
  }

  const handleDayChange = (day: string, checked: boolean) => {
    if (checked) {
      setSelectedDays([...selectedDays, day])
    } else {
      setSelectedDays(selectedDays.filter((d) => d !== day))
    }
  }

  const addBusTime = () => {
    setBusTimes([
      ...busTimes,
      {
        bus_time_id: 0,
        route_stop_id: 0,
        route_time_id: 0,
        scheduled_departure_time: "",
        scheduled_arrival_time: "",
      },
    ])
  }

  const removeBusTime = (index: number) => {
    setBusTimes(busTimes.filter((_, i) => i !== index))
  }

  const updateBusTime = (index: number, field: keyof BusTime, value: string | number) => {
    const newBusTimes = [...busTimes]
    // @ts-ignore
    newBusTimes[index][field] = value

    // Auto-calculate arrival time based on route time and stop duration
    if (field === "route_time_id" || field === "route_stop_id") {
      const routeTime = routeTimes.find((rt) => rt.route_time_id === newBusTimes[index].route_time_id)
      const routeStop = routeStops.find((rs) => rs.route_stop_id === newBusTimes[index].route_stop_id)

      if (routeTime && routeStop) {
        const [hours, minutes] = routeTime.departure_time.split(":").map(Number)
        const totalMinutes = hours * 60 + minutes + routeStop.estimated_duration
        const newHours = Math.floor(totalMinutes / 60) % 24
        const newMinutes = totalMinutes % 60
        const calculatedTime = `${newHours.toString().padStart(2, "0")}:${newMinutes.toString().padStart(2, "0")}`

        newBusTimes[index].scheduled_departure_time = calculatedTime
        newBusTimes[index].scheduled_arrival_time = calculatedTime
      }
    }

    setBusTimes(newBusTimes)
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)

    const formData = new FormData(event.currentTarget)
    const data = {
      route_id: Number.parseInt(formData.get("route_id") as string),
      bus_id: Number.parseInt(formData.get("bus_id") as string),
      sem_schedule_id: formData.get("sem_schedule_id")
        ? Number.parseInt(formData.get("sem_schedule_id") as string)
        : null,
      type_of_schedule: formData.get("type_of_schedule") as string,
      start_date: formData.get("start_date") || null,
      end_date: formData.get("end_date") || null,
      days_of_week: formData.get("type_of_schedule") === "weekly" ? selectedDays : null,
      is_active: formData.get("is_active") === "on",
      bus_times: busTimes.filter(
        (bt) => bt.route_stop_id && bt.route_time_id && bt.scheduled_departure_time && bt.scheduled_arrival_time,
      ),
    }

    try {
      const response = await fetch(`/api/schedules/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Schedule updated successfully",
        })
        router.push("/schedules")
      } else {
        throw new Error("Failed to update schedule")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update schedule",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (fetchLoading) {
    return <div className="p-6">Loading...</div>
  }

  if (!schedule) {
    return <div className="p-6">Schedule not found</div>
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/schedules">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Edit Schedule</h2>
          <p className="text-muted-foreground">Update schedule information</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Schedule Information</CardTitle>
          <CardDescription>Update the details for this schedule.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="route_id">Route</Label>
              <Select name="route_id" required defaultValue={schedule.route_id.toString()}>
                <SelectTrigger>
                  <SelectValue placeholder="Select route" />
                </SelectTrigger>
                <SelectContent>
                  {routes.map((route) => (
                    <SelectItem key={route.route_id} value={route.route_id.toString()}>
                      {route.route_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bus_id">Bus</Label>
                <Select name="bus_id" required defaultValue={schedule.bus_id.toString()}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select bus" />
                  </SelectTrigger>
                  <SelectContent>
                    {buses.map((bus) => (
                      <SelectItem key={bus.bus_id} value={bus.bus_id.toString()}>
                        {bus.bus_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sem_schedule_id">Academic Schedule</Label>
                <Select name="sem_schedule_id" defaultValue={schedule.sem_schedule_id?.toString() || ""}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select academic schedule" />
                  </SelectTrigger>
                  <SelectContent>
                    {semesterSchedules.map((sem) => (
                      <SelectItem key={sem.sem_schedule_id} value={sem.sem_schedule_id.toString()}>
                        {sem.academic_year} - {sem.semester}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type_of_schedule">Type of Schedule</Label>
              <Select name="type_of_schedule" required defaultValue={schedule.type_of_schedule}>
                <SelectTrigger>
                  <SelectValue placeholder="Select schedule type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="semester">Semester</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(schedule.type_of_schedule === "daily" || schedule.type_of_schedule === "semester") && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    name="start_date"
                    type="date"
                    defaultValue={schedule.start_date || ""}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date</Label>
                  <Input id="end_date" name="end_date" type="date" defaultValue={schedule.end_date || ""} required />
                </div>
              </div>
            )}

            {schedule.type_of_schedule === "weekly" && (
              <div className="space-y-2">
                <Label>Days of Week</Label>
                <div className="grid grid-cols-2 gap-2">
                  {daysOfWeekOptions.map((day) => (
                    <div key={day.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={day.id}
                        checked={selectedDays.includes(day.id)}
                        onCheckedChange={(checked) => handleDayChange(day.id, checked as boolean)}
                      />
                      <Label htmlFor={day.id} className="text-sm">
                        {day.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Bus Times at Stops</Label>
              {busTimes.map((bt, index) => (
                <div key={index} className="flex flex-col gap-2 border p-3 rounded-md">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Stop Time {index + 1}</h4>
                    {busTimes.length > 1 && (
                      <Button type="button" variant="outline" size="sm" onClick={() => removeBusTime(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`route_stop_id-${index}`}>Route Stop</Label>
                      <Select
                        value={bt.route_stop_id.toString()}
                        onValueChange={(value) => updateBusTime(index, "route_stop_id", Number.parseInt(value))}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select stop" />
                        </SelectTrigger>
                        <SelectContent>
                          {routeStops.map((stop) => (
                            <SelectItem key={stop.route_stop_id} value={stop.route_stop_id.toString()}>
                              {stop.stop_name} ({stop.estimated_duration} min)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`route_time_id-${index}`}>Departure Time</Label>
                      <Select
                        value={bt.route_time_id.toString()}
                        onValueChange={(value) => updateBusTime(index, "route_time_id", Number.parseInt(value))}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent>
                          {routeTimes.map((time) => (
                            <SelectItem key={time.route_time_id} value={time.route_time_id.toString()}>
                              {time.departure_time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`scheduled_departure_time-${index}`}>Calculated Departure</Label>
                      <Input
                        id={`scheduled_departure_time-${index}`}
                        type="time"
                        value={bt.scheduled_departure_time}
                        readOnly
                        className="bg-muted"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`scheduled_arrival_time-${index}`}>Calculated Arrival</Label>
                      <Input
                        id={`scheduled_arrival_time-${index}`}
                        type="time"
                        value={bt.scheduled_arrival_time}
                        readOnly
                        className="bg-muted"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addBusTime}>
                <Plus className="mr-2 h-4 w-4" />
                Add Bus Time
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="is_active" name="is_active" defaultChecked={schedule.is_active} />
              <Label htmlFor="is_active">Active Schedule</Label>
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Schedule"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
