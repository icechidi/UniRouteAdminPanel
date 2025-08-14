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

export default function NewBusTimePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [times, setTimes] = useState([
    { bus_number: "", departure_time: "", arrival_time: "" },
  ])

  const addTime = () => {
    setTimes([...times, { bus_number: "", departure_time: "", arrival_time: "" }])
  }

  const removeTime = (index: number) => {
    setTimes(times.filter((_, i) => i !== index))
  }

  const updateTime = (index: number, field: string, value: string) => {
    const newTimes = [...times]
    // @ts-ignore
    newTimes[index][field] = value
    setTimes(newTimes)
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    const formData = new FormData(event.currentTarget)
    const data = {
      route_id: formData.get("route_id") as string,
      is_active: formData.get("is_active") === "on",
      times: times.filter((time) => time.bus_number.trim() !== ""),
    }

    try {
      const response = await fetch("/api/bus-times", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Bus time added successfully",
        })
        router.push("/bus-times")
      } else {
        throw new Error("Failed to add bus time")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add bus time",
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
            <Link href="/bus-times">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Add New Bus Time</h2>
            <p className="text-muted-foreground">Create a new bus time entry</p>
          </div>
        </div>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Bus Time Information</CardTitle>
            <CardDescription>Enter the details for the new bus time.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="route_id">Route ID</Label>
              <Input id="route_id" name="route_id" placeholder="Route ID" required />
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="is_active" name="is_active" defaultChecked />
              <Label htmlFor="is_active">Active Bus Time</Label>
            </div>

            <div className="space-y-2">
              <Label>Bus Times</Label>
              {times.map((time, index) => (
                <div key={index} className="flex flex-col gap-2 border p-3 rounded-md">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Bus Time {index + 1}</h4>
                    {times.length > 1 && (
                      <Button type="button" variant="outline" size="sm" onClick={() => removeTime(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`bus_number-${index}`}>Bus Number</Label>
                    <Input
                      id={`bus_number-${index}`}
                      placeholder={`Bus Number`}
                      value={time.bus_number}
                      onChange={(e) => updateTime(index, "bus_number", e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`departure_time-${index}`}>Departure Time</Label>
                      <Input
                        id={`departure_time-${index}`}
                        type="time"
                        value={time.departure_time}
                        onChange={(e) => updateTime(index, "departure_time", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`arrival_time-${index}`}>Arrival Time</Label>
                      <Input
                        id={`arrival_time-${index}`}
                        type="time"
                        value={time.arrival_time}
                        onChange={(e) => updateTime(index, "arrival_time", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addTime}>
                <Plus className="mr-2 h-4 w-4" />
                Add Bus Time
              </Button>
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Bus Time"}
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
