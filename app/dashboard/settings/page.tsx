
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Pengaturan</h1>
                <p className="text-muted-foreground">Kelola profil dan preferensi akun Anda.</p>
            </div>
            <Separator />
            <div className="grid gap-6 max-w-2xl">
                <Card>
                    <CardHeader>
                        <CardTitle>Profil Pengguna</CardTitle>
                        <CardDescription>
                            Informasi pribadi yang terlihat oleh tim.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nama Lengkap</Label>
                            <Input id="name" defaultValue="Admin IT" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" defaultValue="admin@rs.com" disabled />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <Input id="role" defaultValue="Administrator" disabled />
                        </div>
                    </CardContent>
                    <CardFooter className="border-t px-6 py-4">
                        <Button>Simpan Perubahan</Button>
                    </CardFooter>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Ganti Password</CardTitle>
                        <CardDescription>
                            Pastikan akun Anda tetap aman dengan password yang kuat.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="current">Password Saat Ini</Label>
                            <Input id="current" type="password" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="new">Password Baru</Label>
                            <Input id="new" type="password" />
                        </div>
                    </CardContent>
                    <CardFooter className="border-t px-6 py-4">
                        <Button variant="outline">Update Password</Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
