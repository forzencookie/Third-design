"use client"

import { useState, useCallback, useMemo } from "react"
import {
    ArrowRightLeft,
    X,
    Plus,
    Banknote,
    Building2,
    Calendar,
    CheckCircle2,
    CreditCard,
    TrendingUp,
    TrendingDown,
    Clock,
    BookOpen,
} from "lucide-react"
import { cn, formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { SearchBar } from "@/components/ui/search-bar"
import { FilterButton } from "@/components/ui/filter-button"
import { TRANSACTION_STATUSES, type TransactionStatus, type Transaction, type TransactionWithAI } from "@/types"
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
    DataTable,
    DataTableHeader,
    DataTableHeaderCell,
    DataTableBody,
    DataTableAddRow
} from "@/components/ui/data-table"
import { StatCard, StatCardGrid } from "@/components/ui/stat-card"
import { SectionCard } from "@/components/ui/section-card"
import { BulkActionToolbar, type BulkAction } from "@/components/shared/bulk-action-toolbar"
import { useTableFilter, useTableSort, commonSortHandlers } from "@/hooks/use-table"
import { useTextMode } from "@/providers/text-mode-provider"

import {
    TransactionRow,
    NewTransactionDialog,
    TransactionsEmptyState,
} from "./components"
import { BookingDialog, type BookingData } from "./BookingDialog"
import { Checkbox } from "@/components/ui/checkbox"

// =============================================================================
// TransactionsTable
// =============================================================================

interface TransactionsTableProps {
    title?: string
    subtitle?: string
    transactions?: TransactionWithAI[]
    onTransactionBooked?: (transactionId: string, bookingData: BookingData) => void
}

