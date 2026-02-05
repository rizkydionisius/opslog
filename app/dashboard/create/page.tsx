import { LogEntryForm } from "@/components/log-form"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { getCategories } from "@/app/actions/db-actions"

export default async function CreateLogPage() {
    const categories = await getCategories()

    return (
        <div className="space-y-6 flex flex-col items-center">
            <div className="w-full max-w-2xl text-left">
                <h1 className="text-3xl font-bold tracking-tight">Buat Catatan</h1>
                <p className="text-muted-foreground">Dokumentasikan aktivitas atau insiden baru.</p>
            </div>

            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle>Input Aktivitas Baru</CardTitle>
                    <CardDescription>Isi detail pekerjaan yang telah diselesaikan.</CardDescription>
                </CardHeader>
                <CardContent>
                    <LogEntryForm existingCategories={categories} />
                </CardContent>
            </Card>
        </div>
    )
}
