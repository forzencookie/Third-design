"use client"

import * as React from "react"
import { useState, useMemo, useEffect, useCallback } from "react"
import {
    Calendar,
    Search,
    SlidersHorizontal,
    FileText,
    MoreHorizontal,
    Plus,
    User,
    Clock,
    Banknote,
    CheckCircle2,
    Hash,
    X,
    Send,
    Mail,
    AlertCircle,
    AlertTriangle,
    TrendingUp,
} from "lucide-react"
import { cn, formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group"
import { useToast } from "@/components/ui/toast"
import { AmountText } from "../table/table-shell"
import {
    DataTable,
    DataTableHeader,
    DataTableHeaderCell,
    DataTableBody,
    DataTableRow,
    DataTableCell,
    DataTableAddRow
} from "@/components/ui/data-table"
import { StatCard, StatCardGrid } from "@/components/ui/stat-card"
import { DialogBody, DetailsGrid, FieldGrid } from "@/components/ui/field-grid"
import { HelperText } from "@/components/ui/helper-text"
import { AppStatusBadge } from "@/components/ui/status-badge"
import {
    type InvoiceStatus,
    INVOICE_STATUSES
} from "@/lib/status-types"
import { INVOICE_STATUS_LABELS } from "@/lib/localization"
import { type Invoice, mockInvoices } from "@/data/invoices"
import { useTableData, commonSortHandlers } from "@/hooks/use-table"
import { useTextMode } from "@/providers/text-mode-provider"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { BulkActionToolbar, useBulkSelection, type BulkAction } from "../shared/bulk-action-toolbar"
import { Trash2, Download } from "lucide-react"

// Sort handlers specific to invoices
const invoiceSortHandlers = {
    issueDate: commonSortHandlers.date as (a: Invoice, b: Invoice) => number,
    amount: commonSortHandlers.amount as (a: Invoice, b: Invoice) => number,
}

export function InvoicesTable() {
    const { text } = useTextMode()
    const [invoices, setInvoices] = useState<Invoice[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [newInvoiceDialogOpen, setNewInvoiceDialogOpen] = useState(false)
    const [invoiceDialogExpanded, setInvoiceDialogExpanded] = useState(false)
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
    const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
    const [reminderSent, setReminderSent] = useState<string | null>(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null)

    // Fetch invoices from API
    const fetchInvoices = useCallback(async () => {
        try {
            const response = await fetch('/api/invoices/processed', { cache: 'no-store' })
            const data = await response.json()

            if (data.invoices && data.invoices.length > 0) {
                const mapped: Invoice[] = data.invoices.map((inv: Record<string, unknown>) => ({
                    id: inv.invoiceNumber as string,
                    customer: inv.customer as string,
                    email: inv.email as string,
                    issueDate: inv.date as string,
                    dueDate: inv.dueDate as string,
                    amount: inv.amount as string,
                    status: inv.status as string,
                }))
                setInvoices(mapped)
            } else {
                setInvoices(mockInvoices)
            }
        } catch {
            setInvoices(mockInvoices)
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchInvoices()
        // const interval = setInterval(fetchInvoices, 5000)
        // return () => clearInterval(interval)
    }, [fetchInvoices])

    // Form validation state for new invoice
    const [newInvoiceForm, setNewInvoiceForm] = useState({
        customer: '',
        amount: '',
        dueDate: '',
    })
    const [formErrors, setFormErrors] = useState<{
        customer?: string;
        email?: string;
        amount?: string;
        dueDate?: string;
        items?: string;
    }>({})

    // New invoice form state
    const [newInvoiceCustomer, setNewInvoiceCustomer] = useState("")
    const [newInvoiceEmail, setNewInvoiceEmail] = useState("")
    const [newInvoiceAddress, setNewInvoiceAddress] = useState("")
    const [newInvoiceOrgNumber, setNewInvoiceOrgNumber] = useState("")
    const [newInvoiceReference, setNewInvoiceReference] = useState("")
    const [newInvoiceDueDate, setNewInvoiceDueDate] = useState("")
    const [newInvoicePaymentTerms, setNewInvoicePaymentTerms] = useState("30")
    const [newInvoiceNotes, setNewInvoiceNotes] = useState("")
    const [isCreating, setIsCreating] = useState(false)

    // Invoice line items
    interface InvoiceLineItem {
        id: string
        description: string
        quantity: number
        unitPrice: number
        vatRate: number
    }

    const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([
        { id: '1', description: '', quantity: 1, unitPrice: 0, vatRate: 25 }
    ])

    const addLineItem = () => {
        setLineItems(prev => [...prev, {
            id: String(Date.now()),
            description: '',
            quantity: 1,
            unitPrice: 0,
            vatRate: 25
        }])
    }

    const removeLineItem = (id: string) => {
        if (lineItems.length > 1) {
            setLineItems(prev => prev.filter(item => item.id !== id))
        }
    }

    const updateLineItem = (id: string, field: keyof InvoiceLineItem, value: string | number) => {
        setLineItems(prev => prev.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ))
    }

    // Calculate totals
    const invoiceTotals = useMemo(() => {
        const subtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
        const vatAmount = lineItems.reduce((sum, item) => {
            const lineTotal = item.quantity * item.unitPrice
            return sum + (lineTotal * item.vatRate / 100)
        }, 0)
        const total = subtotal + vatAmount
        return { subtotal, vatAmount, total }
    }, [lineItems])

    // Reset form when dialog closes
    const resetInvoiceForm = () => {
        setNewInvoiceCustomer("")
        setNewInvoiceEmail("")
        setNewInvoiceAddress("")
        setNewInvoiceOrgNumber("")
        setNewInvoiceReference("")
        setNewInvoiceDueDate("")
        setNewInvoicePaymentTerms("30")
        setNewInvoiceNotes("")
        setLineItems([{ id: '1', description: '', quantity: 1, unitPrice: 0, vatRate: 25 }])
        setFormErrors({})
    }

    // Toast notifications
    const toast = useToast()

    // Use the unified table data hook for filtering and sorting
    const tableData = useTableData<Invoice>({
        filter: {
            searchFields: ['customer', 'id'],
        },
        sort: {
            initialSortBy: 'issueDate',
            initialSortOrder: 'desc',
            sortHandlers: invoiceSortHandlers,
        },
    })

    // Process invoices through filter and sort
    const filteredInvoices = useMemo(() =>
        tableData.processItems(invoices),
        [tableData, invoices]
    )

    // Calculate stats for stat cards
    const stats = useMemo(() => {
        const outstanding = invoices.filter(inv =>
            inv.status !== INVOICE_STATUS_LABELS.PAID && inv.status !== INVOICE_STATUS_LABELS.CANCELLED
        )
        const overdue = invoices.filter(inv =>
            inv.status === INVOICE_STATUS_LABELS.OVERDUE ||
            (inv.status !== INVOICE_STATUS_LABELS.PAID && new Date(inv.dueDate) < new Date())
        )
        const paid = invoices.filter(inv => inv.status === INVOICE_STATUS_LABELS.PAID)

        const outstandingAmount = outstanding.reduce((sum, inv) => sum + inv.amount, 0)
        const overdueAmount = overdue.reduce((sum, inv) => sum + inv.amount, 0)
        const paidAmount = paid.reduce((sum, inv) => sum + inv.amount, 0)

        return {
            outstandingCount: outstanding.length,
            outstandingAmount,
            overdueCount: overdue.length,
            overdueAmount,
            paidAmount,
            total: invoices.length
        }
    }, [invoices])

    // Bulk selection
    const bulkSelection = useBulkSelection(filteredInvoices)

    const bulkActions: BulkAction[] = useMemo(() => [
        {
            id: "delete",
            label: text.actions.delete,
            icon: Trash2,
            variant: "destructive",
            onClick: (ids) => {
                setInvoices(prev => prev.filter(inv => !ids.includes(inv.id)))
                toast.success(text.invoices.invoicesDeleted, `${ids.length} ${text.invoices.invoicesDeletedDesc}`)
                bulkSelection.clearSelection()
            },
        },
        {
            id: "send",
            label: text.actions.send,
            icon: Send,
            onClick: (ids) => {
                toast.success(text.invoices.invoicesSent, `${ids.length} ${text.invoices.invoicesSentDesc}`)
                bulkSelection.clearSelection()
            },
        },
        {
            id: "download",
            label: text.actions.download,
            icon: Download,
            onClick: (ids) => {
                toast.info(text.actions.downloading, `${text.invoices.preparingDownload} ${ids.length} ${text.invoices.invoices}...`)
                bulkSelection.clearSelection()
            },
        },
    ], [toast, bulkSelection, text])

    const handleDeleteClick = (id: string) => {
        setInvoiceToDelete(id)
        setDeleteDialogOpen(true)
    }

    const handleConfirmDelete = () => {
        if (invoiceToDelete) {
            setInvoices(prev => prev.filter(inv => inv.id !== invoiceToDelete))
            toast.success("Faktura raderad", `Faktura ${invoiceToDelete} har raderats`)
        }
        setDeleteDialogOpen(false)
        setInvoiceToDelete(null)
    }

    const handleCreateInvoice = () => {
        // Validate form
        const errors: typeof formErrors = {}

        if (!newInvoiceCustomer.trim()) {
            errors.customer = "Kundnamn krävs"
        } else if (newInvoiceCustomer.trim().length < 2) {
            errors.customer = "Kundnamn måste vara minst 2 tecken"
        }

        if (newInvoiceEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newInvoiceEmail)) {
            errors.email = "Ogiltig e-postadress"
        }

        // Check if at least one line item has description and price
        const validItems = lineItems.filter(item => item.description.trim() && item.unitPrice > 0)
        if (validItems.length === 0) {
            errors.items = "Lägg till minst en fakturarad med beskrivning och pris"
        }

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors)
            return
        }

        setIsCreating(true)

        // Simulate API call
        setTimeout(() => {
            const newId = `FAK-${String(invoices.length + 1).padStart(3, '0')}`
            const today = new Date().toISOString().split('T')[0]
            const daysToAdd = parseInt(newInvoicePaymentTerms) || 30
            const dueDate = newInvoiceDueDate || new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

            const newInvoice: Invoice = {
                id: newId,
                customer: newInvoiceCustomer,
                email: newInvoiceEmail,
                amount: invoiceTotals.total,
                issueDate: today,
                dueDate: dueDate,
                status: INVOICE_STATUS_LABELS.DRAFT,
            }

            setInvoices(prev => [newInvoice, ...prev])
            setNewInvoiceDialogOpen(false)
            setIsCreating(false)

            // Reset form
            resetInvoiceForm()

            // Show success toast with action
            toast.addToast({
                title: "Faktura skapad!",
                description: `Faktura ${newId} till ${newInvoiceCustomer} har skapats`,
                variant: "success",
                duration: 8000,
                action: {
                    label: "Visa",
                    onClick: () => {
                        const createdInvoice = invoices.find(inv => inv.id === newId) || newInvoice
                        setSelectedInvoice(createdInvoice)
                        setDetailsDialogOpen(true)
                    }
                }
            })
        }, 600)
    }

    const handleViewDetails = (invoice: Invoice) => {
        setSelectedInvoice(invoice)
        setDetailsDialogOpen(true)
    }

    const handleSendInvoice = (id: string) => {
        const invoice = invoices.find(inv => inv.id === id)
        // Update status to sent
        setInvoices(prev =>
            prev.map(inv =>
                inv.id === id
                    ? { ...inv, status: INVOICE_STATUS_LABELS.SENT }
                    : inv
            )
        )
        toast.success("Faktura skickad",
            `Faktura ${id} skickades till ${invoice?.customer || 'kunden'}`)
    }

    const handleMarkAsPaid = (id: string) => {
        const invoice = invoices.find(inv => inv.id === id)
        // Update status to paid
        setInvoices(prev =>
            prev.map(inv =>
                inv.id === id
                    ? { ...inv, status: INVOICE_STATUS_LABELS.PAID }
                    : inv
            )
        )
        toast.success("Markerad som betald",
            `Faktura ${id} har markerats som betald`)
    }

    const handleSendReminder = (id: string) => {
        const invoice = invoices.find(inv => inv.id === id)
        setReminderSent(id)
        toast.success("Påminnelse skickad", `Betalningspåminnelse har skickats till ${invoice?.customer || 'kunden'}`)
        setTimeout(() => setReminderSent(null), 2000)
    }

    return (
        <div className="w-full space-y-6">
            {/* Stats Cards */}
            <StatCardGrid columns={4}>
                <StatCard
                    label={text.stats.totalInvoices}
                    value={stats.total}
                    subtitle={text.invoices.allInvoices}
                    icon={FileText}
                />
                <StatCard
                    label={text.stats.outstanding}
                    value={formatCurrency(stats.outstandingAmount)}
                    subtitle={`${stats.outstandingCount} ${text.invoices.invoices}`}
                    icon={Clock}
                />
                <StatCard
                    label={text.stats.overdue}
                    value={formatCurrency(stats.overdueAmount)}
                    subtitle={`${stats.overdueCount} ${text.invoices.invoices}`}
                    icon={AlertTriangle}
                    changeType="negative"
                />
                <StatCard
                    label={text.stats.paid}
                    value={formatCurrency(stats.paidAmount)}
                    icon={TrendingUp}
                    changeType="positive"
                />
            </StatCardGrid>

            {/* Section Separator */}
            <div className="border-b-2 border-border/60" />

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{text.confirm.areYouSure}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {text.confirm.cannotUndo}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{text.actions.cancel}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmDelete}
                            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                        >
                            {text.actions.delete}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* New Invoice Dialog - Improved with Split Pane */}
            <Dialog open={newInvoiceDialogOpen} onOpenChange={(open) => {
                setNewInvoiceDialogOpen(open)
                if (!open) {
                    resetInvoiceForm()
                    setInvoiceDialogExpanded(false)
                }
            }}>
                <DialogContent
                    className={cn(
                        "max-h-[90vh]",
                        invoiceDialogExpanded ? "max-w-[95vw]" : "max-w-3xl"
                    )}
                    expandable
                    onExpandedChange={setInvoiceDialogExpanded}
                >
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            {text.invoices.createInvoice}
                        </DialogTitle>
                    </DialogHeader>

                    <div className={cn(
                        "flex gap-6",
                        invoiceDialogExpanded ? "flex-row" : "flex-col"
                    )}>
                        {/* Left Side - Form */}
                        <div className={cn(
                            "space-y-6 py-4 overflow-y-auto px-1 -mx-1",
                            invoiceDialogExpanded ? "w-1/2 max-h-[calc(90vh-180px)] pr-4" : "w-full max-h-[calc(90vh-180px)]"
                        )}>
                            {/* Customer Information Section */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                    Kundinformation
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">
                                            Kundnamn / Företag <span className="text-destructive">*</span>
                                        </label>
                                        <Input
                                            placeholder="Företag AB"
                                            value={newInvoiceCustomer}
                                            onChange={(e) => {
                                                setNewInvoiceCustomer(e.target.value)
                                                if (formErrors.customer) {
                                                    setFormErrors(prev => ({ ...prev, customer: undefined }))
                                                }
                                            }}
                                            aria-invalid={!!formErrors.customer}
                                            className={formErrors.customer ? "border-destructive" : ""}
                                        />
                                        {formErrors.customer && (
                                            <p className="text-sm text-destructive flex items-center gap-1">
                                                <AlertCircle className="h-3.5 w-3.5" />
                                                {formErrors.customer}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">E-post</label>
                                        <Input
                                            type="email"
                                            placeholder="faktura@foretag.se"
                                            value={newInvoiceEmail}
                                            onChange={(e) => {
                                                setNewInvoiceEmail(e.target.value)
                                                if (formErrors.email) {
                                                    setFormErrors(prev => ({ ...prev, email: undefined }))
                                                }
                                            }}
                                            className={formErrors.email ? "border-destructive" : ""}
                                        />
                                        {formErrors.email && (
                                            <p className="text-sm text-destructive flex items-center gap-1">
                                                <AlertCircle className="h-3.5 w-3.5" />
                                                {formErrors.email}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Org.nummer</label>
                                        <Input
                                            placeholder="556123-4567"
                                            value={newInvoiceOrgNumber}
                                            onChange={(e) => setNewInvoiceOrgNumber(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Er referens</label>
                                        <Input
                                            placeholder="Anna Andersson"
                                            value={newInvoiceReference}
                                            onChange={(e) => setNewInvoiceReference(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Adress</label>
                                    <Input
                                        placeholder="Storgatan 1, 111 22 Stockholm"
                                        value={newInvoiceAddress}
                                        onChange={(e) => setNewInvoiceAddress(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="border-t" />

                            {/* Invoice Lines Section */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                        Fakturarader
                                    </h3>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={addLineItem}
                                    >
                                        <Plus className="h-4 w-4 mr-1" />
                                        Lägg till rad
                                    </Button>
                                </div>

                                {formErrors.items && (
                                    <p className="text-sm text-destructive flex items-center gap-1">
                                        <AlertCircle className="h-3.5 w-3.5" />
                                        {formErrors.items}
                                    </p>
                                )}

                                {/* Line items header */}
                                <div className="grid grid-cols-[1fr,80px,100px,80px,32px] gap-2 text-xs font-medium text-muted-foreground px-1">
                                    <span>Beskrivning</span>
                                    <span className="text-right">Antal</span>
                                    <span className="text-right">À-pris</span>
                                    <span className="text-right">Moms</span>
                                    <span></span>
                                </div>

                                {/* Line items */}
                                <div className="space-y-2">
                                    {lineItems.map((item, index) => (
                                        <div key={item.id} className="grid grid-cols-[1fr,80px,100px,80px,32px] gap-2 items-center">
                                            <Input
                                                placeholder="Konsulttjänster..."
                                                value={item.description}
                                                onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                                                className="h-9"
                                            />
                                            <Input
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) => updateLineItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                                                className="h-9 text-right"
                                            />
                                            <div className="relative">
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={item.unitPrice || ''}
                                                    onChange={(e) => updateLineItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                                                    className="h-9 text-right pr-8"
                                                    placeholder="0"
                                                />
                                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                                                    kr
                                                </span>
                                            </div>
                                            <Select
                                                value={String(item.vatRate)}
                                                onValueChange={(val) => updateLineItem(item.id, 'vatRate', parseInt(val))}
                                            >
                                                <SelectTrigger className="h-9 w-[80px]">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="25">25%</SelectItem>
                                                    <SelectItem value="12">12%</SelectItem>
                                                    <SelectItem value="6">6%</SelectItem>
                                                    <SelectItem value="0">0%</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-9 w-9"
                                                onClick={() => removeLineItem(item.id)}
                                                disabled={lineItems.length === 1}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>

                                {/* Totals */}
                                <div className="border-t pt-4 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Summa exkl. moms</span>
                                        <span>{formatCurrency(invoiceTotals.subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Moms</span>
                                        <span>{formatCurrency(invoiceTotals.vatAmount)}</span>
                                    </div>
                                    <div className="flex justify-between font-semibold text-base border-t pt-2">
                                        <span>Att betala</span>
                                        <span>{formatCurrency(invoiceTotals.total)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="border-t" />

                            {/* Payment Terms Section */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                    Betalningsvillkor
                                </h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Betalningsvillkor</label>
                                        <Select
                                            value={newInvoicePaymentTerms}
                                            onValueChange={setNewInvoicePaymentTerms}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="10">10 dagar netto</SelectItem>
                                                <SelectItem value="15">15 dagar netto</SelectItem>
                                                <SelectItem value="30">30 dagar netto</SelectItem>
                                                <SelectItem value="45">45 dagar netto</SelectItem>
                                                <SelectItem value="60">60 dagar netto</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Fakturadatum</label>
                                        <Input
                                            type="date"
                                            value={new Date().toISOString().split('T')[0]}
                                            disabled
                                            className="bg-muted"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Förfallodatum</label>
                                        <Input
                                            type="date"
                                            value={newInvoiceDueDate || new Date(Date.now() + parseInt(newInvoicePaymentTerms) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                                            min={new Date().toISOString().split('T')[0]}
                                            onChange={(e) => setNewInvoiceDueDate(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Notes Section */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Meddelande på faktura</label>
                                <textarea
                                    placeholder="Tack för er beställning! Vid frågor kontakta oss på faktura@foretag.se"
                                    value={newInvoiceNotes}
                                    onChange={(e) => setNewInvoiceNotes(e.target.value)}
                                    rows={2}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
                                />
                            </div>
                        </div>

                        {/* Right Side - Invoice Preview (only when expanded) */}
                        {invoiceDialogExpanded && (
                            <div className="w-1/2 border-l pl-6">
                                <div className="sticky top-0">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                                            Förhandsgranska
                                        </h3>
                                    </div>

                                    {/* Invoice Preview Card */}
                                    <div className="bg-white dark:bg-zinc-900 border rounded-lg shadow-sm p-6 space-y-6 max-h-[calc(90vh-220px)] overflow-y-auto">
                                        {/* Header */}
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h2 className="text-xl font-bold">Faktura</h2>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    Fakturanummer: <span className="font-mono">UTKAST-{String(invoices.length + 1).padStart(3, '0')}</span>
                                                </p>
                                            </div>
                                            <div className="text-right text-sm">
                                                <p>Fakturadatum: {new Date().toLocaleDateString('sv-SE')}</p>
                                                <p>Förfallodatum: {new Date(Date.now() + parseInt(newInvoicePaymentTerms) * 24 * 60 * 60 * 1000).toLocaleDateString('sv-SE')}</p>
                                            </div>
                                        </div>

                                        {/* Customer & Sender */}
                                        <div className="grid grid-cols-2 gap-6 pt-4 border-t">
                                            <div>
                                                <p className="text-xs font-medium text-muted-foreground mb-1">FRÅN</p>
                                                <p className="font-medium">Ditt Företag AB</p>
                                                <p className="text-sm text-muted-foreground">Org.nr: 556XXX-XXXX</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-muted-foreground mb-1">TILL</p>
                                                <p className="font-medium">{newInvoiceCustomer || 'Kundnamn'}</p>
                                                {newInvoiceOrgNumber && <p className="text-sm text-muted-foreground">Org.nr: {newInvoiceOrgNumber}</p>}
                                                {newInvoiceAddress && <p className="text-sm text-muted-foreground">{newInvoiceAddress}</p>}
                                                {newInvoiceEmail && <p className="text-sm text-muted-foreground">{newInvoiceEmail}</p>}
                                                {newInvoiceReference && <p className="text-sm text-muted-foreground">Ref: {newInvoiceReference}</p>}
                                            </div>
                                        </div>

                                        {/* Line Items Table */}
                                        <div className="pt-4 border-t">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="border-b">
                                                        <th className="text-left py-2 font-medium">Beskrivning</th>
                                                        <th className="text-right py-2 font-medium w-16">Antal</th>
                                                        <th className="text-right py-2 font-medium w-24">À-pris</th>
                                                        <th className="text-right py-2 font-medium w-16">Moms</th>
                                                        <th className="text-right py-2 font-medium w-24">Belopp</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {lineItems.filter(item => item.description || item.unitPrice > 0).map((item) => (
                                                        <tr key={item.id} className="border-b border-dashed">
                                                            <td className="py-2">{item.description || '—'}</td>
                                                            <td className="text-right py-2">{item.quantity}</td>
                                                            <td className="text-right py-2">{formatCurrency(item.unitPrice)}</td>
                                                            <td className="text-right py-2">{item.vatRate}%</td>
                                                            <td className="text-right py-2">{formatCurrency(item.quantity * item.unitPrice)}</td>
                                                        </tr>
                                                    ))}
                                                    {lineItems.filter(item => item.description || item.unitPrice > 0).length === 0 && (
                                                        <tr>
                                                            <td colSpan={5} className="py-4 text-center text-muted-foreground">
                                                                Inga fakturarader ännu
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Totals */}
                                        <div className="pt-4 border-t space-y-1">
                                            <div className="flex justify-between text-sm">
                                                <span>Summa exkl. moms</span>
                                                <span>{formatCurrency(invoiceTotals.subtotal)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span>Moms</span>
                                                <span>{formatCurrency(invoiceTotals.vatAmount)}</span>
                                            </div>
                                            <div className="flex justify-between font-bold text-lg pt-2 border-t">
                                                <span>Att betala</span>
                                                <span>{formatCurrency(invoiceTotals.total)}</span>
                                            </div>
                                        </div>

                                        {/* Notes */}
                                        {newInvoiceNotes && (
                                            <div className="pt-4 border-t">
                                                <p className="text-xs font-medium text-muted-foreground mb-1">MEDDELANDE</p>
                                                <p className="text-sm">{newInvoiceNotes}</p>
                                            </div>
                                        )}

                                        {/* Payment Info */}
                                        <div className="pt-4 border-t text-sm">
                                            <p className="text-xs font-medium text-muted-foreground mb-1">BETALNINGSINFORMATION</p>
                                            <p>Bankgiro: 123-4567</p>
                                            <p>Betalningsvillkor: {newInvoicePaymentTerms} dagar netto</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="gap-2">
                        <DialogClose asChild>
                            <Button variant="outline" disabled={isCreating}>Avbryt</Button>
                        </DialogClose>
                        <Button
                            variant="outline"
                            onClick={() => {
                                // Save as draft logic would go here
                                handleCreateInvoice()
                            }}
                            disabled={isCreating}
                        >
                            Spara utkast
                        </Button>
                        <Button
                            onClick={handleCreateInvoice}
                            disabled={isCreating}
                        >
                            <Send className="h-4 w-4 mr-2" />
                            {isCreating ? "Skapar..." : "Skapa & skicka"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Details Dialog */}
            <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{text.invoices.details}</DialogTitle>
                    </DialogHeader>
                    {selectedInvoice && (
                        <DialogBody>
                            <DetailsGrid
                                items={[
                                    { label: text.invoices.invoiceNumber, value: selectedInvoice.id },
                                    { label: text.invoices.customer, value: selectedInvoice.customer },
                                    { label: text.invoices.issueDate, value: selectedInvoice.issueDate },
                                    { label: text.invoices.dueDate, value: selectedInvoice.dueDate },
                                    { label: text.labels.amount, value: formatCurrency(selectedInvoice.amount) },
                                    { label: text.labels.status, value: <AppStatusBadge status={selectedInvoice.status} /> },
                                ]}
                            />
                        </DialogBody>
                    )}
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">{text.actions.close}</Button>
                        </DialogClose>
                        <Button>
                            <Send className="h-4 w-4 mr-2" />
                            {text.actions.send}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Table */}
            <DataTable
                title={text.invoices.outgoingInvoices}
                headerActions={
                    <div className="flex items-center gap-2">
                        {reminderSent && (
                            <span className="text-sm text-green-600 dark:text-green-500/70 flex items-center gap-1">
                                <Mail className="h-3.5 w-3.5" />
                                {text.invoices.reminderSent}!
                            </span>
                        )}
                        <InputGroup className="w-56">
                            <InputGroupAddon>
                                <InputGroupText>
                                    <Search />
                                </InputGroupText>
                            </InputGroupAddon>
                            <InputGroupInput
                                placeholder={text.invoices.search}
                                value={tableData.searchQuery}
                                onChange={(e) => tableData.setSearchQuery(e.target.value)}
                            />
                        </InputGroup>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className={cn("h-9 gap-1", tableData.statusFilter.length > 0 && "border-primary text-primary")}>
                                    <SlidersHorizontal className="h-3.5 w-3.5" />
                                    {text.actions.filter}
                                    {tableData.statusFilter.length > 0 && <span className="ml-1 rounded-full bg-primary/10 px-1.5 text-xs">{tableData.statusFilter.length}</span>}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>{text.labels.filterByStatus}</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {Object.values(INVOICE_STATUSES).map((status) => (
                                    <DropdownMenuCheckboxItem
                                        key={status}
                                        checked={tableData.statusFilter.includes(status)}
                                        onCheckedChange={() => tableData.toggleStatusFilter(status)}
                                    >
                                        {status}
                                    </DropdownMenuCheckboxItem>
                                ))}
                                {tableData.statusFilter.length > 0 && (
                                    <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => tableData.clearFilters()}>
                                            <X className="h-3.5 w-3.5 mr-2" />
                                            {text.actions.clearFilter}
                                        </DropdownMenuItem>
                                    </>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuLabel>{text.labels.sortBy}</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => tableData.toggleSort("issueDate")}>
                                    {text.labels.date} {tableData.getSortIndicator("issueDate") === "asc" ? "↑" : tableData.getSortIndicator("issueDate") === "desc" ? "↓" : ""}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => tableData.toggleSort("amount")}>
                                    {text.labels.amount} {tableData.getSortIndicator("amount") === "asc" ? "↑" : tableData.getSortIndicator("amount") === "desc" ? "↓" : ""}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => tableData.toggleSort("customer")}>
                                    {text.invoices.customer} {tableData.getSortIndicator("customer") === "asc" ? "↑" : tableData.getSortIndicator("customer") === "desc" ? "↓" : ""}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button size="sm" className="h-8 gap-1" onClick={() => setNewInvoiceDialogOpen(true)}>
                            <Plus className="h-3.5 w-3.5" />
                            {text.invoices.create}
                        </Button>
                    </div>
                }
            >
                <DataTableHeader>
                    <DataTableHeaderCell width="40px">
                        <Checkbox
                            checked={bulkSelection.allSelected}
                            onCheckedChange={bulkSelection.toggleAll}
                            aria-label={text.actions.selectAll}
                        />
                    </DataTableHeaderCell>
                    <DataTableHeaderCell label={text.invoices.invoiceNumber} icon={Hash} />
                    <DataTableHeaderCell label={text.invoices.customer} icon={User} />
                    <DataTableHeaderCell label={text.invoices.issueDate} icon={Calendar} />
                    <DataTableHeaderCell label={text.invoices.dueDate} icon={Clock} />
                    <DataTableHeaderCell label={text.labels.amount} icon={Banknote} />
                    <DataTableHeaderCell label={text.labels.status} icon={CheckCircle2} />
                    <DataTableHeaderCell label="" align="right" />
                </DataTableHeader>
                <DataTableBody>
                    {filteredInvoices.map((invoice) => (
                        <DataTableRow
                            key={invoice.id}
                            selected={bulkSelection.isSelected(invoice.id)}
                            className="group"
                        >
                            <DataTableCell>
                                <Checkbox
                                    checked={bulkSelection.isSelected(invoice.id)}
                                    onCheckedChange={() => bulkSelection.toggleItem(invoice.id)}
                                    aria-label={`${text.actions.select} ${invoice.id}`}
                                />
                            </DataTableCell>
                            <DataTableCell bold>{invoice.id}</DataTableCell>
                            <DataTableCell bold>{invoice.customer}</DataTableCell>
                            <DataTableCell muted>{invoice.issueDate}</DataTableCell>
                            <DataTableCell muted>{invoice.dueDate}</DataTableCell>
                            <DataTableCell align="right">
                                <AmountText value={invoice.amount} />
                            </DataTableCell>
                            <DataTableCell>
                                <AppStatusBadge
                                    status={invoice.status}
                                    size="sm"
                                />
                            </DataTableCell>
                            <DataTableCell align="right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="sr-only">{text.actions.openMenu}</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>{text.labels.actions}</DropdownMenuLabel>
                                        <DropdownMenuItem onClick={() => handleViewDetails(invoice)}>
                                            {text.actions.viewDetails}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleViewDetails(invoice)}>
                                            {text.actions.edit}
                                        </DropdownMenuItem>
                                        {invoice.status === INVOICE_STATUSES.DRAFT && (
                                            <DropdownMenuItem onClick={() => handleSendInvoice(invoice.id)}>
                                                <Send className="h-3.5 w-3.5 mr-2" />
                                                {text.actions.send}
                                            </DropdownMenuItem>
                                        )}
                                        {(invoice.status === INVOICE_STATUSES.SENT || invoice.status === INVOICE_STATUSES.OVERDUE) && (
                                            <>
                                                <DropdownMenuItem onClick={() => handleMarkAsPaid(invoice.id)}>
                                                    <CheckCircle2 className="h-3.5 w-3.5 mr-2" />
                                                    {text.invoices.markPaid}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleSendReminder(invoice.id)}>
                                                    <Mail className="h-3.5 w-3.5 mr-2" />
                                                    {text.invoices.sendReminder}
                                                </DropdownMenuItem>
                                            </>
                                        )}
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteClick(invoice.id)}>
                                            {text.actions.delete}
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </DataTableCell>
                        </DataTableRow>
                    ))}
                    {filteredInvoices.length === 0 && (
                        <DataTableRow>
                            <DataTableCell className="text-center py-8" colSpan={8}>
                                {tableData.searchQuery || tableData.statusFilter.length > 0
                                    ? text.errors.noMatchingInvoices
                                    : text.invoices.empty}
                            </DataTableCell>
                        </DataTableRow>
                    )}
                </DataTableBody>
            </DataTable>
            <DataTableAddRow
                label={text.invoices.create}
                onClick={() => setNewInvoiceDialogOpen(true)}
            />

            {/* Bulk Action Toolbar */}
            <BulkActionToolbar
                selectedCount={bulkSelection.selectedCount}
                selectedIds={bulkSelection.selectedIds}
                onClearSelection={bulkSelection.clearSelection}
                actions={bulkActions}
            />
        </div>
    )
}
