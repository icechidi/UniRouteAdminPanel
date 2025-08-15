"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function EditBusPage() {
  const router = useRouter()
  const { toast } = useToast()
  const params = useParams()
  const busId = params?.id
  const [loading, setLoading] = useState(false)
  const [bus, setBus] = useState<any>(null)

  useEffect(() => {
    async function fetchBus() {
      const res = await fetch(`/api/buses/${busId}`)
      if (res.ok) {
        setBus(await res.json())
      } else {
        toast({ title: "Error", description: "Bus not found", variant: "destructive" })
      }
    }
    if (busId) fetchBus()
  }, [busId])

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    const formData = new FormData(event.currentTarget)
    const data = {
      bus_number: formData.get("bus_number"),
      license_plate: formData.get("license_plate"),
      capacity: Number(formData.get("capacity")),
      model: formData.get("model"),
      year: Number(formData.get("year")),
      status: formData.get("status"),
    }
    const res = await fetch(`/api/buses/${busId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (res.ok) {
      toast({ title: "Success", description: "Bus updated successfully" })
      router.push("/buses")
    } else {
      toast({ title: "Error", description: "Failed to update bus", variant: "destructive" })
    }
    setLoading(false)
  }

  if (!bus) return <div className="p-6">Loading...</div>

  return (
    <div className="relative h-[90vh] p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link href="/buses">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">Edit Bus</h2>
      </div>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Bus Information</CardTitle>
          <CardDescription>Edit the details for this bus.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bus_number">Bus Number</Label>
              <Input id="bus_number" name="bus_number" defaultValue={bus.bus_number} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="license_plate">License Plate</Label>
              <Input id="license_plate" name="license_plate" defaultValue={bus.license_plate} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity</Label>
              <Input id="capacity" name="capacity" type="number" defaultValue={bus.capacity} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input id="model" name="model" defaultValue={bus.model} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Input id="year" name="year" type="number" defaultValue={bus.year} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Input id="status" name="status" defaultValue={bus.status} required />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Bus"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