export function TransactionsTable({
    title,
    subtitle,
    transactions = [],
    onTransactionBooked,
}: TransactionsTableProps) {
    const { text } = useTextMode()
    const [newTransactionDialogOpen, setNewTransactionDialogOpen] = useState(false)
    const [selectedTransactions, setSelectedTransactions] = useState<TransactionWithAI[]>([])
    const [bookingDialogOpen, setBookingDialogOpen] = useState(false)
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

    const filter = useTableFilter<TransactionWithAI>({
        searchFields: ["name", "account", "amount"],
        initialStatusFilter: []
    })

    const sort = useTableSort<TransactionWithAI>({
        initialSortBy: "date",
        initialSortOrder: "desc",
        sortHandlers: {
            date: commonSortHandlers.date,
            amount: commonSortHandlers.amount,
            name: (a, b) => a.name.localeCompare(b.name)
        }
    })

    const handleTransactionClick = useCallback((transaction: TransactionWithAI) => {
        // Toggle selection when clicking on a row
        setSelectedIds(prev => {
            const next = new Set(prev)
            if (next.has(transaction.id)) {
                next.delete(transaction.id)
            } else {
                next.add(transaction.id)
            }
            return next
        })
    }, [])

    const handleBook = useCallback(async (bookingData: BookingData) => {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500))

        // Call the parent callback with full booking data
        if (onTransactionBooked) {
            onTransactionBooked(bookingData.entityId, bookingData)
        }

        // Close dialog and clear selection
        setBookingDialogOpen(false)
        setSelectedTransactions([])
        setSelectedIds(new Set())
    }, [onTransactionBooked])

    const handleSortChange = useCallback((newSortBy: "date" | "amount" | "name") => {
        sort.toggleSort(newSortBy)
    }, [sort])

    const filteredTransactions = useMemo(() => {
        const filtered = filter.filterItems(transactions)
        return sort.sortItems(filtered)
    }, [transactions, filter, sort])

    const toggleSelection = useCallback((id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev)
            if (next.has(id)) {
                next.delete(id)
            } else {
                next.add(id)
            }
            return next
        })
    }, [])

    const toggleAll = useCallback(() => {
        if (selectedIds.size === filteredTransactions.length) {
            setSelectedIds(new Set())
        } else {
            setSelectedIds(new Set(filteredTransactions.map(t => t.id)))
        }
    }, [selectedIds, filteredTransactions])

    // Calculate stats for the stat cards
    const stats = useMemo(() => {
        const parseAmount = (amount: string | number) => {
            if (typeof amount === 'number') return amount
            const cleaned = amount.replace(/[^\d,.-]/g, '').replace(',', '.')
            return parseFloat(cleaned) || 0
        }

        const income = transactions
            .filter(t => parseAmount(t.amount) > 0)
            .reduce((sum, t) => sum + parseAmount(t.amount), 0)

        const expenses = transactions
            .filter(t => parseAmount(t.amount) < 0)
            .reduce((sum, t) => sum + Math.abs(parseAmount(t.amount)), 0)

        // Count both "Att bokföra" and "Saknar underlag" as pending review
        const pending = transactions.filter(t =>
            t.status === TRANSACTION_STATUSES.TO_RECORD ||
            t.status === TRANSACTION_STATUSES.MISSING_DOCUMENTATION
        ).length

        return { income, expenses, pending, total: transactions.length }
    }, [transactions])

    // Get transactions ready to book (have documentation)
    const transactionsToBook = useMemo(() =>
        transactions.filter(t => t.status === TRANSACTION_STATUSES.TO_RECORD),
        [transactions]
    )

    // Handle booking button click from bulk action
    const handleBulkBooking = useCallback((ids: string[]) => {
        const selected = transactions.filter(t => ids.includes(t.id))
        if (selected.length > 0) {
            setSelectedTransactions(selected)
            setBookingDialogOpen(true)
        }
    }, [transactions])

    // Bulk actions for the toolbar
    const bulkActions: BulkAction[] = useMemo(() => [
        {
            id: "book",
            label: "Bokför",
            icon: BookOpen,
            onClick: handleBulkBooking,
        },
    ], [handleBulkBooking])

    return (
        <div className="w-full space-y-6">
            <StatCardGrid columns={4}>
                <StatCard
                    label={text.stats.totalTransactions}
                    value={stats.total}
                    subtitle={text.stats.thisPeriod}
                    icon={ArrowRightLeft}
                />
                <StatCard
                    label={text.stats.income}
                    value={formatCurrency(stats.income)}
                    icon={TrendingUp}
                    changeType="positive"
                />
                <StatCard
                    label={text.stats.expenses}
                    value={formatCurrency(stats.expenses)}
                    icon={TrendingDown}
                    changeType="negative"
                />
                <StatCard
                    label={text.stats.pendingReview}
                    value={stats.pending}
                    icon={Clock}
                />
            </StatCardGrid>

            {/* Section Separator */}
            <div className="border-b-2 border-border/60" />

            <NewTransactionDialog
                open={newTransactionDialogOpen}
                onOpenChange={setNewTransactionDialogOpen}
            />

            <DataTable
                title={title || text.transactions.allTransactions}
                headerActions={
                    <div className="flex items-center gap-2">
                        <SearchBar
                            placeholder={text.transactions.search}
                            value={filter.searchQuery}
                            onChange={filter.setSearchQuery}
                        />
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <FilterButton
                                    label={text.actions.filter}
                                    isActive={filter.statusFilter.length > 0}
                                    activeCount={filter.statusFilter.length}
                                />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>{text.labels.filterByStatus}</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {Object.values(TRANSACTION_STATUSES).map((status) => (
                                    <DropdownMenuCheckboxItem
                                        key={status}
                                        checked={filter.statusFilter.includes(status)}
                                        onCheckedChange={() => filter.toggleStatusFilter(status)}
                                    >
                                        {status}
                                    </DropdownMenuCheckboxItem>
                                ))}
                                {filter.statusFilter.length > 0 && (
                                    <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => filter.setStatusFilter([])}>
                                            <X className="h-3.5 w-3.5 mr-2" />
                                            {text.actions.clearFilter}
                                        </DropdownMenuItem>
                                    </>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuLabel>{text.labels.sortBy}</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleSortChange("date")}>
                                    {text.labels.date} {sort.sortBy === "date" && (sort.sortOrder === "asc" ? "↑" : "↓")}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleSortChange("amount")}>
                                    {text.labels.amount} {sort.sortBy === "amount" && (sort.sortOrder === "asc" ? "↑" : "↓")}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleSortChange("name")}>
                                    {text.labels.name} {sort.sortBy === "name" && (sort.sortOrder === "asc" ? "↑" : "↓")}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button size="sm" className="h-8 gap-1" onClick={() => setNewTransactionDialogOpen(true)}>
                            <Plus className="h-3.5 w-3.5" />
                            {text.actions.new}
                        </Button>
                    </div>
                }
            >
                <DataTableHeader>
                    <DataTableHeaderCell className="w-10">
                        <Checkbox
                            checked={selectedIds.size === filteredTransactions.length && filteredTransactions.length > 0}
                            onCheckedChange={toggleAll}
                        />
                    </DataTableHeaderCell>
                    <DataTableHeaderCell icon={Building2} label={text.labels.supplier} />
                    <DataTableHeaderCell icon={Calendar} label={text.labels.date} />
                    <DataTableHeaderCell icon={Banknote} label={text.labels.amount} />
                    <DataTableHeaderCell icon={CheckCircle2} label={text.labels.status} />
                    <DataTableHeaderCell icon={CreditCard} label={text.labels.account} />
                </DataTableHeader>
                <DataTableBody>
                    {filteredTransactions.map((transaction) => (
                        <TransactionRow
                            key={transaction.id}
                            transaction={transaction}
                            onClick={() => handleTransactionClick(transaction)}
                            selected={selectedIds.has(transaction.id)}
                            onToggleSelection={() => toggleSelection(transaction.id)}
                        />
                    ))}
                    {filteredTransactions.length === 0 && (
                        <TransactionsEmptyState
                            hasFilters={filter.hasActiveFilters}
                            onAddTransaction={() => setNewTransactionDialogOpen(true)}
                        />
                    )}
                </DataTableBody>
            </DataTable>
            <DataTableAddRow
                label={text.transactions.newTransaction}
                onClick={() => setNewTransactionDialogOpen(true)}
            />

            {/* Bulk Action Toolbar - appears when items are selected */}
            <BulkActionToolbar
                selectedCount={selectedIds.size}
                selectedIds={Array.from(selectedIds)}
                onClearSelection={() => setSelectedIds(new Set())}
                actions={bulkActions}
            />

            {/* Booking Dialog */}
            <BookingDialog
                open={bookingDialogOpen}
                onOpenChange={setBookingDialogOpen}
                entity={selectedTransactions[0] ? {
                    id: selectedTransactions[0].id,
                    name: selectedTransactions[0].name,
                    date: selectedTransactions[0].date,
                    amount: selectedTransactions[0].amount,
                    type: 'transaction',
                    status: selectedTransactions[0].status,
                    account: selectedTransactions[0].account,
                    category: selectedTransactions[0].category
                } : null}
                onBook={handleBook}
            />
        </div>
    )
}
