"use client"

import { useState, useEffect } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2 } from 'lucide-react'
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { getBuses } from "@/lib/db"

import DashboardLayout from "../dashboard-layout"

interface Bus {
  bus_id: number
  bus_number: string
  license_plate: string
  capacity: number
  model: string
  year: number
  status: string
  created_at: string
  updated_at: string
}

// export default  function BusesPage() {
//   const buses = await getBuses()


export default function BusesPage() {
  const [buses, setBuses] = useState<Bus[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchBuses()
  }, [])

  const fetchBuses = async () => {
    try {
      const response = await fetch("/api/buses")
      if (response.ok) {
        const data = await response.json()
        setBuses(data)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch buses",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (busId: number, busNumber: string) => {
    if (!confirm(`Are you sure you want to delete bus "${busNumber}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/buses/${busId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setBuses(buses.filter((bus) => bus.bus_id !== busId))
        toast({
          title: "Success",
          description: `Bus "${busNumber}" deleted successfully`,
        })
      } else {
        throw new Error("Failed to delete bus")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete bus",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <div className="p-6">Loading...</div>
  }


  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Buses</h2>
            <p className="text-muted-foreground">Manage your bus fleet</p>
          </div>
          <Button asChild>
            <Link href="/buses/new">
              <Plus className="mr-2 h-4 w-4" />
              Add New Bus
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Bus Fleet</CardTitle>
            <CardDescription>A list of all buses in your fleet.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bus Number</TableHead>
                  <TableHead>License Plate</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {buses.map((bus) => (
                  <TableRow key={bus.bus_id}>
                    <TableCell className="font-medium">{bus.bus_number}</TableCell>
                    <TableCell>{bus.license_plate}</TableCell>
                    <TableCell>
                      {bus.model} ({bus.year})
                    </TableCell>
                    <TableCell>{bus.capacity} seats</TableCell>
                    <TableCell>
                      <Badge variant={bus.status === "active" ? "default" : "secondary"}>{bus.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => router.push(`/buses/edit/${bus.bus_id}`)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(bus.bus_id, bus.bus_number)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

               {buses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No buses found. Add some buses to get started.
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
