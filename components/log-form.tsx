"use client";

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { CalendarIcon, Check, ChevronsUpDown, PlusCircle } from "lucide-react"

import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import dynamic from "next/dynamic"

// Loading skeleton is optional but good for UX
const Calendar = dynamic(
    () => import("@/components/ui/calendar").then((mod) => mod.Calendar),
    { ssr: false }
)
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command" // Ensure CommandList is imported if using recent shadcn versions
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { upsertCategory, createLogEntry, updateLogEntry, uploadFilePlaceholder } from "@/app/actions/db-actions"
import { toast } from "sonner" // Assuming sonner or useToast
import { Label } from "@/components/ui/label"

// Import types just for reference, zod schema controls form
const formSchema = z.object({
    title: z.string().min(2, {
        message: "Title must be at least 2 characters.",
    }),
    date: z.date({
        required_error: "A date is required.",
    }),
    categoryId: z.string({
        required_error: "Please select a category.",
    }),
    description: z.string(),
    imageUrl: z.string().optional(),
})

type Category = {
    id: string
    name: string
}

type LogEntryFormProps = {
    existingCategories: Category[]
    initialData?: {
        id: string
        title: string
        date: Date
        categoryId: string
        description: string
        imageUrl?: string | null
    }
    onSuccess?: () => void
}

export function LogEntryForm({ existingCategories, initialData, onSuccess }: LogEntryFormProps) {
    const router = useRouter()
    const [showSuccessDialog, setShowSuccessDialog] = useState(false)
    const [categories, setCategories] = useState<Category[]>(existingCategories)
    const [openCategory, setOpenCategory] = useState(false)
    const [inputValue, setInputValue] = useState("") // for creatable input inside command
    const [isUploading, setIsUploading] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: initialData?.title || "",
            date: initialData?.date ? new Date(initialData.date) : new Date(),
            description: initialData?.description || "",
            categoryId: initialData?.categoryId || "",
            imageUrl: initialData?.imageUrl || "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            // FIX: Format date as YYYY-MM-DD string to avoid timezone shifts
            const formattedDate = format(values.date, "yyyy-MM-dd")

            const payload = {
                ...values,
                date: formattedDate
            }

            if (initialData) {
                await updateLogEntry(initialData.id, payload)
                toast.success("Log updated successfully!")
            } else {
                await createLogEntry(payload)
                setShowSuccessDialog(true)
            }

            if (onSuccess) {
                onSuccess()
            }
        } catch (error) {
            toast.error(initialData ? "Failed to update log." : "Failed to create log.")
        }
    }

    // Handle dynamic creation
    const handleCreateCategory = async () => {
        if (!inputValue) return
        try {
            const newCat = await upsertCategory(inputValue)
            setCategories((prev) => [...prev, newCat])
            form.setValue("categoryId", newCat.id)
            setOpenCategory(false)
            setInputValue("")
            toast.success(`Category "${newCat.name}" created`)
        } catch (e) {
            toast.error("Failed to create category")
        }
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        const formData = new FormData()
        formData.append("file", file)

        try {
            const url = await uploadFilePlaceholder(formData)
            form.setValue("imageUrl", url) // Hidden field or state
            toast.success("Image uploaded")
        } catch (err) {
            toast.error("Upload failed")
        } finally {
            setIsUploading(false)
        }
    }

    const handleRedirect = () => {
        setShowSuccessDialog(false)
        router.push("/dashboard")
    }

    return (
        <>
            <Form {...form}>
                {/* existing form code */}
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-2xl mx-auto p-4 md:p-0">
                    {/* ... existing form fields ... */}
                    {/* ... */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Fixed Printer issue..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem className="flex flex-col pt-2.5">
                                    <FormLabel>Date</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(field.value, "PPP")
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) =>
                                                    date > new Date() || date < new Date("1900-01-01")
                                                }
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="categoryId"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Category</FormLabel>
                                <Popover open={openCategory} onOpenChange={setOpenCategory}>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                className={cn(
                                                    "w-full justify-between",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                            >
                                                {field.value
                                                    ? categories.find(
                                                        (category) => category.id === field.value
                                                    )?.name
                                                    : "Select category"}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[300px] p-0">
                                        <Command>
                                            <CommandInput
                                                placeholder="Search or create category..."
                                                onValueChange={(val) => setInputValue(val)}
                                            />
                                            <CommandList>
                                                <CommandEmpty>
                                                    <div className="p-2">
                                                        <p className="text-sm text-muted-foreground mb-2">No category found.</p>
                                                        <Button
                                                            size="sm"
                                                            variant="secondary"
                                                            className="w-full justify-start"
                                                            onClick={handleCreateCategory}
                                                        >
                                                            <PlusCircle className="mr-2 h-4 w-4" />
                                                            Create "{inputValue}"
                                                        </Button>
                                                    </div>
                                                </CommandEmpty>
                                                <CommandGroup>
                                                    {categories.map((category) => (
                                                        <CommandItem
                                                            value={category.name}
                                                            key={category.id}
                                                            onSelect={() => {
                                                                form.setValue("categoryId", category.id)
                                                                setOpenCategory(false)
                                                            }}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    category.id === field.value
                                                                        ? "opacity-100"
                                                                        : "opacity-0"
                                                                )}
                                                            />
                                                            {category.name}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Description (Markdown)</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Describe the task details here..."
                                        className="min-h-[150px] font-mono"
                                        {...field}
                                    />
                                </FormControl>
                                <FormDescription>
                                    Supports basic markdown.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="space-y-2">
                        <Label>Attachment</Label>
                        <Input type="file" onChange={handleFileUpload} disabled={isUploading} />
                        {/* Store URL hiddenly */}
                        <input type="hidden" {...form.register('imageUrl')} />
                        {form.watch("imageUrl") && <p className="text-xs text-green-600">Image attached</p>}
                    </div>

                    <Button type="submit" className="w-full">{initialData ? "Update Log" : "Save Log Entry"}</Button>
                </form>
            </Form>

            <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Berhasil!</DialogTitle>
                        <DialogDescription>
                            Log aktivitas baru telah berhasil disimpan.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button onClick={handleRedirect}>Lihat Dashboard</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
