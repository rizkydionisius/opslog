
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ExportButtons } from "@/components/export-buttons"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart3 } from "lucide-react"

// MOCK USER for development bypass
const MOCK_USER_ID = "dev-user-id"

export default async function ReportsPage() {
    let session = await auth()
    if (!session?.user?.id) {
        session = { user: { id: MOCK_USER_ID } } as any
    }
    const userId = session!.user!.id as string

    // Fetch data for export
    const exportData = await prisma.logEntry.findMany({
        where: { userId },
        take: 500, // Limit for export demo
        orderBy: { date: 'desc' },
        select: {
            id: true,
            date: true,
            title: true,
            description: true,
            category: { select: { name: true } }
        }
    })

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Laporan & Ekspor</h1>
                <p className="text-muted-foreground">Unduh laporan bulanan dan analisis kinerja.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Filter Laporan</CardTitle>
                        <CardDescription>Pilih periode untuk diekspor.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col space-y-2">
                            <label className="text-sm font-medium">Bulan</label>
                            <Select defaultValue="january">
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih Bulan" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="january">Januari 2026</SelectItem>
                                    <SelectItem value="december">Desember 2025</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="pt-4">
                            <h4 className="text-sm font-medium mb-3">Unduh sebagai:</h4>
                            <ExportButtons data={exportData} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Ringkasan Bulan Ini</CardTitle>
                        <CardDescription>Statistik cepat untuk periode terpilih.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center p-6 text-center space-y-4 min-h-[200px]">
                        <div className="p-4 bg-muted rounded-full">
                            <BarChart3 className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                            <div className="text-3xl font-bold">{exportData.length}</div>
                            <div className="text-sm text-muted-foreground">Total Jam Kerja (Estimasi)</div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Data berdasarkan aktivitas yang tercatat.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
