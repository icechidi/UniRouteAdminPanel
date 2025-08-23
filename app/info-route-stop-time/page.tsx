"use client"

import React, { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"

interface Row {
  route_id: number
  route_name: string
  route_time_id: number
  route_departure_time: string
  route_stop_id: number
  stop_order: number
  stop_name: string
  arrival_time: string
}

export default function RouteStopTimeInfoPage() {
  const [rows, setRows] = useState<Row[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editData, setEditData] = useState<Partial<Row>>({})
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch("/api/info-route-stop-time")
      .then(res => res.json())
      .then(setRows)
  }, [])

  const startEdit = (row: Row) => {
    setEditingId(row.route_stop_id)
    setEditData({ stop_name: row.stop_name, stop_order: row.stop_order })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditData({})
  }

  const saveEdit = async (row: Row) => {
    await fetch("/api/info-route-stop-time", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        route_stop_id: row.route_stop_id,
        stop_name: editData.stop_name,
        stop_order: editData.stop_order,
      }),
    })
    fetch("/api/info-route-stop-time")
      .then(res => res.json())
      .then(setRows)
    cancelEdit()
  }

  const scrollToTop = () => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" })
  }
  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
    }
  }

  return (
    <div className="relative h-[90vh] p-6">
      <h1 className="text-2xl font-bold mb-4">Route Stop Time Info</h1>
      <div ref={scrollRef} className="overflow-y-auto h-full pr-2">
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 bg-blue-50 bg-white/0 shadow-none">
            <thead>
              <tr className="bg-blue-50 bg-white/0 shadow-none">
                <th className="px-2 py-1 border">Route Name</th>
                <th className="px-2 py-1 border">Departure Time</th>
                <th className="px-2 py-1 border">Stop Order</th>
                <th className="px-2 py-1 border">Stop Name</th>
                <th className="px-2 py-1 border">Arrival Time</th>
                <th className="px-2 py-1 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.route_stop_id}>
                  <td className="border px-2 py-1">{row.route_name}</td>
                  <td className="border px-2 py-1">{new Date(row.route_departure_time).toLocaleTimeString()}</td>
                  <td className="border px-2 py-1">
                    {editingId === row.route_stop_id ? (
                      <input
                        type="number"
                        value={editData.stop_order ?? row.stop_order}
                        onChange={e => setEditData(d => ({ ...d, stop_order: Number(e.target.value) }))}
                        className="border rounded px-1 py-0.5 w-16"
                      />
                    ) : (
                      row.stop_order
                    )}
                  </td>
                  <td className="border px-2 py-1">
                    {editingId === row.route_stop_id ? (
                      <input
                        type="text"
                        value={editData.stop_name ?? row.stop_name}
                        onChange={e => setEditData(d => ({ ...d, stop_name: e.target.value }))}
                        className="border rounded px-1 py-0.5"
                      />
                    ) : (
                      row.stop_name
                    )}
                  </td>
                  <td className="border px-2 py-1">{new Date(row.arrival_time).toLocaleTimeString()}</td>
                  <td className="border px-2 py-1">
                    {editingId === row.route_stop_id ? (
                      <>
                        <button
                          className="bg-blue-500 text-white px-2 py-1 rounded mr-2"
                          onClick={() => saveEdit(row)}
                        >
                          Save
                        </button>
                        <button
                          className="bg-gray-300 px-2 py-1 rounded"
                          onClick={cancelEdit}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        className="bg-yellow-500 text-white px-2 py-1 rounded"
                        onClick={() => startEdit(row)}
                      >
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Scroll buttons */}
      <div className="fixed bottom-8 right-8 flex flex-col gap-2 z-50">
        <Button variant="secondary" size="icon" onClick={scrollToTop} aria-label="Scroll to top">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M5 15l7-7 7 7" />
          </svg>
        </Button>
        <Button variant="secondary" size="icon" onClick={scrollToBottom} aria-label="Scroll to bottom">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M19 9l-7 7-7-7" />
          </svg>
        </Button>
      </div>
    </div>
  )
}