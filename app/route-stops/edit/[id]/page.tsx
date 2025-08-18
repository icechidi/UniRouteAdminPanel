"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function EditRouteStopPage({ params }: { params: { id: string } }) {
  const [stop, setStop] = useState<any>(null)
  const [route, setRoute] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    async function fetchStopAndRoute() {
      const stopRes = await fetch(`/api/route-stops/${params.id}`)
      const stopData = await stopRes.json()
      if (stopData.error) {
        toast({ title: "Error", description: "Stop not found", variant: "destructive" })
        router.push("/routes")
        setLoading(false)
        return
      }
      setStop(stopData)
      // Fetch route info using stop.route_id
      const routeRes = await fetch(`/api/routes/${stopData.route_id}`)
      const routeData = await routeRes.json()
      if (routeData.route) {
        setRoute(routeData.route)
      }
      setLoading(false)
    }
    fetchStopAndRoute()
  }, [params.id])

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault()
    const response = await fetch(`/api/route-stops/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(stop),
    })
    if (response.ok) {
      toast({ title: "Success", description: "Stop updated" })
      router.push("/routes")
    } else {
      toast({ title: "Error", description: "Failed to update stop", variant: "destructive" })
    }
  }

  if (loading) return <div className="p-6">Loading...</div>
  if (!stop) return <div className="p-6">Stop not found</div>

  return (
    <div className="p-6 max-w-xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link href="/routes">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </Button>
        <h2 className="text-2xl font-bold">Edit Route Stop</h2>
      </div>
      {route && (
        <div className="mb-4">
          <Label>Route:</Label>
          <div className="font-semibold">{route.route_name}</div>
        </div>
      )}
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <Label htmlFor="stop_name">Stop Name</Label>
          <Input
            id="stop_name"
            value={stop.stop_name}
            onChange={e => setStop({ ...stop, stop_name: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="longitude">Longitude</Label>
          <Input
            id="longitude"
            type="number"
            step="0.0000001"
            value={stop.longitude ?? ""}
            onChange={e => setStop({ ...stop, longitude: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="latitude">Latitude</Label>
          <Input
            id="latitude"
            type="number"
            step="0.0000001"
            value={stop.latitude ?? ""}
            onChange={e => setStop({ ...stop, latitude: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="arrival_time">Arrival Time</Label>
          <Input
            id="arrival_time"
            type="time"
            value={stop.arrival_time ?? ""}
            onChange={e => setStop({ ...stop, arrival_time: e.target.value })}
          />
        </div>
        <Button type="submit">Save</Button>
      </form>
    </div>
  )
}