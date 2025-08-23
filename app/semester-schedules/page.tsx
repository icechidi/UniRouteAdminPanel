import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, CalendarDays, BookOpen } from 'lucide-react'
import Link from "next/link"
import { getSemesterSchedules } from "@/lib/db"


import DashboardLayout from "../dashboard-layout"

export default async function SemesterSchedulesPage() {
  const semesterSchedules = await getSemesterSchedules()
  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Semester Schedules</h2>
            <p className="text-muted-foreground">Manage academic year bus schedules</p>
          </div>
          <Button asChild>
            <Link href="/semester-schedules/new">
              <Plus className="mr-2 h-4 w-4" />
              Add New Semester Schedule
            </Link>
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Academic Schedules</CardTitle>
            <CardDescription>A list of all defined academic semester schedules.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Academic Year</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Holidays</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {semesterSchedules.map((semSchedule) => (
                  <TableRow key={semSchedule.sem_schedule_id}>
                    <TableCell className="font-medium">{semSchedule.academic_year}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{semSchedule.semester}</Badge>
                    </TableCell>
                    <TableCell>{new Date(semSchedule.start_date).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(semSchedule.end_date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {semSchedule.holidays && semSchedule.holidays.length > 0 ? (
                          <ul className="list-disc list-inside text-sm text-muted-foreground">
                            {semSchedule.holidays.map((holiday: any, index: number) => (
                              <li key={index}>
                                {holiday.name} ({new Date(holiday.date).toLocaleDateString()})
                              </li>
                            ))}
                          </ul>
                        ) : (
                          "None"
                        )}
                      </TableCell>
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
