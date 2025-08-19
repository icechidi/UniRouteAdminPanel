"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
  start_date: string
  end_date: string
}

interface RouteStop {
  route_stop_id: number
  stop_name: string
  route_id: number
  estimated_duration: number // minutes from route departure to this stop
}

interface RouteTime {
  route_time_id: number
  route_id: number
  departure_time: string // "HH:MM"
}

type ScheduleType = "weekly" | "daily" | "semester"

const daysOfWeekOptions = [
  { id: "Monday", label: "Monday" },
  { id: "Tuesday", label: "Tuesday" },
  { id: "Wednesday", label: "Wednesday" },
  { id: "Thursday", label: "Thursday" },
  { id: "Friday", label: "Friday" },
  { id: "Saturday", label: "Saturday" },
  { id: "Sunday", label: "Sunday" },
]

export default function NewSchedulePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const [routes, setRoutes] = useState<Route[]>([])
  const [buses, setBuses] = useState<Bus[]>([])
  const [semesterSchedules, setSemesterSchedules] = useState<SemesterSchedule[]>([])
  const [routeStops, setRouteStops] = useState<RouteStop[]>([])
  const [routeTimes, setRouteTimes] = useState<RouteTime[]>([])

  const [selectedRouteId, setSelectedRouteId] = useState<string>("")
  const [scheduleType, setScheduleType] = useState<ScheduleType>("weekly")
  const [selectedDays, setSelectedDays] = useState<string[]>([])

  const [busTimes, setBusTimes] = useState<
    Array<{
      route_stop_id: string
      route_time_id: string
      scheduled_departure_time: string
      scheduled_arrival_time: string
    }>
  >([{ route_stop_id: "", route_time_id: "", scheduled_departure_time: "", scheduled_arrival_time: "" }])

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (selectedRouteId) {
      const id = Number.parseInt(selectedRouteId)
      fetchRouteStops(id)
      fetchRouteTimes(id)
    } else {
      setRouteStops([])
      setRouteTimes([])
      setBusTimes([{ route_stop_id: "", route_time_id: "", scheduled_departure_time: "", scheduled_arrival_time: "" }])
    }
  }, [selectedRouteId])

  const fetchData = async () => {
    try {
      const [routesRes, busesRes, semesterRes] = await Promise.all([
        fetch("/api/routes"),
        fetch("/api/buses"),
        fetch("/api/semester-schedules"),
      ])

      const routesData = await routesRes.json()
      const busesData = await busesRes.json()
      const semesterData = await semesterRes.json()

      setRoutes(routesData)
      setBuses(busesData)
      setSemesterSchedules(semesterData)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      })
    }
  }

  // Keep your original stops endpoint shape from this file
  const fetchRouteStops = async (routeId: number) => {
    try {
      const response = await fetch(`/api/route-stops?route_id=${routeId}`)
      const data = await response.json()
      // Ensure estimated_duration exists (fallback 0)
      const normalized: RouteStop[] = data.map((s: any) => ({
        route_stop_id: s.route_stop_id,
        stop_name: s.stop_name,
        route_id: s.route_id,
        estimated_duration: typeof s.estimated_duration === "number" ? s.estimated_duration : 0,
      }))
      setRouteStops(normalized)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load route stops",
        variant: "destructive",
      })
    }
  }

  // Add route-times fetching (used for auto-calc)
  const fetchRouteTimes = async (routeId: number) => {
    try {
      const response = await fetch(`/api/route-times?route_id=${routeId}`)
      const data = await response.json()
      setRouteTimes(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load route times",
        variant: "destructive",
      })
    }
  }

  const handleDayChange = (day: string, checked: boolean) => {
    setSelectedDays((prev) => (checked ? [...prev, day] : prev.filter((d) => d !== day)))
  }

  const addBusTime = () => {
    setBusTimes((prev) => [
      ...prev,
      { route_stop_id: "", route_time_id: "", scheduled_departure_time: "", scheduled_arrival_time: "" },
    ])
  }

  const removeBusTime = (index: number) => {
    setBusTimes((prev) => prev.filter((_, i) => i !== index))
  }

  const updateBusTime = (index: number, field: string, value: string) => {
    const newBusTimes = [...busTimes]
    // @ts-ignore dynamic index update
    newBusTimes[index][field] = value

    // Recalculate when either the selected route_time or stop changes
    if (field === "route_time_id" || field === "route_stop_id") {
      const rt = routeTimes.find((t) => t.route_time_id.toString() === newBusTimes[index].route_time_id)
      const rs = routeStops.find((s) => s.route_stop_id.toString() === newBusTimes[index].route_stop_id)

      if (rt && rs) {
        const [h, m] = rt.departure_time.split(":").map(Number)
        const base = h * 60 + m
        const total = base + (rs.estimated_duration || 0)
        const hh = Math.floor(total / 60) % 24
        const mm = total % 60
        const calculated = `${hh.toString().padStart(2, "0")}:${mm.toString().padStart(2, "0")}`
        newBusTimes[index].scheduled_departure_time = calculated
        newBusTimes[index].scheduled_arrival_time = calculated
      } else {
        newBusTimes[index].scheduled_departure_time = ""
        newBusTimes[index].scheduled_arrival_time = ""
      }
    }

    setBusTimes(newBusTimes)
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)

    const formData = new FormData(event.currentTarget)
    const payload = {
      route_id: Number.parseInt(formData.get("route_id") as string),
      bus_id: Number.parseInt(formData.get("bus_id") as string),
      sem_schedule_id: formData.get("sem_schedule_id")
        ? Number.parseInt(formData.get("sem_schedule_id") as string)
        : null,
      type_of_schedule: scheduleType,
      start_date: formData.get("start_date") || null,
      end_date: formData.get("end_date") || null,
      days_of_week: scheduleType === "weekly" ? selectedDays : null,
      is_active: formData.get("is_active") === "on",
      bus_times: busTimes.filter(
        (bt) => bt.route_stop_id && bt.route_time_id && bt.scheduled_departure_time && bt.scheduled_arrival_time
      ),
    }

    try {
      const response = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        toast({ title: "Success", description: "Schedule added successfully" })
        router.push("/schedules")
      } else {
        throw new Error("Failed to add schedule")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add schedule",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Scroll helpers
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const scrollToTop = () => scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" })
  const scrollToBottom = () =>
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })

  return (
    <div className="relative h-[90vh] p-6">
      {/* Scrollable content */}
      <div ref={scrollRef} className="overflow-y-auto h-full space-y-6 pr-2">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/schedules">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Add New Schedule</h2>
            <p className="text-muted-foreground">Create a new bus schedule</p>
          </div>
        </div>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Schedule Information</CardTitle>
            <CardDescription>Enter the details for the new schedule.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="route_id">Route</Label>
                <Select name="route_id" required value={selectedRouteId} onValueChange={setSelectedRouteId}>
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
                  <Select name="bus_id" required>
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

                {/* Semester schedule (NEW, driver removed) */}
                <div className="space-y-2">
                  <Label htmlFor="sem_schedule_id">Academic Schedule</Label>
                  <Select name="sem_schedule_id">
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
                <Select
                  name="type_of_schedule"
                  value={scheduleType}
                  onValueChange={(value: ScheduleType) => setScheduleType(value)}
                  required
                >
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

              {(scheduleType === "daily" || scheduleType === "semester") && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input id="start_date" name="start_date" type="date" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_date">End Date</Label>
                    <Input id="end_date" name="end_date" type="date" required />
                  </div>
                </div>
              )}

              {scheduleType === "weekly" && (
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

              {/* Bus times with auto-calculated times using route_times + estimated_duration */}
              <div className="space-y-2">
                <Label>Bus Times at Stops</Label>
                {busTimes.map((bt, index) => (
                  <div key={index} className="flex flex-col gap-2 border p-3 rounded-md">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Stop {index + 1} Time</h4>
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
                          value={bt.route_stop_id}
                          onValueChange={(value) => updateBusTime(index, "route_stop_id", value)}
                          required
                          disabled={routeStops.length === 0}
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
                        <Label htmlFor={`route_time_id-${index}`}>Route Departure</Label>
                        <Select
                          value={bt.route_time_id}
                          onValueChange={(value) => updateBusTime(index, "route_time_id", value)}
                          required
                          disabled={routeTimes.length === 0}
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

                <Button
                  type="button"
                  variant="outline"
                  onClick={addBusTime}
                  disabled={routeStops.length === 0 || routeTimes.length === 0}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Bus Time
                </Button>
                {(routeStops.length === 0 || routeTimes.length === 0) && (
                  <p className="text-sm text-muted-foreground">Select a route first to add bus times.</p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="is_active" name="is_active" defaultChecked />
                <Label htmlFor="is_active">Active Schedule</Label>
              </div>

              <Button type="submit" disabled={loading}>
                {loading ? "Adding..." : "Add Schedule"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Scroll buttons */}
      <div className="fixed bottom-8 right-8 flex flex-col gap-2 z-50">
        <Button variant="secondary" size="icon" onClick={scrollToTop} aria-label="Scroll to top">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M5 15l7-7 7 7" />
          </svg>
        </Button>
        <Button variant="secondary" size="icon" onClick={scrollToBottom} aria-label="Scroll to bottom">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M19 9l-7 7-7-7" />
          </svg>
        </Button>
      </div>
    </div>
  )
}
