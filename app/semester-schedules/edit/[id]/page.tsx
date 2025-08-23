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
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import Dashboard from "@/app/page"
import DashboardLayout from "@/app/dashboard-layout"

interface SemesterSchedule {
  sem_schedule_id: number
  academic_year: string
  semester: string
  start_date: string
  end_date: string
  holidays: string
}

interface Holiday {
  date: string
  name: string
}

export default function EditSemesterSchedulePage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [semesterSchedule, setSemesterSchedule] = useState<SemesterSchedule | null>(null)
  const [holidays, setHolidays] = useState<Holiday[]>([{ date: "", name: "" }])

  useEffect(() => {
    if (params.id) {
      fetchSemesterSchedule()
    }
  }, [params.id])

  const fetchSemesterSchedule = async () => {
    try {
      const response = await fetch(`/api/semester-schedules/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setSemesterSchedule(data)

        // Parse holidays if they exist
        if (data.holidays) {
          const parsedHolidays = JSON.parse(data.holidays)
          setHolidays(parsedHolidays.length > 0 ? parsedHolidays : [{ date: "", name: "" }])
        }
      } else {
        throw new Error("Failed to fetch semester schedule")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load semester schedule data",
        variant: "destructive",
      })
      router.push("/semester-schedules")
    } finally {
      setFetchLoading(false)
    }
  }

  const addHoliday = () => {
    setHolidays([...holidays, { date: "", name: "" }])
  }

  const removeHoliday = (index: number) => {
    setHolidays(holidays.filter((_, i) => i !== index))
  }

  const updateHoliday = (index: number, field: string, value: string) => {
    const newHolidays = [...holidays]
    // @ts-ignore
    newHolidays[index][field] = value
    setHolidays(newHolidays)
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)

    const formData = new FormData(event.currentTarget)
    const data = {
      academic_year: formData.get("academic_year") as string,
      semester: formData.get("semester") as string,
      start_date: formData.get("start_date") as string,
      end_date: formData.get("end_date") as string,
      holidays: holidays.filter((h) => h.date && h.name),
    }

    try {
      const response = await fetch(`/api/semester-schedules/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Semester schedule updated successfully",
        })
        router.push("/semester-schedules")
      } else {
        throw new Error("Failed to update semester schedule")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update semester schedule",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (fetchLoading) {
    return <div className="p-6">Loading...</div>
  }

  if (!semesterSchedule) {
    return <div className="p-6">Semester schedule not found</div>
  }

  return (
    <DashboardLayout>
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/semester-schedules">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Edit Semester Schedule</h2>
          <p className="text-muted-foreground">Update academic semester schedule</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Semester Schedule Details</CardTitle>
          <CardDescription>Update the academic year, semester dates, and holidays.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="academic_year">Academic Year</Label>
                <Input id="academic_year" name="academic_year" defaultValue={semesterSchedule.academic_year} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="semester">Semester</Label>
                <Select name="semester" defaultValue={semesterSchedule.semester} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fall">Fall</SelectItem>
                    <SelectItem value="spring">Spring</SelectItem>
                    <SelectItem value="summer">Summer</SelectItem>
                    <SelectItem value="winter">Winter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  name="start_date"
                  type="date"
                  defaultValue={semesterSchedule.start_date}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">End Date</Label>
                <Input id="end_date" name="end_date" type="date" defaultValue={semesterSchedule.end_date} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Holidays (Optional)</Label>
              {holidays.map((holiday, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    placeholder="Holiday Name"
                    value={holiday.name}
                    onChange={(e) => updateHoliday(index, "name", e.target.value)}
                  />
                  <Input
                    type="date"
                    value={holiday.date}
                    onChange={(e) => updateHoliday(index, "date", e.target.value)}
                  />
                  {holidays.length > 1 && (
                    <Button type="button" variant="outline" size="sm" onClick={() => removeHoliday(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addHoliday}>
                <Plus className="mr-2 h-4 w-4" />
                Add Holiday
              </Button>
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Semester Schedule"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
    </DashboardLayout>
  )
}
