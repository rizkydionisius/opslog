'use server'

import { signIn, signOut } from "@/auth"
import { AuthError } from "next-auth"

// ... imports
import { hash } from "bcryptjs"
import { prisma } from "@/lib/prisma"

export async function loginAction(formData: FormData) {
    try {
        // Convert formData to a plain object and add redirectTo
        const data = Object.fromEntries(formData)
        await signIn("credentials", { ...data, redirectTo: "/dashboard?welcome=true" })
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return { error: "Invalid credentials." }
                default:
                    return { error: "Something went wrong." }
            }
        }
        throw error
    }
}

export async function logoutAction() {
    await signOut()
}

export async function registerAction(formData: FormData) {
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    if (!name || !email || !password) {
        return { error: "All fields are required." }
    }

    try {
        const existingUser = await prisma.user.findUnique({
            where: { email },
        })

        if (existingUser) {
            return { error: "User already exists." }
        }

        const hashedPassword = await hash(password, 10)

        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        })

        return { success: true }
    } catch (error) {
        console.error("Registration error:", error)
        return { error: "Failed to create account." }
    }
}
