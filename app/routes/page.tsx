"use client"

import { useState, useEffect } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, MapPin, Clock } from 'lucide-react'
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

import { getRoutes, getRouteStops } from "@/lib/db"

import DashboardLayout from "../dashboard-layout"
import { set } from "date-fns"

interface Route {
  route_id: number
  route_name: string
  is_active: boolean
  stops_count: number
  created_at: string
  updated_at: string
}

interface RouteStop {
  route_stop_id: number
  route_id: number
  stop_name: string
  stop_order: number
  arrival_time: string | null
  estimated_duration: number | null
  latitude: number | null
  longitude: number | null
  created_at: string
  updated_at: string
}

//Interface RouteStopTimeWithDetails extends RouteStop {
interface RouteTime {
  route_time_id: number
  route_id: number
  departure_time: string
  is_active: boolean
  route_name: string
}

// Main component for displaying routes and stops
export default function RoutesPage() {
  const [routes, setRoutes] = useState<Route[]>([])
  const [routeStops, setRouteStops] = useState<RouteStop[]>([])
  const [routeTimes, setRouteTimes] = useState<RouteTime[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [routesRes, stopsRes, timesRes] = await Promise.all([
        fetch("/api/routes"), 
        fetch("/api/route-stops"),
        fetch("/api/route-times")])

      if (routesRes.ok && stopsRes.ok && timesRes.ok) {
        const routesData = await routesRes.json()
        const stopsData = await stopsRes.json()
        const timesData = await timesRes.json()
        setRoutes(routesData)
        setRouteStops(stopsData)
        setRouteTimes(timesData)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Group stops by route_id
  const stopsByRoute = routeStops.reduce((acc, stop) => {
    acc[stop.route_id] = acc[stop.route_id] || []
    acc[stop.route_id].push(stop)
    return acc
  }, {} as Record<string, typeof routeStops>)


  const handleDeleteRoute = async (routeId: number, routeName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete the route "${routeName}"? 
        This will also delete all associated stops.`
      )
    ) {
      return
    }

    try {
      const response = await fetch(`/api/routes/${routeId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setRoutes(routes.filter((route) => route.route_id !== routeId))
        setRouteStops(routeStops.filter((stop) => stop.route_id !== routeId))
        setRouteTimes(routeTimes.filter((time) => time.route_id !== routeId))
        toast({
          title: "Success",
          description: `Route "${routeName}" deleted successfully`,
        })
      } else {
        throw new Error("Failed to delete route")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete route",
        variant: "destructive",
      })
    }
  }

  const handleDeleteStop = async (stopId: number, stopName: string) => {
    if (!confirm(`Are you sure you want to delete the stop "${stopName}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/route-stops/${stopId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setRouteStops(routeStops.filter((stop) => stop.route_stop_id !== stopId))
        toast({
          title: "Success",
          description: `Stop "${stopName}" deleted successfully`,
        })
      } else {
        throw new Error("Failed to delete stop")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete stop",
        variant: "destructive",
      })
    }
  }

  const handleDeleteRouteTime = async (routeTimeId: number, departureTime: string) => {
    if (!confirm(`Are you sure you want to delete the departure time "${departureTime}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/route-times/${routeTimeId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setRouteTimes(routeTimes.filter((time) => time.route_time_id !== routeTimeId))
        toast({
          title: "Success",
          description: `Departure time "${departureTime}" deleted successfully`,
        })
      } else {
        throw new Error("Failed to delete route time")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete route time",
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
            <h2 className="text-3xl font-bold tracking-tight">Routes</h2>
            <p className="text-muted-foreground">Manage your bus routes, stops, and departure times</p>
          </div>
          <Button asChild>
            <Link href="/routes/new">
              <Plus className="mr-2 h-4 w-4" />
              Add New Route
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Route Network</CardTitle>
            <CardDescription>A list of all routes in your network.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Route Name</TableHead>
                  <TableHead>Stops</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {routes.map((route) => (
                  <TableRow key={route.route_id}>
                    <TableCell className="font-medium">{route.route_name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {route.stops_count}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={route.is_active ? "default" : "secondary"}>
                        {route.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => router.push(`/routes/edit/${route.route_id}`)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteRoute(route.route_id, route.route_name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {routes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      No routes found. Add some routes to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Route Departure Times</CardTitle>
            <CardDescription>
              All departure times for each route, stacked in one column.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Route</TableHead>
                  <TableHead>Departure Times</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {routes.map((route) => {
                  const times = routeTimes.filter((t) => t.route_id === route.route_id)
                  return (
                    <TableRow key={route.route_id}>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="px-6 py-1 text-ss min-w-[160px] flex justify-center items-center"
                        >
                          {route.route_name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          {times.length > 0 ? (
                            times.map((time) => (
                              <span
                                key={time.route_time_id}
                                className="inline-flex items-center px-3 py-1 rounded-md bg-muted text-xs font-semibold border"
                                style={{ background: time.is_active ? "#63709c" : "#f5f5f5" }}
                              >
                                <Clock className="h-3 w-3 mr-1" />
                                {time.departure_time}
                              </span>
                            ))
                          ) : (
                            <span className="text-muted-foreground text-xs">No times</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          {times.map((time) => (
                            <Button
                              key={time.route_time_id}
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/route-times/edit/${time.route_time_id}`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
                {routes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                      No routes found. Add some routes to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

      <Card>
        <CardHeader>
          <CardTitle>Route Stops</CardTitle>
          <CardDescription>All stops across your route network with their estimated arrival times.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Route</TableHead>
                <TableHead>Stop Name</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Duration from Start</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {routeStops.map((stop) => {
                const route = routes.find((r) => r.route_id === stop.route_id)
                return (
                  <TableRow key={stop.route_stop_id}>
                    <TableCell>
                      <Badge variant="outline">{route?.route_name || "Unknown Route"}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{stop.stop_name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-muted-foreground">#</span>
                        {stop.stop_order}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {stop.estimated_duration} min
                      </div>
                    </TableCell>
                    <TableCell>
                      {stop.latitude && stop.longitude ? (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span className="text-sm text-muted-foreground">
                            {Number(stop.latitude).toFixed(4)}, {Number(stop.longitude).toFixed(4)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">No location</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/route-stops/edit/${stop.route_stop_id}`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteStop(stop.route_stop_id, stop.stop_name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
              {routeStops.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No route stops found. Add some routes and stops to get started.
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
