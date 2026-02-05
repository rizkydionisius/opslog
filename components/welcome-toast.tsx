"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { toast } from "sonner" // Ensure sonner is installed or check existing toast usage
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

export function WelcomeToast({ userName }: { userName: string }) {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [open, setOpen] = useState(false)

    useEffect(() => {
        if (searchParams.get("welcome")) {
            setOpen(true)

            // Clean up the URL
            const params = new URLSearchParams(searchParams)
            params.delete("welcome")
            router.replace(`/dashboard?${params.toString()}`)
        }
    }, [searchParams, router])

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Selamat Datang, {userName}!</DialogTitle>
                    <DialogDescription>
                        Senang melihat Anda kembali. Siap untuk mencatat aktivitas hari ini?
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
}
