"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import Link from "next/link"

export default function NewRoutePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [stops, setStops] = useState([{ name: "", order: 1 }])

  const addStop = () => {
    setStops([...stops, { name: "", order: stops.length + 1 }])
  }

  const removeStop = (index: number) => {
    setStops(stops.filter((_, i) => i !== index))
  }

  const updateStop = (index: number, name: string) => {
    const newStops = [...stops]
    newStops[index].name = name
    setStops(newStops)
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)

    const formData = new FormData(event.currentTarget)
    const data = {
      title: formData.get("title") as string,
      from_location: formData.get("from_location") as string,
      to_location: formData.get("to_location") as string,
      distance_km: Number.parseFloat(formData.get("distance_km") as string),
      estimated_duration: Number.parseInt(formData.get("estimated_duration") as string),
      status: formData.get("status") as string,
      stops: stops.filter((stop) => stop.name.trim() !== ""),
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

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
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
              <Label htmlFor="title">Route Title</Label>
              <Input id="title" name="title" placeholder="Campus to Downtown" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="from_location">From</Label>
                <Input id="from_location" name="from_location" placeholder="University Campus" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="to_location">To</Label>
                <Input id="to_location" name="to_location" placeholder="Downtown Station" required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="distance_km">Distance (km)</Label>
                <Input id="distance_km" name="distance_km" type="number" step="0.1" placeholder="15.5" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estimated_duration">Duration (minutes)</Label>
                <Input id="estimated_duration" name="estimated_duration" type="number" placeholder="45" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Route Stops</Label>
              {stops.map((stop, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    placeholder={`Stop ${index + 1}`}
                    value={stop.name}
                    onChange={(e) => updateStop(index, e.target.value)}
                  />
                  {stops.length > 1 && (
                    <Button type="button" variant="outline" size="sm" onClick={() => removeStop(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addStop}>
                <Plus className="mr-2 h-4 w-4" />
                Add Stop
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select name="status" defaultValue="active">
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="maintenance">Under Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Route"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
