'use server'

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function loginAction(formData: FormData) {
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    // Hardcoded credentials check
    if (email === "test@test.com" && password === "test") {
        // Set HTTP-only cookie
        const cookieStore = await cookies()
        cookieStore.set("session_token", "true", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: "/",
        })

        cookieStore.set("user_email", email, {
            httpOnly: false,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: "/",
        })

        redirect("/dashboard")
    } else {
        // Return error (for useFormState or similar handling if enhanced later)
        // For simple form submission, we can redirect back with error param or throw
        // Here implementing a simple return for a client component to handle or simple state
        return { error: "Invalid credentials" }
    }
}

export async function logoutAction() {
    const cookieStore = await cookies()
    cookieStore.delete("session_token")
    redirect("/")
}
