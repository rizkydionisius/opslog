"use client"

import { useState } from "react"
import { updateProfile } from "@/app/actions/supabase-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { User } from "@supabase/supabase-js"

export function SettingsForm({ user }: { user: User | null }) {
    const [isLoading, setIsLoading] = useState(false)

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsLoading(true)
        const formData = new FormData(event.currentTarget)

        const result = await updateProfile(formData)

        setIsLoading(false)

        if (result?.error) {
            toast.error("Gagal memperbarui profil.")
        } else {
            toast.success("Profil berhasil diperbarui.")
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Profil Pengguna</CardTitle>
                <CardDescription>
                    Informasi pribadi yang terlihat oleh tim.
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="fullName">Nama Lengkap</Label>
                        <Input
                            id="fullName"
                            name="fullName"
                            defaultValue={user?.user_metadata?.full_name || ""}
                            placeholder="Nama Lengkap"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            defaultValue={user?.email || ""}
                            disabled
                        />
                    </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                    <Button disabled={isLoading}>
                        {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    )
}
