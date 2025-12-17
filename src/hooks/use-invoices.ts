
import { useState, useEffect, useCallback } from "react"
import { type Invoice } from "@/types"

export function useInvoices() {
    const [invoices, setInvoices] = useState<Invoice[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchInvoices = useCallback(async () => {
        try {
            const response = await fetch('/api/invoices', { cache: 'no-store' })
            const data = await response.json()

            if (data.invoices && Array.isArray(data.invoices)) {
                // Ensure proper typing
                const mapped: Invoice[] = data.invoices.map((inv: any) => ({
                    id: inv.id || inv.invoiceNumber,
                    customer: inv.customer,
                    email: inv.email,
                    issueDate: inv.issueDate || inv.date,
                    dueDate: inv.dueDate,
                    amount: typeof inv.amount === 'string' ? parseFloat(inv.amount) : inv.amount,
                    vatAmount: typeof inv.vatAmount === 'string' ? parseFloat(inv.vatAmount) : inv.vatAmount,
                    status: inv.status,
                }))
                setInvoices(mapped)
            } else {
                setInvoices([])
            }
        } catch (err) {
            console.error(err)
            setError('Failed to load invoices')
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchInvoices()
    }, [fetchInvoices])

    return { invoices, isLoading, error, refresh: fetchInvoices }
}
