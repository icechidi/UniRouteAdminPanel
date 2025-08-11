
"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { AlertTriangle, Send } from 'lucide-react'
import { getSession } from "@/lib/auth"
import DashboardLayout from "../dashboard-layout"

interface Route {
  route_id: number
  route_name: string
}

interface Bus {
  bus_id: number
  bus_number: string
}

interface Message {
  message_id: number
  message_text: string
}

interface UserSession {
  user_id: number
  first_name: string
  last_name: string
  role_name: string
}

export default function EmergencyTriggerPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [routes, setRoutes] = useState<Route[]>([])
  const [buses, setBuses] = useState<Bus[]>([])
  const [emergencyMessages, setEmergencyMessages] = useState<Message[]>([])
  const [user, setUser] = useState<UserSession | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [routesRes, busesRes, messagesRes] = await Promise.all([
        fetch("/api/routes"),
        fetch("/api/buses"),
        fetch("/api/messages?category=emergency"),
      ])

      const routesData = await routesRes.json()
      const busesData = await busesRes.json()
      const messagesData = await messagesRes.json()

      setRoutes(routesData)
      setBuses(busesData)
      setEmergencyMessages(messagesData)

      // Get current user session
      const sessionRes = await fetch("/api/auth/session") // Assuming you have a session API route
      if (sessionRes.ok) {
        const sessionData = await sessionRes.json()
        setUser(sessionData.user)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load data for emergency trigger",
        variant: "destructive",
      })
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)

    if (!user || user.role_name !== "driver") {
      toast({
        title: "Unauthorized",
        description: "Only drivers can trigger emergency notifications.",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    const formData = new FormData(event.currentTarget)
    const data = {
      route_id: Number.parseInt(formData.get("route_id") as string),
      bus_id: Number.parseInt(formData.get("bus_id") as string),
      user_id: user.user_id, // Driver's user_id
      message_id: Number.parseInt(formData.get("message_id") as string),
      // For simplicity, location can be hardcoded or fetched via browser API
      location_longitude: -77.045, // Example longitude
      location_latitude: 38.915, // Example latitude
    }

    try {
      const response = await fetch("/api/emergency-notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Emergency notification sent!",
        })
        router.push("/") // Redirect to dashboard or a confirmation page
      } else {
        throw new Error("Failed to send emergency notification")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send emergency notification",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Emergency Trigger</h2>
            <p className="text-muted-foreground">Send an emergency notification to administrators</p>
          </div>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-2" />
            <CardTitle className="text-2xl">Trigger Emergency</CardTitle>
            <CardDescription>
              Use this form to send an urgent alert. This action will notify administrators.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!user || user.role_name !== "driver" ? (
              <div className="text-center text-red-500 font-semibold py-4">
                You must be logged in as a Driver to access this feature.
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="route_id">Affected Route</Label>
                  <Select name="route_id" required>
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

                <div className="space-y-2">
                  <Label htmlFor="bus_id">Affected Bus</Label>
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
                  <Label htmlFor="message_id">Emergency Message</Label>
                  <Select name="message_id" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select emergency message" />
                    </SelectTrigger>
                    <SelectContent>
                      {emergencyMessages.map((message) => (
                        <SelectItem key={message.message_id} value={message.message_id.toString()}>
                          {message.message_text}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" disabled={loading} className="w-full bg-red-600 hover:bg-red-700">
                  <Send className="mr-2 h-4 w-4" />
                  {loading ? "Sending..." : "Send Emergency Alert"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
