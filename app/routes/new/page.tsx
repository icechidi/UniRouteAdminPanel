"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import Link from "next/link"

export default function NewRoutePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [stops, setStops] = useState([
    { stop_name: "", longitude: "", latitude: "", arrival_time: "" },
  ])

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

    const formData = new FormData(event.currentTarget)
    const data = {
      route_name: formData.get("route_name") as string,
      is_active: formData.get("is_active") === "on",
      stops: stops.filter((stop) => stop.stop_name.trim() !== ""),
    }

    try {
      const response = await fetch("/api/routes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Route added successfully",
        })
        router.push("/routes")
      } else {
        throw new Error("Failed to add route")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add route",
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
            <Link href="/routes">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Add New Route</h2>
            <p className="text-muted-foreground">Create a new bus route</p>
          </div>
        </div>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Route Information</CardTitle>
            <CardDescription>Enter the details for the new route.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="route_name">Route Name</Label>
              <Input id="route_name" name="route_name" placeholder="Campus to Downtown" required />
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="is_active" name="is_active" defaultChecked />
              <Label htmlFor="is_active">Active Route</Label>
            </div>

            <div className="space-y-2">
              <Label>Route Stops</Label>
              {stops.map((stop, index) => (
                <div key={index} className="flex flex-col gap-2 border p-3 rounded-md">
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
              {loading ? "Adding..." : "Add Route"}
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
