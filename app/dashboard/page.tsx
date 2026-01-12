
import { auth } from "@/auth"
import { getDashboardStats } from "../actions"
import { BigCalendar } from "@/components/big-calendar"
import { ExportButtons } from "@/components/export-buttons"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"
import { Activity, CalendarCheck, CheckCircle2, History } from "lucide-react"
import { Button } from "@/components/ui/button"

// MOCK USER for development bypass
const MOCK_USER_ID = "dev-user-id"

export default async function DashboardPage() {
    let session = await auth()

    // BYPASS for development
    if (!session?.user?.id) {
        session = {
            user: {
                id: MOCK_USER_ID,
                name: "Admin IT",
                email: "admin@rs.com",
            },
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        }
    }

    const userId = session!.user!.id as string // safe due to bypass above

    const stats = await getDashboardStats()
    const categories = await prisma.category.findMany({
        where: { userId },
        select: { id: true, name: true }
    })

    // Prepare data for export
    const exportData = await prisma.logEntry.findMany({
        where: { userId },
        take: 100,
        orderBy: { date: 'desc' },
        select: {
            id: true,
            date: true,
            title: true,
            description: true,
            category: { select: { name: true } }
        }
    })

    const hasLoggedToday = stats.recentActivity.some(log => {
        const today = new Date().toDateString()
        return new Date(log.date).toDateString() === today
    })

    return (
        <div className="space-y-6">
            {/* Greeting */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">Halo, {session!.user!.name}. Berikut adalah ringkasan aktivitas operasional hari ini.</p>
            </div>

            {/* Section A: Stats Cards (3 Columns) */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Streak Saat Ini</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.currentStreak} Hari</div>
                        <p className="text-xs text-muted-foreground">
                            Pertahankan konsistensi Anda!
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Log Bulan Ini</CardTitle>
                        <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalLogsThisMonth}</div>
                        <p className="text-xs text-muted-foreground">
                            Aktivitas tercatat pada periode ini.
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Status Hari Ini</CardTitle>
                        <CheckCircle2 className={`h-4 w-4 ${hasLoggedToday ? "text-green-500" : "text-destructive"}`} />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${hasLoggedToday ? "text-green-600" : "text-destructive"}`}>
                            {hasLoggedToday ? "Sudah Mengisi" : "Belum Mengisi"}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {hasLoggedToday ? "Kerja bagus!" : "Jangan lupa catat aktivitas."}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Section B: Stacked Layout */}
            <div className="flex flex-col gap-6">

                {/* Middle: Calendar (Full Width) */}
                <Card className="w-full shadow-sm">

                    <CardContent className="p-6">
                        <BigCalendar events={stats.recentActivity.map(log => ({
                            id: log.id,
                            title: log.title,
                            date: log.date,
                            category: log.category.name
                        }))} />
                    </CardContent>
                </Card>

                {/* Bottom: Recent Activity (Full Width) */}
                <Card className="w-full shadow-sm">
                    <CardHeader>
                        <CardTitle>Aktivitas Terakhir</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stats.recentActivity.length === 0 ? (
                                <div className="p-4 text-center text-sm text-muted-foreground bg-muted/50 rounded-lg">
                                    Belum ada aktivitas.
                                </div>
                            ) : (
                                stats.recentActivity.map(log => (
                                    <div key={log.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium leading-none">{log.title}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {log.category.name}
                                            </p>
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {new Date(log.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
