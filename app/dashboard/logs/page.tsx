import { LogsClient } from "@/components/logs-client"
import { getLogs, getCategories } from "@/app/actions/supabase-actions"

export default async function LogsPage(props: { searchParams: Promise<{ date?: string }> }) {
    const params = await props.searchParams
    const dateFilter = params?.date
    const logs = await getLogs(dateFilter)
    const categories = await getCategories()

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Log Harian</h1>
                <p className="text-muted-foreground">Kelola dan pantau seluruh aktivitas tim IT.</p>
            </div>

            <LogsClient initialLogs={logs} categories={categories} />
        </div>
    )
}
