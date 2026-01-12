
"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import {
    add,
    eachDayOfInterval,
    endOfMonth,
    endOfWeek,
    format,
    getDay,
    isEqual,
    isSameDay,
    isSameMonth,
    isToday,
    parse,
    parseISO,
    startOfToday,
    startOfWeek,
    startOfMonth,
} from "date-fns"
import { id } from "date-fns/locale"

import { Button } from "@/components/ui/button"

function classNames(...classes: (string | boolean | undefined)[]) {
    return classes.filter(Boolean).join(" ")
}

interface LogEvent {
    id: string
    title: string
    date: Date | string
    category?: string
}

interface BigCalendarProps {
    events: LogEvent[]
}

export function BigCalendar({ events = [] }: BigCalendarProps) {
    let today = startOfToday()
    let [currentMonth, setCurrentMonth] = React.useState(format(today, "MMM-yyyy"))
    let firstDayCurrentMonth = parse(currentMonth, "MMM-yyyy", new Date())

    let days = eachDayOfInterval({
        start: startOfWeek(startOfMonth(firstDayCurrentMonth), { weekStartsOn: 0 }), // 0 = Sunday (Minggu)
        end: endOfWeek(endOfMonth(firstDayCurrentMonth), { weekStartsOn: 0 }),
    })

    function nextMonth() {
        let firstDayNextMonth = add(firstDayCurrentMonth, { months: 1 })
        setCurrentMonth(format(firstDayNextMonth, "MMM-yyyy"))
    }

    function previousMonth() {
        let firstDayNextMonth = add(firstDayCurrentMonth, { months: -1 })
        setCurrentMonth(format(firstDayNextMonth, "MMM-yyyy"))
    }

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-8 px-4">
                <Button variant="outline" size="icon" onClick={previousMonth}>
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-2xl font-bold text-foreground capitalize">
                    {format(firstDayCurrentMonth, "MMMM yyyy", { locale: id })}
                </h2>
                <Button variant="outline" size="icon" onClick={nextMonth}>
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>

            <div className="border rounded-md shadow-sm overflow-hidden bg-background">
                {/* Header Days */}
                <div className="grid grid-cols-7 border-b bg-muted/40">
                    {["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"].map((day) => (
                        <div key={day} className="py-2 text-center text-sm font-semibold tracking-wide text-muted-foreground border-r last:border-r-0">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 auto-rows-fr">
                    {days.map((day, dayIdx) => {
                        // Find events for this day
                        const dayEvents = events.filter((event) =>
                            isSameDay(new Date(event.date), day)
                        )

                        return (
                            <div
                                key={day.toString()}
                                className={classNames(
                                    "min-h-[120px] p-2 border-b border-r last:border-r-0 relative group transition-colors hover:bg-muted/50",
                                    !isSameMonth(day, firstDayCurrentMonth) && "text-muted-foreground/30 bg-muted/10" // Padding days style
                                )}
                            >
                                <div className="flex items-center justify-between">
                                    <time
                                        dateTime={format(day, "yyyy-MM-dd")}
                                        className={classNames(
                                            "flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium",
                                            isToday(day)
                                                ? "bg-primary text-primary-foreground"
                                                : "text-foreground group-hover:text-primary",
                                            !isSameMonth(day, firstDayCurrentMonth) && "text-muted-foreground/50"
                                        )}
                                    >
                                        {format(day, "d")}
                                    </time>
                                </div>

                                <div className="mt-2 space-y-1">
                                    {dayEvents.slice(0, 3).map((event) => (
                                        <div
                                            key={event.id}
                                            className="px-2 py-1 text-xs truncate rounded bg-primary/10 text-primary border border-primary/20 font-medium"
                                            title={event.title}
                                        >
                                            {event.title}
                                        </div>
                                    ))}
                                    {dayEvents.length > 3 && (
                                        <div className="text-[10px] text-muted-foreground pl-1">
                                            + {dayEvents.length - 3} lainnya
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
