"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import DashboardLayout from "@/app/dashboard-layout"
import Link from "next/link"

export default function EditRoutePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [routeName, setRouteName] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [stops, setStops] = useState<any[]>([])
  const [initialLoading, setInitialLoading] = useState(true)

  useEffect(() => {
    async function fetchRoute() {
      setInitialLoading(true)
      const res = await fetch(`/api/routes/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setRouteName(data.route.route_name)
        setIsActive(data.route.is_active)
        setStops(
          data.stops.length > 0
            ? data.stops.map((stop: any) => ({
                ...stop,
                longitude: stop.longitude ?? "",
                latitude: stop.latitude ?? "",
                arrival_time: stop.arrival_time ?? "",
              }))
            : [{ stop_name: "", longitude: "", latitude: "", arrival_time: "" }]
        )
      } else {
        toast({ title: "Error", description: "Route not found", variant: "destructive" })
        router.push("/routes")
      }
      setInitialLoading(false)
    }
    fetchRoute()
    // eslint-disable-next-line
  }, [params.id])

  const addStop = () => {
    setStops([...stops, { stop_name: "", longitude: "", latitude: "", arrival_time: "" }])
  }

  const removeStop = (index: number) => {
    setStops(stops.filter((_, i) => i !== index))
  }

  const updateStop = (index: number, field: string, value: string) => {
    const newStops = [...stops]
    // @ts-ignore
    newStops[index][field] = value
    setStops(newStops)
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)

    const stopsToSend = stops
      .filter((stop) => stop.stop_name.trim() !== "")
      .map((stop, idx) => ({
        ...stop,
        stop_order: idx + 1,
      }))

    const data = {
      route_name: routeName,
      is_active: isActive,
      stops: stopsToSend,
    }

    try {
      const response = await fetch(`/api/routes/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
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

  if (initialLoading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <DashboardLayout>
    <div className="relative h-[90vh] p-6">
      {/* Scrollable content */}
      <div ref={scrollRef} className="overflow-y-auto h-full space-y-6 pr-2">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/routes">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Edit Route</h2>
            <p className="text-muted-foreground">Update route and stops</p>
          </div>
        </div>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Route Information</CardTitle>
            <CardDescription>Edit the details for this route.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="route_name">Route Name</Label>
                <Input
                  id="route_name"
                  name="route_name"
                  placeholder="Campus to Downtown"
                  value={routeName}
                  onChange={e => setRouteName(e.target.value)}
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  name="is_active"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
                <Label htmlFor="is_active">Active Route</Label>
              </div>

              <div className="space-y-2">
                <Label>Route Stops</Label>
                {stops.map((stop, index) => (
                  <div key={stop.route_stop_id ?? index} className="flex flex-col gap-2 border p-3 rounded-md">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Stop {index + 1}</h4>
                      {stops.length > 1 && (
                        <Button type="button" variant="outline" size="sm" onClick={() => removeStop(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`stop_name-${index}`}>Stop Name</Label>
                      <Input
                        id={`stop_name-${index}`}
                        placeholder={`Stop ${index + 1} Name`}
                        value={stop.stop_name}
                        onChange={(e) => updateStop(index, "stop_name", e.target.value)}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`longitude-${index}`}>Longitude</Label>
                        <Input
                          id={`longitude-${index}`}
                          type="number"
                          step="0.0000001"
                          placeholder="-77.0369"
                          value={stop.longitude}
                          onChange={(e) => updateStop(index, "longitude", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`latitude-${index}`}>Latitude</Label>
                        <Input
                          id={`latitude-${index}`}
                          type="number"
                          step="0.0000001"
                          placeholder="38.9072"
                          value={stop.latitude}
                          onChange={(e) => updateStop(index, "latitude", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`arrival_time-${index}`}>Expected Arrival Time</Label>
                      <Input
                        id={`arrival_time-${index}`}
                        type="time"
                        value={stop.arrival_time}
                        onChange={(e) => updateStop(index, "arrival_time", e.target.value)}
                      />
                    </div>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addStop}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Stop
                </Button>
              </div>

              <Button type="submit" disabled={loading}>
                {loading ? "Updating..." : "Update Route"}
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
    </DashboardLayout>
  )
}