"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const fullName = formData.get("fullName") as string;

    try {
        await prisma.user.update({
            where: { id: session.user.id },
            data: { name: fullName }
        });

        revalidatePath("/dashboard/settings");
        return { success: true };
    } catch (error) {
        return { error: "Failed to update profile" };
    }
}

export async function getCategories() {
    const session = await auth();
    if (!session?.user?.id) return [];

    try {
        const categories = await prisma.category.findMany({
            where: { userId: session.user.id },
            orderBy: { name: 'asc' }
        });
        return categories;
    } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
    }
}

export async function upsertCategory(name: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    try {
        const category = await prisma.category.upsert({
            where: {
                name_userId: {
                    name,
                    userId: session.user.id
                }
            },
            update: { name },
            create: {
                name,
                userId: session.user.id
            }
        });

        revalidatePath("/dashboard");
        return category;
    } catch (error) {
        throw new Error("Failed to upsert category");
    }
}

export async function getLogs(dateFilter?: string) {
    const session = await auth();
    if (!session?.user?.id) return [];

    try {
        const whereClause: any = {
            userId: session.user.id
        };

        if (dateFilter) {
            const startDate = new Date(`${dateFilter}T00:00:00`);
            const endDate = new Date(`${dateFilter}T23:59:59`);
            whereClause.date = {
                gte: startDate,
                lte: endDate
            };
        }

        const logs = await prisma.logEntry.findMany({
            where: whereClause,
            include: {
                category: {
                    select: { name: true }
                }
            },
            orderBy: {
                createdAt: 'asc'
            },
            take: dateFilter ? undefined : 1000
        });

        return logs.map(log => ({
            ...log,
            category: log.category?.name || "Uncategorized"
        }));
    } catch (error) {
        console.error("Error fetching logs:", error);
        return [];
    }
}

export async function createLogEntry(formData: any) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const { title, description, date, categoryId, imageUrl } = formData;

    try {
        await prisma.logEntry.create({
            data: {
                title,
                description,
                date: new Date(date),
                imageUrl,
                categoryId,
                userId: session.user.id,
                status: "Selesai" // Default status
            }
        });

        revalidatePath("/dashboard");
        revalidatePath("/dashboard/logs");
    } catch (error) {
        console.error("Error creating log:", error);
        throw new Error("Failed to create log entry");
    }
}

export async function updateLogEntry(logId: string, formData: any) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const { title, description, date, categoryId, imageUrl } = formData;

    const data: any = {
        title,
        description,
        date: new Date(date),
        categoryId,
    };

    if (imageUrl) {
        data.imageUrl = imageUrl;
    }

    try {
        await prisma.logEntry.update({
            where: {
                id: logId,
                userId: session.user.id
            },
            data
        });

        revalidatePath("/dashboard");
        revalidatePath("/dashboard/logs");
    } catch (error) {
        console.error("Error updating log:", error);
        throw new Error("Failed to update log entry");
    }
}

export async function uploadFilePlaceholder(formData: FormData) {
    await new Promise(resolve => setTimeout(resolve, 500));
    const file = formData.get('file') as File;
    console.log("Uploaded fake file:", file.name);
    return "https://placehold.co/600x400?text=Uploaded+Image";
}

export async function getDashboardStats() {
    const session = await auth();
    if (!session?.user?.id) {
        return {
            currentStreak: 0,
            totalLogsThisMonth: 0,
            recentActivity: [],
            calendarLogs: [],
            statusCounts: { selesai: 0, proses: 0, pending: 0 }
        };
    }

    try {
        const logs = await prisma.logEntry.findMany({
            where: { userId: session.user.id },
            include: {
                category: { select: { name: true } }
            },
            orderBy: { date: 'desc' },
            take: 1000
        });

        const formattedLogs = logs.map(log => ({
            ...log,
            category: log.category?.name || "Uncategorized",
            date: log.date.toISOString() // Ensure date is string for frontend if needed
        }));

        const now = new Date();
        const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const todayStr = now.toISOString().split('T')[0];

        const totalLogsThisMonth = formattedLogs.filter(log => {
            return log.date.startsWith(currentMonthStr);
        }).length;

        const recentActivity = formattedLogs.slice(0, 5);
        const calendarLogs = formattedLogs;

        const statusCounts = formattedLogs.reduce((acc, log) => {
            const s = (log.status || "").toLowerCase();
            if (s === "selesai") acc.selesai++;
            else if (s === "proses") acc.proses++;
            else if (s === "pending") acc.pending++;
            return acc;
        }, { selesai: 0, proses: 0, pending: 0 });

        // Streak Calculation
        const uniqueDates = Array.from(new Set(formattedLogs.map(l => l.date.split('T')[0])));
        let currentStreak = 0;

        if (uniqueDates.length > 0) {
            uniqueDates.sort().reverse();
            const yesterday = new Date(now);
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];

            if (uniqueDates.includes(todayStr) || uniqueDates.includes(yesterdayStr)) {
                let startIndex = uniqueDates.indexOf(todayStr);
                if (startIndex === -1) startIndex = uniqueDates.indexOf(yesterdayStr);

                if (startIndex !== -1) {
                    currentStreak = 1;
                    let lastDateToken = uniqueDates[startIndex];

                    for (let i = startIndex + 1; i < uniqueDates.length; i++) {
                        const currDateToken = uniqueDates[i];
                        const d1 = new Date(lastDateToken);
                        const d2 = new Date(currDateToken);
                        const diffTime = Math.abs(d1.getTime() - d2.getTime());
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                        if (diffDays === 1) {
                            currentStreak++;
                            lastDateToken = currDateToken;
                        } else {
                            break;
                        }
                    }
                }
            }
        }

        return {
            currentStreak,
            totalLogsThisMonth,
            recentActivity,
            calendarLogs,
            statusCounts
        };

    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        return {
            currentStreak: 0,
            totalLogsThisMonth: 0,
            recentActivity: [],
            calendarLogs: [],
            statusCounts: { selesai: 0, proses: 0, pending: 0 }
        };
    }
}
