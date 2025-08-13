"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
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

interface User {
  user_id: number
  first_name: string
  last_name: string
}

interface RouteStop {
  route_stop_id: number
  stop_name: string
  route_id: number
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

export default function NewSchedulePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [routes, setRoutes] = useState<Route[]>([])
  const [buses, setBuses] = useState<Bus[]>([])
  const [drivers, setDrivers] = useState<User[]>([])
  const [routeStops, setRouteStops] = useState<RouteStop[]>([])

  const [selectedRouteId, setSelectedRouteId] = useState<string>("")
  const [scheduleType, setScheduleType] = useState<"weekly" | "daily" | "semester">("weekly")
  const [selectedDays, setSelectedDays] = useState<string[]>([])
  const [busTimes, setBusTimes] = useState([
    { route_stop_id: "", scheduled_departure_time: "", scheduled_arrival_time: "" },
  ])

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (selectedRouteId) {
      fetchRouteStops(Number.parseInt(selectedRouteId))
    } else {
      setRouteStops([])
      setBusTimes([{ route_stop_id: "", scheduled_departure_time: "", scheduled_arrival_time: "" }])
    }
  }, [selectedRouteId])

  const fetchData = async () => {
    try {
      const [routesRes, busesRes, usersRes] = await Promise.all([
        fetch("/api/routes"),
        fetch("/api/buses"),
        fetch("/api/users?role=driver"), // Fetch only drivers
      ])

      const routesData = await routesRes.json()
      const busesData = await busesRes.json()
      const driversData = await usersRes.json()

      setRoutes(routesData)
      setBuses(busesData)
      setDrivers(driversData)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      })
    }
  }

  const fetchRouteStops = async (routeId: number) => {
    try {
      const response = await fetch(`/api/routes/${routeId}/stops`)
      const data = await response.json()
      setRouteStops(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load route stops",
        variant: "destructive",
      })
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
    setBusTimes([...busTimes, { route_stop_id: "", scheduled_departure_time: "", scheduled_arrival_time: "" }])
  }

  const removeBusTime = (index: number) => {
    setBusTimes(busTimes.filter((_, i) => i !== index))
  }

  const updateBusTime = (index: number, field: string, value: string) => {
    const newBusTimes = [...busTimes]
    // @ts-ignore
    newBusTimes[index][field] = value
    setBusTimes(newBusTimes)
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)

    const formData = new FormData(event.currentTarget)
    const data = {
      route_id: Number.parseInt(formData.get("route_id") as string),
      bus_id: Number.parseInt(formData.get("bus_id") as string),
      driver_user_id: Number.parseInt(formData.get("driver_user_id") as string),
      type_of_schedule: scheduleType,
      start_date: formData.get("start_date") || null,
      end_date: formData.get("end_date") || null,
      days_of_week: scheduleType === "weekly" ? selectedDays : null,
      is_active: formData.get("is_active") === "on",
      bus_times: busTimes.filter(
        (bt) => bt.route_stop_id && bt.scheduled_departure_time && bt.scheduled_arrival_time,
      ),
    }

    try {
      const response = await fetch("/api/schedules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Schedule added successfully",
        })
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
  const scrollToTop = () => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" })
  }
  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
    }
  }

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
              <Select
                name="route_id"
                required
                value={selectedRouteId}
                onValueChange={setSelectedRouteId}
              >
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
              <div className="space-y-2">
                <Label htmlFor="driver_user_id">Driver</Label>
                <Select name="driver_user_id" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select driver" />
                  </SelectTrigger>
                  <SelectContent>
                    {drivers.map((driver) => (
                      <SelectItem key={driver.user_id} value={driver.user_id.toString()}>
                        {driver.first_name} {driver.last_name}
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
                onValueChange={(value: "weekly" | "daily" | "semester") => setScheduleType(value)}
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
                            {stop.stop_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`scheduled_departure_time-${index}`}>Departure Time</Label>
                      <Input
                        id={`scheduled_departure_time-${index}`}
                        type="time"
                        value={bt.scheduled_departure_time}
                        onChange={(e) => updateBusTime(index, "scheduled_departure_time", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`scheduled_arrival_time-${index}`}>Arrival Time</Label>
                      <Input
                        id={`scheduled_arrival_time-${index}`}
                        type="time"
                        value={bt.scheduled_arrival_time}
                        onChange={(e) => updateBusTime(index, "scheduled_arrival_time", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addBusTime} disabled={routeStops.length === 0}>
                <Plus className="mr-2 h-4 w-4" />
                Add Bus Time
              </Button>
              {routeStops.length === 0 && (
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
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 15l7-7 7 7"/></svg>
        </Button>
        <Button variant="secondary" size="icon" onClick={scrollToBottom} aria-label="Scroll to bottom">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7"/></svg>
        </Button>
      </div>
    </div>
  )
}
