"use client"

import type React from "react"

import DashboardLayout from "../dashboard-layout"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { MessageSquarePlus } from 'lucide-react'

export default function FeedbackPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    // ...existing submit logic...
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Submit Feedback</h2>
            <p className="text-muted-foreground">Share your thoughts and suggestions with us</p>
          </div>
        </div>
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <MessageSquarePlus className="h-12 w-12 text-blue-600 mx-auto mb-2" />
            <CardTitle className="text-2xl">We Value Your Feedback</CardTitle>
            <CardDescription>
              Help us improve UniRoute by providing your valuable feedback.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="feedback_text">Your Feedback</Label>
                <Textarea
                  id="feedback_text"
                  name="feedback_text"
                  placeholder="Enter your feedback here..."
                  required
                  rows={7}
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Submitting..." : "Submit Feedback"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
