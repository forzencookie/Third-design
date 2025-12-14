import { Verification } from "./mock-data"

export interface VatReport {
    period: string
    dueDate: string
    status: "upcoming" | "submitted" | "overdue"
    // Official API/Form fields (Rutor)
    ruta05: number // Momspliktig försäljning 25%
    ruta10: number // Utgående moms 25%
    ruta48: number // Ingående moms
    ruta49: number // Att betala/återfå
    // Aggregates
    salesVat: number
    inputVat: number
    netVat: number
}

// Helper functions
function getVatDeadline(quarter: number, year: number): Date {
    const deadline = new Date(year, 0, 1)

    // Set default deadline time to noon to avoid timezone edge cases
    deadline.setHours(12, 0, 0, 0)

    switch (quarter) {
        case 1: // Jan-Mar -> Deadline May 12th
            deadline.setMonth(4) // May (0-indexed)
            deadline.setDate(12)
            break
        case 2: // Apr-Jun -> Deadline Aug 17th
            deadline.setMonth(7) // Aug
            deadline.setDate(17)
            break
        case 3: // Jul-Sep -> Deadline Nov 12th
            deadline.setMonth(10) // Nov
            deadline.setDate(12)
            break
        case 4: // Oct-Dec -> Deadline Feb 12th (next year)
            deadline.setFullYear(year + 1)
            deadline.setMonth(1) // Feb
            deadline.setDate(12)
            break
    }
    return deadline
}

function formatDate(date: Date): string {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
}

export const VatProcessor = {
    calculateReport(verifikationer: Verification[], period: string): VatReport {
        const [p, yearStr] = period.split(" ") // e.g., "Q4 2024"
        const year = parseInt(yearStr)
        const quarter = parseInt(p.replace("Q", ""))

        // Define Period Range
        const startMonth = (quarter - 1) * 3 // 0, 3, 6, 9
        const endMonth = startMonth + 2

        // Filter Transactions
        const periodTransactions = verifikationer.filter(v => {
            const d = new Date(v.date)
            return d.getFullYear() === year && d.getMonth() >= startMonth && d.getMonth() <= endMonth
        })

        let ruta10 = 0 // Utgående moms 25%
        let ruta48 = 0 // Ingående moms

        // Simulating sales base (Ruta 05) based on VAT
        // In real app, we'd check revenue accounts (3001 etc)

        periodTransactions.forEach(v => {
            if (v.konto.startsWith("261") || v.konto === "2620" || v.konto === "2630") {
                ruta10 += Math.abs(v.amount)
            }
            if (v.konto === "2640" || v.konto === "2641") {
                ruta48 += Math.abs(v.amount)
            }
        })

        const salesVat = ruta10
        const inputVat = ruta48
        const netVat = salesVat - inputVat
        const ruta49 = netVat // Positive = pay, Negative = get back

        // Reverse calculate sales base for Ruta 05 (approximate)
        const ruta05 = salesVat * 4

        const dueDate = getVatDeadline(quarter, year)
        const today = new Date() // Use real date

        let status: VatReport["status"] = "upcoming"
        if (today > dueDate) status = "overdue"

        return {
            period,
            dueDate: formatDate(dueDate),
            status,
            ruta05,
            ruta10,
            ruta48,
            ruta49,
            salesVat,
            inputVat,
            netVat
        }
    }
}
