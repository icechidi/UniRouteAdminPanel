"use client"

import { useState } from "react"
import { Bus, Calendar, Home, Route, Settings, Users, ChevronRight, ChevronLeft, ChevronDown, BookOpen, MessageSquare, Clock, GraduationCap, AlertTriangle, Activity, Table } from 'lucide-react'
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

const menuItems = [
  {
    title: "OVERVIEW",
    items: [
      { title: "Dashboard", url: "/", icon: Home },
      { title: "Activity Logs", url: "/activity-logs", icon: Activity },
    ],
  },
  {
    title: "MANAGEMENT",
    collapsible: true,
    items: [
      { title: "Users", url: "/users", icon: Users },
      { title: "Buses", url: "/buses", icon: Bus },
      { title: "Routes", url: "/routes", icon: Route },
      { title: "Schedules", url: "/schedules", icon: Calendar },
      { title: "Bus Times", url: "/bus-times", icon: Clock },
      { title: "Semester Schedules", url: "/semester-schedules", icon: GraduationCap },
      { title: "Route Stop Time Info", url: "/info-route-stop-time", icon: Table }, // <-- Add this line
    ],
  },
  {
    title: "COMMUNICATION",
    collapsible: true,
    items: [
      { title: "Messages", url: "/messages", icon: MessageSquare },
      { title: "Emergency Trigger", url: "/emergency-trigger", icon: AlertTriangle },
      { title: "Feedback", url: "/feedback", icon: MessageSquare },
    ],
  },
  {
    title: "STUDENT PORTAL",
    collapsible: true,
    items: [{ title: "My Schedules", url: "/student-schedules", icon: BookOpen }],
  },
  {
    title: "SYSTEM",
    collapsible: true,
    items: [{ title: "Settings", url: "/settings", icon: Settings }],
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    MANAGEMENT: true,
    COMMUNICATION: true,
    "STUDENT PORTAL": true,
    SYSTEM: true,
  })

  const toggleSection = (sectionTitle: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle],
    }))
  }

  return (
    <div
      className={cn(
        "bg-slate-800 text-white transition-all duration-300 ease-in-out flex flex-col",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                <Bus className="h-4 w-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold">UniRoute</h1>
                <p className="text-xs text-slate-400">Bus Tracking System</p>
              </div>
            </div>
          )}
          {isCollapsed && (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 mx-auto">
              <Bus className="h-4 w-4 text-white" />
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-6 w-6 text-slate-400 hover:text-white hover:bg-slate-700 ml-auto"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        {menuItems.map((section) => (
          <div key={section.title} className="mb-4">
            {section.collapsible && !isCollapsed ? (
              <Collapsible open={openSections[section.title]} onOpenChange={() => toggleSection(section.title)}>
                <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider hover:text-white transition-colors">
                  <span>{section.title}</span>
                  <ChevronDown
                    className={cn("h-3 w-3 transition-transform", openSections[section.title] ? "rotate-180" : "")}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <nav className="space-y-1 px-2 mt-2">
                    {section.items.map((item) => {
                      const isActive = pathname === item.url
                      return (
                        <Link
                          key={item.title}
                          href={item.url}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                            isActive ? "bg-slate-700 text-white" : "text-slate-300 hover:text-white hover:bg-slate-700",
                          )}
                        >
                          <item.icon className="h-4 w-4 flex-shrink-0" />
                          <span>{item.title}</span>
                        </Link>
                      )
                    })}
                  </nav>
                </CollapsibleContent>
              </Collapsible>
            ) : (
              <>
                {!isCollapsed && (
                  <h3 className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    {section.title}
                  </h3>
                )}
                <nav className="space-y-1 px-2">
                  {section.items.map((item) => {
                    const isActive = pathname === item.url
                    return (
                      <Link
                        key={item.title}
                        href={item.url}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                          isActive ? "bg-slate-700 text-white" : "text-slate-300 hover:text-white hover:bg-slate-700",
                          isCollapsed && "justify-center",
                        )}
                        title={isCollapsed ? item.title : undefined}
                      >
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                        {!isCollapsed && <span>{item.title}</span>}
                      </Link>
                    )
                  })}
                </nav>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
