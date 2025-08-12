import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, MapPin, Clock } from 'lucide-react'
import Link from "next/link"
import { getRoutes, getRouteStops } from "@/lib/db"


import DashboardLayout from "../dashboard-layout"

export default async function RoutesPage() {
  const routes = await getRoutes()
  const routeStops = await getRouteStops()
  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Routes</h2>
            <p className="text-muted-foreground">Manage your bus routes and stops</p>
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

      <Card>
        <CardHeader>
          <CardTitle>Route Stops</CardTitle>
          <CardDescription>All stops across your route network with their details.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Route</TableHead>
                <TableHead>Stop Name</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Arrival Time</TableHead>
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
                        {stop.arrival_time || "Not set"}
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
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
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
