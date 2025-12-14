"use client"

import * as React from "react"
import { useState, useMemo, useEffect, useCallback } from "react"
import {
    Calendar,
    Search,
    SlidersHorizontal,
    Tag,
    FileText,
    Paperclip,
    MoreHorizontal,
    UploadCloud,
    Building2,
    X,
    Banknote,
    CheckCircle2,
    Clock,
    Link2,
} from "lucide-react"
import { cn, parseAmount, formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group"
import { CategoryBadge, AmountText } from "../table/table-shell"
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
import { UploadDropzone } from "@/components/ui/upload-dropzone"
import { DialogBody, DetailsGrid } from "@/components/ui/field-grid"
import { AppStatusBadge } from "@/components/ui/status-badge"
import {
    type ReceiptStatus,
    RECEIPT_STATUSES
} from "@/lib/status-types"
import { type Receipt, mockReceipts } from "@/data/receipts"
import { getReceiptIconForCategory, getReceiptIconColorForCategory } from "@/services/receipt-processor"
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
import { useToast } from "@/components/ui/toast"
import { Checkbox } from "@/components/ui/checkbox"
import { BulkActionToolbar, useBulkSelection, type BulkAction } from "../shared/bulk-action-toolbar"
import { Trash2, Download, Archive } from "lucide-react"

// Sort handlers specific to receipts
const receiptSortHandlers = {
    date: commonSortHandlers.date as (a: Receipt, b: Receipt) => number,
    amount: commonSortHandlers.amount as (a: Receipt, b: Receipt) => number,
}

export function ReceiptsTable() {
    const { text } = useTextMode()
    const [receipts, setReceipts] = useState<Receipt[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
    const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null)
    const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [receiptToDelete, setReceiptToDelete] = useState<string | null>(null)

    // Toast notifications
    const toast = useToast()

    // Fetch receipts from API
    const fetchReceipts = useCallback(async () => {
        try {
            const response = await fetch('/api/receipts/processed', { cache: 'no-store' })
            const data = await response.json()

            if (data.receipts && data.receipts.length > 0) {
                // Map processed receipts to Receipt type
                const mappedReceipts: Receipt[] = data.receipts.map((r: Record<string, unknown>) => ({
                    id: r.id as string,
                    supplier: r.supplier as string,
                    date: r.date as string,
                    amount: r.amount as string,
                    category: r.category as string,
                    status: r.status as string,
                    hasAttachment: r.hasAttachment as boolean,
                    attachmentUrl: r.attachmentUrl as string | undefined,
                    linkedTransaction: r.linkedTransaction as string | undefined,
                }))
                setReceipts(mappedReceipts)
            } else {
                // Fall back to mock data if no API data
                setReceipts(mockReceipts)
            }
        } catch (error) {
            console.error('Failed to fetch receipts:', error)
            setReceipts(mockReceipts)
        } finally {
            setIsLoading(false)
        }
    }, [])

    // Initial fetch and auto-refresh
    useEffect(() => {
        fetchReceipts()
        // const interval = setInterval(fetchReceipts, 5000)
        // return () => clearInterval(interval)
    }, [fetchReceipts])

    // Use the unified table data hook for filtering and sorting
    const tableData = useTableData<Receipt>({
        filter: {
            searchFields: ['supplier', 'category'],
        },
        sort: {
            initialSortBy: 'date',
            initialSortOrder: 'desc',
            sortHandlers: receiptSortHandlers,
        },
    })

    // Process receipts through filter and sort
    const filteredReceipts = useMemo(() =>
        tableData.processItems(receipts),
        [tableData, receipts]
    )

    // Calculate stats for stat cards
    const stats = useMemo(() => {
        const matched = receipts.filter(r => r.status === RECEIPT_STATUSES.VERIFIED || r.status === RECEIPT_STATUSES.PROCESSED)
        const unmatched = receipts.filter(r => r.status === RECEIPT_STATUSES.PENDING || r.status === RECEIPT_STATUSES.PROCESSING || r.status === RECEIPT_STATUSES.REVIEW_NEEDED)
        const totalAmount = receipts.reduce((sum, r) => sum + parseAmount(r.amount), 0)

        return {
            total: receipts.length,
            matchedCount: matched.length,
            unmatchedCount: unmatched.length,
            totalAmount
        }
    }, [receipts])

    // Bulk selection
    const bulkSelection = useBulkSelection(filteredReceipts)

    const bulkActions: BulkAction[] = useMemo(() => [
        {
            id: "delete",
            label: text.actions.delete,
            icon: Trash2,
            variant: "destructive",
            onClick: (ids) => {
                setReceipts(prev => prev.filter(r => !ids.includes(r.id)))
                toast.success(text.receipts.receiptsDeleted, `${ids.length} ${text.receipts.receiptsDeletedDesc}`)
                bulkSelection.clearSelection()
            },
        },
        {
            id: "archive",
            label: text.actions.archive,
            icon: Archive,
            onClick: (ids) => {
                toast.success(text.receipts.receiptsArchived, `${ids.length} ${text.receipts.receiptsArchivedDesc}`)
                bulkSelection.clearSelection()
            },
        },
        {
            id: "download",
            label: text.actions.download,
            icon: Download,
            onClick: (ids) => {
                toast.info(text.actions.downloading, `${text.receipts.preparingDownload} ${ids.length} ${text.receipts.receipts}...`)
                bulkSelection.clearSelection()
            },
        },
    ], [toast, bulkSelection, text])

    const handleDeleteClick = (id: string) => {
        setReceiptToDelete(id)
        setDeleteDialogOpen(true)
    }

    const handleConfirmDelete = () => {
        if (receiptToDelete) {
            const receipt = receipts.find(r => r.id === receiptToDelete)
            setReceipts(prev => prev.filter(r => r.id !== receiptToDelete))
            toast.success("Underlag raderat", `${receipt?.supplier || 'Underlaget'} har raderats`)
        }
        setDeleteDialogOpen(false)
        setReceiptToDelete(null)
    }

    const handleViewDetails = (receipt: Receipt) => {
        setSelectedReceipt(receipt)
        setDetailsDialogOpen(true)
    }

    return (
        <div className="w-full space-y-6">
            {/* Stats Cards */}
            <StatCardGrid columns={4}>
                <StatCard
                    label={text.receipts.totalReceipts}
                    value={stats.total}
                    subtitle={text.receipts.allReceipts}
                    icon={FileText}
                />
                <StatCard
                    label={text.receipts.matchedReceipts}
                    value={stats.matchedCount}
                    subtitle={text.receipts.linkedToTransaction}
                    icon={Link2}
                    changeType="positive"
                />
                <StatCard
                    label={text.receipts.unmatchedReceipts}
                    value={stats.unmatchedCount}
                    subtitle={text.stats.needsAttention}
                    icon={Clock}
                    changeType={stats.unmatchedCount > 0 ? "negative" : "neutral"}
                />
                <StatCard
                    label={text.receipts.totalAmount}
                    value={formatCurrency(stats.totalAmount)}
                    icon={Banknote}
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

            {/* Upload Dialog */}
            <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{text.receipts.uploadReceipt}</DialogTitle>
                    </DialogHeader>
                    <UploadDropzone
                        accept=".pdf,.jpg,.jpeg,.png"
                        maxSize={10 * 1024 * 1024}
                        title="Dra och släpp filer här"
                        description="PDF, JPG, PNG upp till 10MB"
                        buttonText={text.actions.select}
                        onFilesSelected={(files) => {
                            // Create a new receipt from uploaded file
                            const file = files[0]
                            const newReceipt: Receipt = {
                                id: `REC-${String(receipts.length + 1).padStart(4, '0')}`,
                                supplier: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
                                date: new Date().toISOString().split('T')[0],
                                amount: '0.00 kr', // Will be extracted by AI/OCR later
                                category: 'Övriga kostnader',
                                status: RECEIPT_STATUSES.PROCESSING,
                                attachment: file.name,
                            }
                            setReceipts(prev => [newReceipt, ...prev])
                            setUploadDialogOpen(false)
                            toast.success("Underlag uppladdat",
                                `${file.name} laddades upp och bearbetas`)
                        }}
                    />
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">{text.actions.cancel}</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Details Dialog */}
            <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{text.receipts.details}</DialogTitle>
                    </DialogHeader>
                    {selectedReceipt && (
                        <DialogBody>
                            <DetailsGrid
                                items={[
                                    { label: text.receipts.supplier, value: selectedReceipt.supplier },
                                    { label: text.labels.date, value: selectedReceipt.date },
                                    { label: text.labels.amount, value: selectedReceipt.amount },
                                    { label: text.receipts.category, value: selectedReceipt.category },
                                    { label: text.labels.status, value: <AppStatusBadge status={selectedReceipt.status} /> },
                                    {
                                        label: text.receipts.hasAttachment, value: (
                                            <span className="font-medium text-primary cursor-pointer hover:underline">
                                                {selectedReceipt.attachment}
                                            </span>
                                        )
                                    },
                                ]}
                            />
                        </DialogBody>
                    )}
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">{text.actions.close}</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Table */}
            <DataTable
                title={text.receipts.title}
                headerActions={
                    <div className="flex items-center gap-2">
                        <InputGroup className="w-56">
                            <InputGroupAddon>
                                <InputGroupText>
                                    <Search />
                                </InputGroupText>
                            </InputGroupAddon>
                            <InputGroupInput
                                placeholder={text.receipts.search}
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
                                {Object.values(RECEIPT_STATUSES).map((status) => (
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
                                <DropdownMenuItem onClick={() => tableData.toggleSort("date")}>
                                    {text.labels.date} {tableData.getSortIndicator("date") === "asc" ? "↑" : tableData.getSortIndicator("date") === "desc" ? "↓" : ""}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => tableData.toggleSort("amount")}>
                                    {text.labels.amount} {tableData.getSortIndicator("amount") === "asc" ? "↑" : tableData.getSortIndicator("amount") === "desc" ? "↓" : ""}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => tableData.toggleSort("supplier")}>
                                    {text.receipts.supplier} {tableData.getSortIndicator("supplier") === "asc" ? "↑" : tableData.getSortIndicator("supplier") === "desc" ? "↓" : ""}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button size="sm" className="h-8 gap-1" onClick={() => setUploadDialogOpen(true)}>
                            <UploadCloud className="h-3.5 w-3.5" />
                            {text.actions.upload}
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
                    <DataTableHeaderCell label={text.receipts.supplier} icon={Building2} />
                    <DataTableHeaderCell label={text.labels.date} icon={Calendar} />
                    <DataTableHeaderCell label={text.receipts.category} icon={Tag} />
                    <DataTableHeaderCell label={text.labels.amount} icon={Banknote} />
                    <DataTableHeaderCell label={text.labels.status} icon={CheckCircle2} />
                    <DataTableHeaderCell label={text.receipts.hasAttachment} icon={Paperclip} />
                    <DataTableHeaderCell label="" align="right" />
                </DataTableHeader>
                <DataTableBody>
                    {filteredReceipts.map((receipt) => (
                        <DataTableRow
                            key={receipt.id}
                            selected={bulkSelection.isSelected(receipt.id)}
                            className="group"
                        >
                            <DataTableCell>
                                <Checkbox
                                    checked={bulkSelection.isSelected(receipt.id)}
                                    onCheckedChange={() => bulkSelection.toggleItem(receipt.id)}
                                    aria-label={`${text.actions.select} ${receipt.supplier}`}
                                />
                            </DataTableCell>
                            <DataTableCell bold>{receipt.supplier}</DataTableCell>
                            <DataTableCell muted>{receipt.date}</DataTableCell>
                            <DataTableCell>
                                <CategoryBadge
                                    iconName={getReceiptIconForCategory(receipt.category)}
                                    iconColor={getReceiptIconColorForCategory(receipt.category)}
                                >
                                    {receipt.category}
                                </CategoryBadge>
                            </DataTableCell>
                            <DataTableCell align="right">
                                <AmountText value={parseAmount(receipt.amount)} />
                            </DataTableCell>
                            <DataTableCell>
                                <AppStatusBadge
                                    status={receipt.status}
                                    size="sm"
                                />
                            </DataTableCell>
                            <DataTableCell muted>
                                <div className="flex items-center gap-2 hover:text-foreground cursor-pointer transition-colors">
                                    <span className="text-xs truncate max-w-[100px]">{receipt.attachment}</span>
                                </div>
                            </DataTableCell>
                            <DataTableCell align="right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity" >
                                            <span className="sr-only">{text.actions.openMenu}</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>{text.labels.actions}</DropdownMenuLabel>
                                        <DropdownMenuItem onClick={() => handleViewDetails(receipt)}>
                                            {text.actions.viewDetails}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleViewDetails(receipt)}>
                                            {text.actions.edit}
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteClick(receipt.id)}>
                                            {text.actions.delete}
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </DataTableCell>
                        </DataTableRow>
                    ))}
                    {filteredReceipts.length === 0 && (
                        <DataTableRow>
                            <DataTableCell colSpan={8} className="text-center py-8">
                                {tableData.searchQuery || tableData.statusFilter.length > 0
                                    ? text.errors.noMatchingReceipts
                                    : text.receipts.empty}
                            </DataTableCell>
                        </DataTableRow>
                    )}
                </DataTableBody>
            </DataTable>
            <DataTableAddRow
                label={text.receipts.upload}
                onClick={() => setUploadDialogOpen(true)}
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
