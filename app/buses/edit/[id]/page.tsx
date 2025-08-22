"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft } from "lucide-react"
import DashboardLayout from "@/app/dashboard-layout"
import Link from "next/link"


interface Bus {
  bus_id: number
  bus_number: string
  license_plate: string
  capacity: number
  model: string
  year: number
  status: string
}

export default function EditBusPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [bus, setBus] = useState<Bus | null>(null)

  useEffect(() => {
    if (params.id) {
      fetchBus()
    }
  }, [params.id])

  const fetchBus = async () => {
    try {
      const response = await fetch(`/api/buses/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setBus(data)
      } else {
        throw new Error("Failed to fetch bus")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load bus data",
        variant: "destructive",
      })
      router.push("/buses")
    } finally {
      setFetchLoading(false)
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)

    const formData = new FormData(event.currentTarget)
    const data = {
      bus_number: formData.get("bus_number") as string,
      license_plate: formData.get("license_plate") as string,
      capacity: Number.parseInt(formData.get("capacity") as string),
      model: formData.get("model") as string,
      year: Number.parseInt(formData.get("year") as string),
      status: formData.get("status") as string,
    }

    try {
      const response = await fetch(`/api/buses/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Bus updated successfully",
        })
        router.push("/buses")
      } else {
        throw new Error("Failed to update bus")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update bus",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (fetchLoading) {
    return <div className="p-6">Loading...</div>
  }

  if (!bus) {
    return <div className="p-6">Bus not found</div>
  }

  return (
    <DashboardLayout>
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/buses">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Edit Bus</h2>
          <p className="text-muted-foreground">Update bus information</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Bus Information</CardTitle>
          <CardDescription>Update the details for this bus.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bus_number">Bus Number</Label>
                <Input id="bus_number" name="bus_number" defaultValue={bus.bus_number} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="license_plate">License Plate</Label>
                <Input id="license_plate" name="license_plate" defaultValue={bus.license_plate} required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input id="capacity" name="capacity" type="number" defaultValue={bus.capacity} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Input id="model" name="model" defaultValue={bus.model} required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input id="year" name="year" type="number" defaultValue={bus.year} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select name="status" defaultValue={bus.status}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Bus"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
    </DashboardLayout>
  )
}
