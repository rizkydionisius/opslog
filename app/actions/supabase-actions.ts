"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const fullName = formData.get("fullName") as string;

    const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName }
    });

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/dashboard/settings");
    return { success: true };
}

export async function getCategories() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("user_id", user.id);

    if (error) {
        console.error("Error fetching categories:", error);
        return [];
    }

    return data;
}

export async function upsertCategory(name: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const { data, error } = await supabase
        .from("categories")
        .upsert(
            { name, user_id: user.id },
            { onConflict: "name, user_id" }
        )
        .select()
        .single();

    if (error) throw new Error(error.message);

    revalidatePath("/dashboard");
    return data;
}

export async function getLogs(dateFilter?: string) {
    const supabase = await createClient();

    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return [];

        let query = supabase
            .from("logs")
            .select(`
                *,
                category:categories(name)
            `)
            .eq("user_id", user.id)
            .order("date", { ascending: false });

        if (dateFilter) {
            query = query.gte("date", `${dateFilter}T00:00:00`).lte("date", `${dateFilter}T23:59:59`);
        } else {
            // Explicit limit as requested, though "Fetch All" is implied by no limit.
            // User requested 1000 limit.
            query = query.limit(1000);
        }

        const { data, error } = await query;

        if (error) {
            console.error("Error fetching logs:", error);
            return [];
        }

        return data.map(log => ({
            ...log,
            category: log.category?.name || "Uncategorized"
        }));
    } catch (error) {
        console.error("Server Action Error:", error);
        return [];
    }
}

export async function createLogEntry(formData: any) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const { title, description, date, categoryId, imageUrl } = formData;

    const { error } = await supabase
        .from("logs")
        .insert({
            user_id: user.id,
            category_id: categoryId,
            title,
            description,
            date,
            image_url: imageUrl,
            status: "Selesai"
        });

    if (error) throw new Error(error.message);

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/logs");
}

export async function updateLogEntry(logId: number, formData: any) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const { title, description, date, categoryId, imageUrl } = formData;

    const updates: any = {
        title,
        description,
        date,
        category_id: categoryId,
    }

    if (imageUrl) {
        updates.image_url = imageUrl;
    }

    const { error } = await supabase
        .from("logs")
        .update(updates)
        .eq("id", logId)
        .eq("user_id", user.id);

    if (error) throw new Error(error.message);

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/logs");
}

export async function uploadFilePlaceholder(formData: FormData) {
    await new Promise(resolve => setTimeout(resolve, 500))
    const file = formData.get('file') as File
    console.log("Uploaded fake file:", file.name)
    return "https://placehold.co/600x400?text=Uploaded+Image"
}

export async function getDashboardStats() {
    console.log("Fetching Dashboard Stats...");
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        console.log("No user found for stats.");
        return {
            currentStreak: 0,
            totalLogsThisMonth: 0,
            recentActivity: [],
            calendarLogs: [],
            statusCounts: { selesai: 0, proses: 0, pending: 0 }
        };
    }

    // 1. Fetch ALL logs (limit 1000 safety) to avoid mismatch
    const { data: allLogs, error: logsError } = await supabase
        .from("logs")
        .select(`
            id,
            date,
            status,
            title,
            category:categories(name)
        `)
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .limit(1000);

    if (logsError) console.error("Error fetching logs:", logsError);

    const logs = allLogs || [];

    // 2. Filter in JavaScript
    const now = new Date();
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const todayStr = now.toISOString().split('T')[0];

    console.log(`Debug Stats: Target Month=${currentMonthStr}, Today=${todayStr}`);

    const totalLogsThisMonth = logs.filter(log => {
        return log.date && log.date.startsWith(currentMonthStr);
    }).length;

    console.log("Stats Debug:", {
        totalLogs: totalLogsThisMonth,
        fetchedCount: logs.length,
        firstLogDate: logs[0]?.date
    });

    // Recent Activity (Top 5)
    const recentActivity = logs.slice(0, 5).map(log => ({
        ...log,
        category: log.category?.name || "Uncategorized"
    }));

    // Calendar Logs (Full List - Limit 1000)
    const calendarLogs = logs.map(log => ({
        ...log,
        category: log.category?.name || "Uncategorized"
    }));

    // Status Counts
    const statusCounts = logs.reduce((acc, log) => {
        const s = (log.status || "").toLowerCase();
        if (s === "selesai") acc.selesai++;
        else if (s === "proses") acc.proses++;
        else if (s === "pending") acc.pending++;
        return acc;
    }, { selesai: 0, proses: 0, pending: 0 });

    // Streak Calculation
    const uniqueDates = Array.from(new Set(logs.map(l => l.date.split('T')[0])));

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
        calendarLogs, // Exporting full list now
        statusCounts
    };
}
