
import { cookies } from "next/headers"
import { DashboardShell } from "@/components/dashboard-shell"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const cookieStore = await cookies()
    const userEmail = cookieStore.get("user_email")?.value || "user@example.com"

    return (
        <DashboardShell userEmail={userEmail}>
            {children}
        </DashboardShell>
    )
}
