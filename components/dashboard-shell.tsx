"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Activity, BookOpen, FileText, Home, LogOut, Menu, Moon, PenSquare, Settings, Sun, User } from "lucide-react"
import { useTheme } from "next-themes"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { logoutAction } from "@/app/actions/auth"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface DashboardShellProps {
    children: React.ReactNode
    userEmail: string
}

export function DashboardShell({ children, userEmail }: DashboardShellProps) {
    const pathname = usePathname()
    const { setTheme } = useTheme()
    const [isMobileOpen, setIsMobileOpen] = React.useState(false)

    // Extract username from email (before @)
    const userName = userEmail.split('@')[0] || "User"

    const mainNavItems = [
        {
            title: "Dashboard",
            href: "/dashboard",
            icon: Home,
        },
        {
            title: "Buat Log",
            href: "/dashboard/create",
            icon: PenSquare,
        },
        {
            title: "Log Harian",
            href: "/dashboard/logs",
            icon: BookOpen,
        },
        {
            title: "Laporan",
            href: "/dashboard/reports",
            icon: FileText,
        },
        {
            title: "Pengaturan",
            href: "/dashboard/settings",
            icon: Settings,
        },
    ]

    return (
        <div className="flex min-h-screen flex-col bg-muted/40 lg:flex-row">
            {/* Desktop Sidebar */}
            <aside className="hidden w-64 flex-col border-r bg-background lg:flex fixed h-full inset-y-0 z-50">
                <div className="flex h-14 items-center border-b px-6 font-bold lg:h-[60px]">
                    <Activity className="mr-2 h-6 w-6 text-primary" />
                    <span className="">OpsLog</span>
                </div>
                <div className="flex-1 overflow-auto py-2">
                    <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                        {mainNavItems.map((item, index) => (
                            <Link
                                key={index}
                                href={item.href}
                                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${pathname === item.href
                                    ? "bg-muted text-primary"
                                    : "text-muted-foreground"
                                    }`}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.title}
                            </Link>
                        ))}
                    </nav>
                </div>
                <div className="mt-auto p-4">
                    <div className="flex items-center gap-4 border-t pt-4">
                        <Avatar>
                            <AvatarImage src="/placeholder-user.svg" alt={userName} />
                            <AvatarFallback>{userName.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col overflow-hidden text-left">
                            <span className="text-sm font-medium truncate" title={userEmail}>{userEmail}</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Mobile Header & Content */}
            <div className="flex-1 lg:ml-64">
                <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6 sticky top-0 z-40">
                    <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
                        <SheetTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                className="shrink-0 lg:hidden"
                            >
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle navigation menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="flex flex-col">
                            <nav className="grid gap-2 text-lg font-medium">
                                <Link
                                    href="#"
                                    className="flex items-center gap-2 text-lg font-semibold"
                                >
                                    <Activity className="h-6 w-6" />
                                    <span className="sr-only">OpsLog</span>
                                </Link>
                                {mainNavItems.map((item, index) => (
                                    <Link
                                        key={index}
                                        href={item.href}
                                        onClick={() => setIsMobileOpen(false)}
                                        className={`mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 hover:text-foreground ${pathname === item.href
                                            ? "bg-muted text-foreground"
                                            : "text-muted-foreground"
                                            }`}
                                    >
                                        <item.icon className="h-5 w-5" />
                                        {item.title}
                                    </Link>
                                ))}
                            </nav>
                        </SheetContent>
                    </Sheet>
                    <div className="w-full flex-1">
                        <nav className="flex" aria-label="Breadcrumb">
                            <ol className="flex items-center space-x-2">
                                <li>
                                    <Link href="/dashboard" className="text-muted-foreground hover:text-primary transition-colors text-sm">Beranda</Link>
                                </li>
                                <li>
                                    <span className="text-muted-foreground">/</span>
                                </li>
                                <li>
                                    <span className="font-medium text-sm">Dashboard</span>
                                </li>
                            </ol>
                        </nav>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                                <span className="sr-only">Toggle theme</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setTheme("light")}>
                                Terang
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTheme("dark")}>
                                Gelap
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTheme("system")}>
                                Sistem
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <form action={logoutAction}>
                        <Button variant="ghost" size="icon" title="Keluar">
                            <LogOut className="h-5 w-5" />
                        </Button>
                    </form>
                </header>
                <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-muted/20 min-h-[calc(100vh-60px)]">
                    {children}
                </main>
            </div>
        </div>
    )
}
