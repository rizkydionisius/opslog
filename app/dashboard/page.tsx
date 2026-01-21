import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { getDashboardStats } from "@/app/actions/supabase-actions"
import { BigCalendar } from "@/components/big-calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, CalendarCheck, CheckCircle2 } from "lucide-react"

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
        redirect("/login")
    }

    const stats = await getDashboardStats()

    // Add debug log to verify data arrival
    console.log('Logs in Page:', {
        calendarLogsCount: stats?.calendarLogs?.length,
        recentActivityCount: stats?.recentActivity?.length
    });

    // Replace Prisma category fetch with Supabase
    // Using simple query to get categories
    const { data: categories } = await supabase
        .from('categories')
        .select('id, name')
        .eq('user_id', user.id)

    const hasLoggedToday = (stats?.recentActivity || []).some(log => {
        const today = new Date().toDateString()
        return new Date(log.date).toDateString() === today
    })

    return (
        <div className="space-y-6">
            {/* Greeting */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">Halo, {user.user_metadata?.full_name || user.email}. Berikut adalah ringkasan aktivitas operasional hari ini.</p>
            </div>

            {/* Section A: Stats Cards (3 Columns) */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Streak Saat Ini</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats?.currentStreak || 0} Hari</div>
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
                        <div className="text-2xl font-bold">{stats?.totalLogsThisMonth || 0}</div>
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
                        <BigCalendar events={(stats?.calendarLogs || []).map(log => ({
                            id: log.id,
                            title: log.title,
                            date: log.date,
                            category: log.category
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
                            {(stats?.recentActivity || []).length === 0 ? (
                                <div className="p-4 text-center text-sm text-muted-foreground bg-muted/50 rounded-lg">
                                    Belum ada aktivitas.
                                </div>
                            ) : (
                                (stats?.recentActivity || []).map(log => (
                                    <div key={log.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium leading-none">{log.title}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {log.category}
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
