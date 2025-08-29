"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface Message {
  message_id: number
  message_text: string
  category: string
}

export default function EditMessagePage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [message, setMessage] = useState<Message | null>(null)

  useEffect(() => {
    if (params.id) {
      fetchMessage()
    }
  }, [params.id])

  const fetchMessage = async () => {
    try {
      const response = await fetch(`/api/messages/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setMessage(data)
      } else {
        throw new Error("Failed to fetch message")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load message data",
        variant: "destructive",
      })
      router.push("/messages")
    } finally {
      setFetchLoading(false)
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)

    const formData = new FormData(event.currentTarget)
    const data = {
      message_text: formData.get("message_text") as string,
      category: formData.get("category") as string,
    }

    try {
      const response = await fetch(`/api/messages/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Message updated successfully",
        })
        router.push("/messages")
      } else {
        throw new Error("Failed to update message")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update message",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (fetchLoading) {
    return <div className="p-6">Loading...</div>
  }

  if (!message) {
    return <div className="p-6">Message not found</div>
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/messages">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Edit Message</h2>
          <p className="text-muted-foreground">Update message content and category</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Message Details</CardTitle>
          <CardDescription>Update the content and category for this message.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="message_text">Message Text</Label>
              <Textarea id="message_text" name="message_text" defaultValue={message.message_text} required rows={5} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select name="category" defaultValue={message.category} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="emergency">Emergency</SelectItem>
                  <SelectItem value="schedule">Schedule</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="driver">Driver</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Message"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
