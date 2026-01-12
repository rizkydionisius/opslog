"use client"

import * as React from "react"
import dynamic from "next/dynamic"

// Loading skeleton is optional but good for UX
const Calendar = dynamic(
    () => import("@/components/ui/calendar").then((mod) => mod.Calendar),
    { ssr: false }
)
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type Props = {
    // Pass in the dates that have logs. 
    // Ideally this is passed from a server component that calls getDashboardStats or a similar query.
    loggedDates: Date[]
}

export function CalendarView({ loggedDates }: Props) {
    // Convert logged dates to string set for easy lookup
    const loggedDatesSet = new Set(
        loggedDates.map((d) => d.toISOString().split("T")[0])
    )

    const today = new Date()

    return (
        <Card>
            <CardHeader>
                <CardTitle>Logbook Activity</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
                <Calendar
                    mode="single"
                    selected={today} // Just to highlight today
                    modifiers={{
                        hasLog: (date) => loggedDatesSet.has(date.toISOString().split("T")[0]),
                        missedLog: (date) => {
                            const dStr = date.toISOString().split("T")[0]
                            // If it's in the past (before today), NOT a logged date, and within valid range (e.g. this month)
                            // We can render all past missed logs as red.
                            return date < today && !loggedDatesSet.has(dStr) && date.getDay() !== 0 && date.getDay() !== 6 // Optional: Don't mark weekends as missed?
                        },
                    }}
                    modifiersClassNames={{
                        hasLog: "bg-green-500 text-white hover:bg-green-600 rounded-md", // Green for logged
                        missedLog: "bg-red-100 text-red-900 rounded-md", // Red/Gray for missed
                    }}
                />
            </CardContent>
        </Card>
    )
}
