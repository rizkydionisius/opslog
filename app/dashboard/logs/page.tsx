
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export default function LogsPage() {
    // Dummy Data
    const logs = [
        { date: "2026-01-12", time: "10:30", title: "Fixed Printer HR", category: "Hardware", status: "Selesai" },
        { date: "2026-01-12", time: "09:15", title: "Network Maintenance", category: "Network", status: "Proses" },
        { date: "2026-01-11", time: "14:20", title: "Update Windows Server", category: "OS", status: "Selesai" },
        { date: "2026-01-10", time: "11:00", title: "Replace Mouse", category: "Hardware", status: "Selesai" },
        { date: "2026-01-10", time: "08:45", title: "Meeting IT", category: "Meeting", status: "Selesai" },
    ]

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Log Harian</h1>
                <p className="text-muted-foreground">Kelola dan pantau seluruh aktivitas tim IT.</p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Riwayat Aktivitas</CardTitle>
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Cari log..."
                                className="pl-8"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50 text-muted-foreground font-medium">
                                <tr className="border-b">
                                    <th className="p-4">Tanggal</th>
                                    <th className="p-4">Jam</th>
                                    <th className="p-4">Judul Aktivitas</th>
                                    <th className="p-4">Kategori</th>
                                    <th className="p-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {logs.map((log, index) => (
                                    <tr key={index} className="hover:bg-muted/50 transition-colors">
                                        <td className="p-4">{log.date}</td>
                                        <td className="p-4">{log.time}</td>
                                        <td className="p-4 font-medium">{log.title}</td>
                                        <td className="p-4">
                                            <span className="bg-secondary px-2 py-1 rounded text-xs">{log.category}</span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs ${log.status === 'Selesai' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {log.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
