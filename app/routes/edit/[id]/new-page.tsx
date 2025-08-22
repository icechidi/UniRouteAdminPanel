"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Plus, Trash2, Clock, MapPin } from "lucide-react"
import Link from "next/link"
import DashboardLayout from "@/app/dashboard-layout"
import { Switch } from "@/components/ui/switch"

interface Route {
  route_id: number
  route_name: string
  is_active: boolean
}

interface RouteTime {
  route_time_id: number
  departure_time: string
  is_active: boolean
}

interface RouteStop {
  route_stop_id: number
  stop_name: string
  longitude: number
  latitude: number
  stop_order: number
  estimated_duration: number
}

export default function EditRoutePage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [route, setRoute] = useState<Route | null>(null)
  const [routeTimes, setRouteTimes] = useState<RouteTime[]>([])
  const [routeStops, setRouteStops] = useState<RouteStop[]>([])

  useEffect(() => {
    if (params.id) {
      fetchRouteData()
    }
  }, [params.id])

  const fetchRouteData = async () => {
    try {
      const [routeRes, timesRes, stopsRes] = await Promise.all([
        fetch(`/api/routes/${params.id}`),
        fetch(`/api/route-times?route_id=${params.id}`),
        fetch(`/api/routes/stops?route_id=${params.id}`),
      ])

      if (routeRes.ok && timesRes.ok && stopsRes.ok) {
        const routeData = await routeRes.json()
        const timesData = await timesRes.json()
        const stopsData = await stopsRes.json()

        setRoute(routeData)
        setRouteTimes(timesData.length > 0 ? timesData : [{ route_time_id: 0, departure_time: "", is_active: true }])
        setRouteStops(
          stopsData.length > 0
            ? stopsData.sort((a: RouteStop, b: RouteStop) => a.stop_order - b.stop_order)
            : [{ route_stop_id: 0, stop_name: "", longitude: 0, latitude: 0, stop_order: 1, estimated_duration: 0 }],
        )
      } else {
        throw new Error("Failed to fetch route data")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load route data",
        variant: "destructive",
      })
      router.push("/routes")
    } finally {
      setFetchLoading(false)
    }
  }

  const addRouteTime = () => {
    setRouteTimes([...routeTimes, { route_time_id: 0, departure_time: "", is_active: true }])
  }

  const removeRouteTime = (index: number) => {
    if (routeTimes.length > 1) {
      setRouteTimes(routeTimes.filter((_, i) => i !== index))
    }
  }

  const updateRouteTime = (index: number, field: keyof RouteTime, value: string | boolean) => {
    const newRouteTimes = [...routeTimes]
    // @ts-ignore
    newRouteTimes[index][field] = value
    setRouteTimes(newRouteTimes)
  }

  const addRouteStop = () => {
    setRouteStops([
      ...routeStops,
      {
        route_stop_id: 0,
        stop_name: "",
        longitude: 0,
        latitude: 0,
        stop_order: routeStops.length + 1,
        estimated_duration: 0,
      },
    ])
  }

  const removeRouteStop = (index: number) => {
    if (routeStops.length > 1) {
      const newStops = routeStops.filter((_, i) => i !== index)
      // Update stop orders
      newStops.forEach((stop, i) => {
        stop.stop_order = i + 1
      })
      setRouteStops(newStops)
    }
  }

  const updateRouteStop = (index: number, field: keyof RouteStop, value: string | number) => {
    const newRouteStops = [...routeStops]
    // @ts-ignore
    newRouteStops[index][field] = value
    setRouteStops(newRouteStops)
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)

    const formData = new FormData(event.currentTarget)
    const routeData = {
      route_name: formData.get("route_name") as string,
      is_active: formData.get("is_active") === "on",
      route_times: routeTimes.filter((rt) => rt.departure_time),
      route_stops: routeStops.filter((rs) => rs.stop_name && rs.longitude && rs.latitude),
    }

    try {
      const response = await fetch(`/api/routes/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(routeData),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Route updated successfully",
        })
        router.push("/routes")
      } else {
        throw new Error("Failed to update route")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update route",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (fetchLoading) {
    return <div className="p-6">Loading...</div>
  }

  if (!route) {
    return <div className="p-6">Route not found</div>
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/routes">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Edit Route</h2>
          <p className="text-muted-foreground">Update route information, departure times, and stops</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Route Information</CardTitle>
            <CardDescription>Update the basic details for this route.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="route_name">Route Name</Label>
              <Input id="route_name" name="route_name" defaultValue={route.route_name} required />
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="is_active" name="is_active" defaultChecked={route.is_active} />
              <Label htmlFor="is_active">Active Route</Label>
            </div>
          </CardContent>
        </Card>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Departure Times
            </CardTitle>
            <CardDescription>Update departure times for this route.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {routeTimes.map((routeTime, index) => (
              <div key={index} className="flex items-center gap-4 p-3 border rounded-md">
                <div className="flex-1">
                  <Label htmlFor={`departure_time_${index}`}>Departure Time {index + 1}</Label>
                  <Input
                    id={`departure_time_${index}`}
                    type="time"
                    value={routeTime.departure_time}
                    onChange={(e) => updateRouteTime(index, "departure_time", e.target.value)}
                    required
                  />
                </div>
                {routeTimes.length > 1 && (
                  <Button type="button" variant="outline" size="sm" onClick={() => removeRouteTime(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addRouteTime}>
              <Plus className="mr-2 h-4 w-4" />
              Add Departure Time
            </Button>
          </CardContent>
        </Card>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Route Stops
            </CardTitle>
            <CardDescription>Update stops along this route with estimated travel duration.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {routeStops.map((stop, index) => (
              <div key={index} className="p-4 border rounded-md space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Stop {stop.stop_order}</h4>
                  {routeStops.length > 1 && (
                    <Button type="button" variant="outline" size="sm" onClick={() => removeRouteStop(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`stop_name_${index}`}>Stop Name</Label>
                    <Input
                      id={`stop_name_${index}`}
                      value={stop.stop_name}
                      onChange={(e) => updateRouteStop(index, "stop_name", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`estimated_duration_${index}`}>Duration from Start (minutes)</Label>
                    <Input
                      id={`estimated_duration_${index}`}
                      type="number"
                      min="0"
                      value={stop.estimated_duration}
                      onChange={(e) =>
                        updateRouteStop(index, "estimated_duration", Number.parseInt(e.target.value) || 0)
                      }
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`longitude_${index}`}>Longitude</Label>
                    <Input
                      id={`longitude_${index}`}
                      type="number"
                      step="any"
                      value={stop.longitude}
                      onChange={(e) => updateRouteStop(index, "longitude", Number.parseFloat(e.target.value) || 0)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`latitude_${index}`}>Latitude</Label>
                    <Input
                      id={`latitude_${index}`}
                      type="number"
                      step="any"
                      value={stop.latitude}
                      onChange={(e) => updateRouteStop(index, "latitude", Number.parseFloat(e.target.value) || 0)}
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addRouteStop}>
              <Plus className="mr-2 h-4 w-4" />
              Add Stop
            </Button>
          </CardContent>
        </Card>

        <div className="max-w-2xl">
          <Button type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update Route"}
          </Button>
        </div>
      </form>
    </div>
  )
}
