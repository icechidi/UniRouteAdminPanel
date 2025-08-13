"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Save, SettingsIcon } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"

interface SettingsFormProps {
  initialSettings: Record<string, string>
  dbConfigured: boolean
}

export default function SettingsForm({ initialSettings, dbConfigured }: SettingsFormProps) {
  const { toast } = useToast()
  const [settings, setSettings] = useState(initialSettings)
  const [loading, setLoading] = useState(false)

  const updateSetting = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    if (!dbConfigured) {
      toast({
        title: "Database Not Configured",
        description: "Settings cannot be saved in demo mode or without database connection.",
        variant: "destructive",
      })
      return
    }
    setLoading(true)
    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Settings saved successfully",
        })
      } else {
        throw new Error("Failed to save settings")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            General Settings
          </CardTitle>
          <CardDescription>Basic system configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="system_name">System Name</Label>
              <Input
                id="system_name"
                value={settings.system_name || ""}
                onChange={(e) => updateSetting("system_name", e.target.value)}
                placeholder="UniRoute"
                disabled={!dbConfigured}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max_capacity_per_bus">Max Capacity Per Bus</Label>
              <Input
                id="max_capacity_per_bus"
                type="number"
                value={settings.max_capacity_per_bus || ""}
                onChange={(e) => updateSetting("max_capacity_per_bus", e.target.value)}
                placeholder="50"
                disabled={!dbConfigured}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="booking_advance_days">Booking Advance Days</Label>
            <Input
              id="booking_advance_days"
              type="number"
              value={settings.booking_advance_days || ""}
              onChange={(e) => updateSetting("booking_advance_days", e.target.value)}
              placeholder="7"
              disabled={!dbConfigured}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
          <CardDescription>Support and contact details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="support_email">Support Email</Label>
              <Input
                id="support_email"
                type="email"
                value={settings.support_email || ""}
                onChange={(e) => updateSetting("support_email", e.target.value)}
                placeholder="support@uniroute.edu"
                disabled={!dbConfigured}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="support_phone">Support Phone</Label>
              <Input
                id="support_phone"
                value={settings.support_phone || ""}
                onChange={(e) => updateSetting("support_phone", e.target.value)}
                placeholder="+1234567890"
                disabled={!dbConfigured}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>Current system information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Database Status</Label>
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${dbConfigured ? "bg-green-500" : "bg-red-500"}`}></div>
                <span className="text-sm">{dbConfigured ? "Connected" : "Not Configured / Demo Mode"}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Last Backup</Label>
              <span className="text-sm text-muted-foreground">{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading || !dbConfigured}>
          <Save className="mr-2 h-4 w-4" />
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  )
}
