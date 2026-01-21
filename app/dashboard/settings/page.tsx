
import { createClient } from "@/utils/supabase/server"
import { SettingsForm } from "@/components/settings-form"
import { Separator } from "@/components/ui/separator"

export default async function SettingsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Pengaturan</h1>
                <p className="text-muted-foreground">Kelola profil dan preferensi akun Anda.</p>
            </div>
            <Separator />
            <div className="grid gap-6 max-w-2xl">
                <SettingsForm user={user} />
            </div>
        </div>
    )
}
