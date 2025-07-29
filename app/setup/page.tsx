"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Bus, Database, CheckCircle, AlertCircle, Play } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"

export default function SetupPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [testLoading, setTestLoading] = useState(false)
  const [demoLoading, setDemoLoading] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "success" | "error">("idle")

  const handleDemoMode = async () => {
    setDemoLoading(true)
    try {
      // Enable demo mode
      const response = await fetch("/api/setup/demo", {
        method: "POST",
      })

      if (response.ok) {
        toast({
          title: "Demo Mode Activated",
          description: "You can now access the system with demo data!",
        })
        // Redirect to login in demo mode
        window.location.href = "/login"
      } else {
        throw new Error("Failed to activate demo mode")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to activate demo mode",
        variant: "destructive",
      })
    } finally {
      setDemoLoading(false)
    }
  }

  const testConnection = async (databaseUrl: string) => {
    setTestLoading(true)
    try {
      const response = await fetch("/api/setup/test-connection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ databaseUrl }),
      })

      if (response.ok) {
        setConnectionStatus("success")
        toast({
          title: "Success",
          description: "Database connection successful!",
        })
      } else {
        setConnectionStatus("error")
        const error = await response.json()
        toast({
          title: "Connection Failed",
          description: error.message || "Failed to connect to database",
          variant: "destructive",
        })
      }
    } catch (error) {
      setConnectionStatus("error")
      toast({
        title: "Error",
        description: "Failed to test connection",
        variant: "destructive",
      })
    } finally {
      setTestLoading(false)
    }
  }

  const handleSetup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)

    const formData = new FormData(event.currentTarget)
    const databaseUrl = formData.get("databaseUrl") as string

    try {
      const response = await fetch("/api/setup/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ databaseUrl }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Database setup completed successfully!",
        })
        // Redirect to login after successful setup
        window.location.href = "/login"
      } else {
        const error = await response.json()
        throw new Error(error.message || "Setup failed")
      }
    } catch (error) {
      toast({
        title: "Setup Failed",
        description: error instanceof Error ? error.message : "Setup failed",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <Card className="w-full max-w-2xl shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-blue-600 shadow-lg">
              <Bus className="h-8 w-8 text-white" />
            </div>
          </div>
          <div>
            <CardTitle className="text-3xl font-bold">UniRoute Setup</CardTitle>
            <CardDescription className="text-lg">Choose your setup option</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Demo Mode Option */}
          <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                <Play className="h-5 w-5" />
                Quick Demo Mode
              </CardTitle>
              <CardDescription className="text-green-600 dark:text-green-400">
                Perfect for v0 preview - No database required!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-green-700 dark:text-green-300 mb-4">
                Access the full system immediately with sample data. Perfect for testing and demonstration purposes.
              </p>
              <Button
                onClick={handleDemoMode}
                disabled={demoLoading}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                size="lg"
              >
                {demoLoading ? "Activating..." : "🚀 Start Demo Mode"}
              </Button>
            </CardContent>
          </Card>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or setup with database</span>
            </div>
          </div>

          {/* Database Setup Option */}
          <Alert>
            <Database className="h-4 w-4" />
            <AlertDescription>
              Configure your local PostgreSQL database connection. Make sure your PostgreSQL server is running locally.
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSetup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="databaseUrl">Local PostgreSQL Connection String</Label>
              <Input
                id="databaseUrl"
                name="databaseUrl"
                type="text"
                placeholder="postgresql://username:password@localhost:5432/uniroute"
                className="h-11 font-mono text-sm"
              />
              <p className="text-sm text-muted-foreground">
                Format: postgresql://username:password@localhost:5432/database_name
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const form = document.getElementById("databaseUrl") as HTMLInputElement
                  if (form.value) {
                    testConnection(form.value)
                  }
                }}
                disabled={testLoading}
                className="flex-1"
              >
                {testLoading ? "Testing..." : "Test Connection"}
              </Button>
              <Button type="submit" disabled={loading || connectionStatus !== "success"} className="flex-1">
                {loading ? "Setting up..." : "Complete Setup"}
              </Button>
            </div>
          </form>

          {connectionStatus === "success" && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription className="text-green-600">
                Database connection successful! You can now complete the setup.
              </AlertDescription>
            </Alert>
          )}

          {connectionStatus === "error" && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Database connection failed. Please check your connection string and ensure PostgreSQL is running.
              </AlertDescription>
            </Alert>
          )}

          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="text-sm font-semibold mb-2">Local PostgreSQL Setup:</h4>
            <ol className="space-y-1 text-sm text-muted-foreground list-decimal list-inside">
              <li>Install PostgreSQL on your local machine</li>
              <li>Create a database named 'uniroute'</li>
              <li>Note your username, password, and port (usually 5432)</li>
              <li>Use format: postgresql://username:password@localhost:5432/uniroute</li>
              <li>Test the connection above</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
