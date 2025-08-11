"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Bus, Play } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [demoLoading, setDemoLoading] = useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)

    const formData = new FormData(event.currentTarget)
    const data = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    }

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Logged in successfully",
        })
        window.location.href = "/"
      } else {
        const error = await response.json()
        throw new Error(error.message || "Login failed")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Login failed",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = async () => {
    setDemoLoading(true)
    try {
      const response = await fetch("/api/auth/demo-login", {
        method: "POST",
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Demo login successful",
        })
        router.push("/")
        router.refresh()
      } else {
        throw new Error("Demo login failed")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Demo login failed",
        variant: "destructive",
      })
    } finally {
      setDemoLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-blue-600 shadow-lg">
              <Bus className="h-8 w-8 text-white" />
            </div>
          </div>
          <div>
            <CardTitle className="text-3xl font-bold">UniRoute</CardTitle>
            <CardDescription className="text-lg">University Bus Tracking System</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Demo Login Button */}
          <div className="space-y-2">
            <Button
              onClick={handleDemoLogin}
              disabled={loading || demoLoading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3"
              size="lg"
            >
              <Play className="mr-2 h-4 w-4" />
              {demoLoading ? "Signing in..." : "🚀 Demo Login (Instant Access)"}
            </Button>
            <div className="flex justify-center">
              <Badge variant="secondary" className="text-xs">
                No database required • Perfect for v0
              </Badge>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or sign in manually</span>
            </div>
          </div>

          {/* Manual Login Form */}
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="admin@uniroute.edu" required className="h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                required
                className="h-11"
              />
            </div>
            <Button type="submit" className="w-full h-11 font-semibold" disabled={loading || demoLoading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="text-sm font-semibold mb-2">Demo Credentials:</h4>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>
                <strong>Admin:</strong> admin@uniroute.edu / password
              </p>
              <p>
                <strong>Manager:</strong> manager@uniroute.edu / password
              </p>
              <p>
                <strong>Student:</strong> student@uniroute.edu / password
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
