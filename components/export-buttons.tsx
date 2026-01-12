"use client"

import { Button } from "@/components/ui/button"
import { FileDown, FileSpreadsheet } from "lucide-react"

import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import * as XLSX from "xlsx"

// Define the shape of data we expect to export
type LogExportData = {
    id: string
    date: Date
    title: string
    category: { name: string }
    description: string
}

type Props = {
    data: LogExportData[]
}

export function ExportButtons({ data }: Props) {

    const handleExportPDF = () => {
        const doc = new jsPDF()

        doc.text("Personal IT Operations Logbook", 14, 15)
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 22)

        const tableData = data.map(log => [
            new Date(log.date).toLocaleDateString(),
            log.category.name,
            log.title,
            log.description.substring(0, 50) + (log.description.length > 50 ? '...' : '')
        ])

        autoTable(doc, {
            head: [['Date', 'Category', 'Title', 'Description']],
            body: tableData,
            startY: 30,
        })

        doc.save("logbook-export.pdf")
    }

    const handleExportExcel = () => {
        const flattenData = data.map(log => ({
            Date: new Date(log.date).toLocaleDateString(),
            Title: log.title,
            Category: log.category.name,
            Description: log.description,
            ID: log.id
        }))

        const worksheet = XLSX.utils.json_to_sheet(flattenData)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, "Logs")
        XLSX.writeFile(workbook, "logbook-export.xlsx")
    }

    return (
        <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportPDF}>
                <FileDown className="mr-2 h-4 w-4" />
                PDF
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportExcel}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Excel
            </Button>
        </div>
    )
}
