'use client'

import { useState } from "react"
import { registerAction } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, AlertCircle, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsLoading(true)
        setError("")
        setSuccess(false)

        const formData = new FormData(event.currentTarget)
        const result = await registerAction(formData)

        if (result?.error) {
            setError(result.error)
            setIsLoading(false)
        } else if (result?.success) {
            setSuccess(true)
            // Redirect after brief delay
            setTimeout(() => {
                router.push("/login")
            }, 1000)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center space-y-2">
                    <div className="flex justify-center mb-2">
                        <div className="p-3 bg-primary/10 rounded-full">
                            <Activity className="h-6 w-6 text-primary" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold">buat akun</CardTitle>
                    <CardDescription>
                        Masukan detail informasi anda
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        {error && (
                            <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md flex items-center gap-2">
                                <AlertCircle className="h-4 w-4" />
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="bg-green-100 text-green-700 text-sm p-3 rounded-md flex items-center gap-2">
                                <CheckCircle className="h-4 w-4" />
                                Akun berhasil dibuat! Mengalihkan...
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="name">Nama Lengkap</Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="John Doe"
                                required
                                disabled={isLoading || success}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="name@example.com"
                                required
                                disabled={isLoading || success}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="Masukan password"
                                required
                                disabled={isLoading || success}
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button className="w-full" type="submit" disabled={isLoading || success}>
                            {isLoading ? "Membuat Akun..." : "Buat Akun"}
                        </Button>
                        <div className="text-center text-sm">
                            Sudah punya akun?{" "}
                            <Link href="/login" className="underline hover:text-primary">
                                Masuk
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
