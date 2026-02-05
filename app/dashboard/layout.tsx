
import { auth } from "@/auth"
import { DashboardShell } from "@/components/dashboard-shell"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()
    const userEmail = session?.user?.email || "user@example.com"

    return (
        <DashboardShell userEmail={userEmail}>
            {children}
        </DashboardShell>
    )
}
