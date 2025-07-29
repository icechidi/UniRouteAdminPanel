import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bus, Users, Route, Calendar, AlertTriangle } from "lucide-react"
import { getDashboardStats } from "@/lib/db"

export default async function Dashboard() {
  const stats = await getDashboardStats()

  const statCards = [
    {
      title: "Active Buses",
      value: stats.buses,
      description: "Currently operational",
      icon: Bus,
      color: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Drivers",
      value: stats.drivers,
      description: "Licensed drivers",
      icon: Users,
      color: "text-green-600 dark:text-green-400",
    },
    {
      title: "Routes",
      value: stats.routes,
      description: "Active routes",
      icon: Route,
      color: "text-purple-600 dark:text-purple-400",
    },
    {
      title: "Schedules",
      value: stats.schedules,
      description: "Daily schedules",
      icon: Calendar,
      color: "text-orange-600 dark:text-orange-400",
    },
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates from the system</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                <Bus className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">New bus UNI-005 added to fleet</p>
                <p className="text-sm text-muted-foreground">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">Driver Sarah Williams completed route</p>
                <p className="text-sm text-muted-foreground">4 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900">
                <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">Route maintenance scheduled</p>
                <p className="text-sm text-muted-foreground">6 hours ago</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Current system health</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Bus Fleet</span>
              <span className="text-sm text-green-600 dark:text-green-400">Operational</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">GPS Tracking</span>
              <span className="text-sm text-green-600 dark:text-green-400">Active</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Route Planning</span>
              <span className="text-sm text-green-600 dark:text-green-400">Online</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Driver App</span>
              <span className="text-sm text-yellow-600 dark:text-yellow-400">Maintenance</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
