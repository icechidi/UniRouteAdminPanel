
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, MessageSquare, AlertTriangle, Calendar, User, Settings } from 'lucide-react'
import Link from "next/link"
import { getMessages } from "@/lib/db"
import DashboardLayout from "../dashboard-layout"

export default async function MessagesPage() {
  const messages = await getMessages()

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "emergency":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "schedule":
        return <Calendar className="h-4 w-4 text-blue-500" />
      case "admin":
        return <Settings className="h-4 w-4 text-purple-500" />
      case "driver":
        return <User className="h-4 w-4 text-green-500" />
      case "feedback":
        return <MessageSquare className="h-4 w-4 text-orange-500" />
      default:
        return <MessageSquare className="h-4 w-4" />
    }
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Messages</h2>
            <p className="text-muted-foreground">Manage system messages and user feedback</p>
          </div>
          <Button asChild>
            <Link href="/messages/new">
              <Plus className="mr-2 h-4 w-4" />
              Add New Message
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Messages</CardTitle>
            <CardDescription>A list of all predefined messages and user feedback.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Message Text</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {messages.map((message) => (
                  <TableRow key={message.message_id}>
                    <TableCell>
                      <Badge variant="outline" className="flex items-center gap-1 w-fit">
                        {getCategoryIcon(message.category)}
                        {message.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium max-w-[400px] truncate">
                      {message.message_text}
                    </TableCell>
                    <TableCell>{new Date(message.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
