import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, MapPin } from "lucide-react"
import Link from "next/link"
import { getRoutes } from "@/lib/db"

export default async function RoutesPage() {
  const routes = await getRoutes()

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Routes</h2>
          <p className="text-muted-foreground">Manage your bus routes</p>
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
                <TableHead>Route Title</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Distance</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Stops</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {routes.map((route) => (
                <TableRow key={route.id}>
                  <TableCell className="font-medium">{route.title}</TableCell>
                  <TableCell>{route.from_location}</TableCell>
                  <TableCell>{route.to_location}</TableCell>
                  <TableCell>{route.distance_km} km</TableCell>
                  <TableCell>{route.estimated_duration} min</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {route.stops_count}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={route.status === "active" ? "default" : "secondary"}>{route.status}</Badge>
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
  )
}
