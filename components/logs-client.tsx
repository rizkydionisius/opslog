"use client"

import { useState } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { CalendarIcon, Pencil, Search, Filter } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

import { LogEntryForm } from "@/components/log-form"

type Log = {
    id: string
    title: string
    date: Date
    description: string
    categoryId: string
    category: string
    status: string
    imageUrl: string | null
    createdAt: Date
    updatedAt: Date
    userId: string
}

type LogsClientProps = {
    initialLogs: Log[]
    categories: any[]
}

export function LogsClient({ initialLogs, categories }: LogsClientProps) {
    const searchParams = useSearchParams()
    const router = useRouter()
    const pathname = usePathname()

    const [searchQuery, setSearchQuery] = useState("")
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(
        searchParams.get("date") ? new Date(searchParams.get("date")!) : undefined
    )

    // Edit Dialog State
    const [editingLog, setEditingLog] = useState<Log | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    // Filter Logic (Client-side search for title, Server-side for Date)
    // Date filter triggers router push
    const handleDateSelect = (date: Date | undefined) => {
        setSelectedDate(date)
        const params = new URLSearchParams(searchParams)
        if (date) {
            params.set("date", format(date, "yyyy-MM-dd"))
        } else {
            params.delete("date")
        }
        router.push(`${pathname}?${params.toString()}`)
    }

    const clearDateFilter = () => {
        handleDateSelect(undefined)
    }

    // Filter logs by search query
    const filteredLogs = initialLogs.filter(log =>
        log.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.category.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleEdit = (log: Log) => {
        setEditingLog(log)
        setIsDialogOpen(true)
    }

    const handleDialogClose = () => {
        setIsDialogOpen(false)
        setEditingLog(null)
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <CardTitle>Riwayat Aktivitas</CardTitle>

                    <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                        {/* Date Picker Filter */}
                        <div className="flex items-center gap-2">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-[240px] justify-start text-left font-normal",
                                            !selectedDate && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {selectedDate ? format(selectedDate, "PPP", { locale: id }) : <span>Filter Tanggal</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="end">
                                    <Calendar
                                        mode="single"
                                        selected={selectedDate}
                                        onSelect={handleDateSelect}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            {selectedDate && (
                                <Button variant="ghost" size="icon" onClick={clearDateFilter}>
                                    <span className="sr-only">Clear</span>
                                    <span aria-hidden="true">×</span>
                                </Button>
                            )}
                        </div>

                        {/* Search Input */}
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Cari log..."
                                className="pl-8"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground font-medium">
                            <tr className="border-b">
                                <th className="p-4">Tanggal</th>
                                <th className="p-4">Judul Aktivitas</th>
                                <th className="p-4">Kategori</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-4 text-center text-muted-foreground">
                                        Tidak ada data log.
                                    </td>
                                </tr>
                            ) : (
                                filteredLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-muted/50 transition-colors">
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className="font-medium">{format(new Date(log.date), "dd MMM yyyy", { locale: id })}</span>
                                                {/* Hidden time for cleaner Look based on requirements, or show if needed */}
                                                {/* <span className="text-xs text-muted-foreground">{format(new Date(log.date), "HH:mm")}</span> */}
                                            </div>
                                        </td>
                                        <td className="p-4 font-medium">{log.title}</td>
                                        <td className="p-4">
                                            <span className="bg-secondary px-2 py-1 rounded text-xs">{log.category}</span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs ${log.status === 'Selesai' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {log.status || 'Selesai'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(log)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Log Aktivitas</DialogTitle>
                            <DialogDescription>
                                Perbarui detail catatan harian Anda.
                            </DialogDescription>
                        </DialogHeader>
                        {editingLog && (
                            <LogEntryForm
                                existingCategories={categories}
                                initialData={editingLog}
                                onSuccess={handleDialogClose}
                            />
                        )}
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    )
}
