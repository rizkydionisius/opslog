
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, FileText, Lock, Trophy, Zap, ArrowRight, Activity } from "lucide-react"

export default function LandingPage() {
    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            {/* Navbar / Header */}
            <header className="px-6 h-16 flex items-center border-b justify-between sticky top-0 z-50 bg-background/80 backdrop-blur-md">
                <div className="flex items-center gap-2 font-bold text-xl">
                    <Activity className="h-6 w-6 text-primary" />
                    <span>OpsLog</span>
                </div>
                <nav className="hidden md:flex gap-6 text-sm font-medium">
                    <Link href="#features" className="hover:text-primary transition-colors">Features</Link>
                    <Link href="#" className="hover:text-primary transition-colors">Pricing</Link>
                    <Link href="#" className="hover:text-primary transition-colors">About</Link>
                </nav>
                <div className="flex gap-4">
                    <Button variant="ghost" asChild>
                        <Link href="/login">Login</Link>
                    </Button>
                    <Button asChild>
                        <Link href="/login">Get Started</Link>
                    </Button>
                </div>
            </header>

            <main className="flex-1">
                {/* Hero Section */}
                <section className="container px-4 py-24 md:py-32 flex flex-col items-center text-center space-y-6">
                    <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 mb-4">
                        <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                        v1.0 Public Beta is Live
                    </div>

                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight max-w-4xl">
                        The Ultimate Companion for <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                            IT Operations
                        </span>.
                    </h1>

                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
                        Track troubleshooting, manage daily tasks, and generate monthly reports in seconds.
                        Built by IT pros, for IT pros. No more messy spreadsheets.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <Button size="lg" className="h-12 px-8 text-base" asChild>
                            <Link href="/login">
                                Start Logging for Free <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                        <Button size="lg" variant="outline" className="h-12 px-8 text-base">
                            View Interactive Demo
                        </Button>
                    </div>

                    <div className="pt-12 w-full max-w-5xl mx-auto opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                        {/* Visual placeholder for dashboard screenshot could go here */}
                        <div className="rounded-xl border bg-card text-card-foreground shadow-sm h-64 md:h-96 w-full flex items-center justify-center bg-muted/20">
                            <p className="text-muted-foreground text-sm font-medium flex items-center gap-2">
                                <Activity className="h-4 w-4" /> Dashboard Preview
                            </p>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="container px-4 py-24 bg-muted/50 rounded-3xl my-8">
                    <div className="text-center mb-16 space-y-4">
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Everything you need to run Ops</h2>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                            OpsLog is designed to minimize administrative overhead so you can focus on fixing problems.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <Card className="border-none shadow-md">
                            <CardHeader>
                                <Zap className="h-10 w-10 text-yellow-500 mb-2" />
                                <CardTitle>Smart Logging</CardTitle>
                            </CardHeader>
                            <CardContent className="text-muted-foreground">
                                Quickly log tasks with Markdown support. Dynamic categories adapt to your workflow automatically.
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-md">
                            <CardHeader>
                                <Trophy className="h-10 w-10 text-orange-500 mb-2" />
                                <CardTitle>Gamified Streaks</CardTitle>
                            </CardHeader>
                            <CardContent className="text-muted-foreground">
                                Keep the momentum going. Visual heatmaps and daily streaks encourage consistent documentation.
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-md">
                            <CardHeader>
                                <FileText className="h-10 w-10 text-blue-500 mb-2" />
                                <CardTitle>Instant Reports</CardTitle>
                            </CardHeader>
                            <CardContent className="text-muted-foreground">
                                Generate professional PDF and Excel reports for management with a single click. Compliance made easy.
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-md">
                            <CardHeader>
                                <Lock className="h-10 w-10 text-green-500 mb-2" />
                                <CardTitle>Secure & Private</CardTitle>
                            </CardHeader>
                            <CardContent className="text-muted-foreground">
                                Your data is encrypted and isolated. We prioritize privacy so you can log sensitive operational details safely.
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="container px-4 py-24 text-center">
                    <div className="bg-primary text-primary-foreground rounded-3xl p-12 md:p-20 relative overflow-hidden">
                        <div className="relative z-10 space-y-6">
                            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Ready to upgrade your workflow?</h2>
                            <p className="text-primary-foreground/80 text-lg md:text-xl max-w-xl mx-auto">
                                Join thousands of IT professionals who trust OpsLog for their daily operations.
                            </p>
                            <Button size="lg" variant="secondary" className="mt-4" asChild>
                                <Link href="/login">Get Started Now</Link>
                            </Button>
                        </div>
                        {/* Decorative Circle */}
                        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 rounded-full bg-white/10 blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 rounded-full bg-white/10 blur-3xl"></div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t py-12 bg-muted/20">
                <div className="container px-4 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2 font-bold text-lg text-muted-foreground">
                        <Activity className="h-5 w-5" />
                        <span>OpsLog</span>
                    </div>

                    <div className="flex gap-8 text-sm text-muted-foreground">
                        <Link href="#" className="hover:text-foreground">Terms of Service</Link>
                        <Link href="#" className="hover:text-foreground">Privacy Policy</Link>
                        <Link href="#" className="hover:text-foreground">Contact Support</Link>
                    </div>

                    <div className="text-sm text-muted-foreground">
                        &copy; {new Date().getFullYear()} OpsLog Inc. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    )
}
