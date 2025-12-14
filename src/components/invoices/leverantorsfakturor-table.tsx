"use client"

import * as React from "react"
import { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from "react"
import { formatCurrency, formatDate } from "@/lib/utils"
import {
  FileText,
  Calendar,
  Building2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  MoreHorizontal,
  Eye,
  Check,
  CreditCard,
  Download,
  Sparkles,
  Plus,
  Hash,
  Banknote,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { SearchBar } from "@/components/ui/search-bar"
import { FilterButton } from "@/components/ui/filter-button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { mockSupplierInvoices, type SupplierInvoice } from "@/data/ownership"
import { AppStatusBadge } from "@/components/ui/status-badge"
import { type SupplierInvoiceStatus } from "@/lib/status-types"
import {
  DataTable,
  DataTableHeader,
  DataTableHeaderCell,
  DataTableBody,
  DataTableRow,
  DataTableCell
} from "@/components/ui/data-table"
import { StatCard, StatCardGrid } from "@/components/ui/stat-card"
import { useTextMode } from "@/providers/text-mode-provider"

// Map status from API to internal status
const apiStatusToInternal: Record<string, SupplierInvoice['status']> = {
  'Mottagen': 'mottagen',
  'Attesterad': 'attesterad',
  'Betald': 'betald',
  'Förfallen': 'förfallen',
  'Tvist': 'tvist',
}

// Map internal status keys to display labels (using centralized status types)
const statusLabelMap: Record<SupplierInvoice['status'], SupplierInvoiceStatus> = {
  mottagen: 'Mottagen',
  attesterad: 'Attesterad',
  betald: 'Betald',
  förfallen: 'Förfallen',
  tvist: 'Tvist',
}

// Status configuration for dropdown menu
const statusConfig: Record<SupplierInvoice['status'], { icon: React.ElementType; label: SupplierInvoiceStatus }> = {
  mottagen: { icon: Clock, label: 'Mottagen' },
  attesterad: { icon: CheckCircle2, label: 'Attesterad' },
  betald: { icon: Check, label: 'Betald' },
  förfallen: { icon: AlertTriangle, label: 'Förfallen' },
  tvist: { icon: AlertTriangle, label: 'Tvist' },
}

// Ref handle type for parent component
export interface LeverantorsfakturorTableRef {
  refresh: () => void
}

export const LeverantorsfakturorTable = forwardRef<LeverantorsfakturorTableRef>(function LeverantorsfakturorTable(_, ref) {
  const { text } = useTextMode()
  const [invoices, setInvoices] = useState<SupplierInvoice[]>(mockSupplierInvoices)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [sortField, setSortField] = useState<'dueDate' | 'totalAmount' | 'supplierName'>('dueDate')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  // Fetch supplier invoices from API
  const fetchSupplierInvoices = useCallback(async () => {
    try {
      const response = await fetch('/api/supplier-invoices/processed', { cache: 'no-store' })
      const data = await response.json()

      if (data.invoices && data.invoices.length > 0) {
        const mapped: SupplierInvoice[] = data.invoices.map((inv: Record<string, unknown>) => ({
          id: inv.id as string,
          invoiceNumber: inv.invoiceNumber as string,
          supplierName: inv.supplier as string,
          totalAmount: inv.amount as number,
          invoiceDate: inv.date as string,
          dueDate: inv.dueDate as string,
          status: apiStatusToInternal[(inv.status as string)] || 'mottagen',
          category: inv.category as string,
          ocrNumber: inv.ocr as string,
          vatAmount: (inv.vatAmount as number) || 0,
          amount: ((inv.amount as number) || 0) - ((inv.vatAmount as number) || 0),
          currency: (inv.currency as 'SEK' | 'EUR' | 'USD') || 'SEK',
        }))
        setInvoices(mapped)
      } else {
        setInvoices(mockSupplierInvoices)
      }
    } catch {
      setInvoices(mockSupplierInvoices)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSupplierInvoices()
    // const interval = setInterval(fetchSupplierInvoices, 5000)
    // return () => clearInterval(interval)
  }, [fetchSupplierInvoices])

  // Expose refresh function to parent via ref
  useImperativeHandle(ref, () => ({
    refresh: fetchSupplierInvoices
  }), [fetchSupplierInvoices])

  // Filter and sort
  const filteredInvoices = React.useMemo(() => {
    let result = invoices

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(inv =>
        inv.supplierName.toLowerCase().includes(query) ||
        inv.invoiceNumber.toLowerCase().includes(query) ||
        inv.category?.toLowerCase().includes(query)
      )
    }

    // Status filter
    if (statusFilter) {
      result = result.filter(inv => inv.status === statusFilter)
    }

    // Sort
    result = [...result].sort((a, b) => {
      let comparison = 0
      if (sortField === 'dueDate') {
        comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      } else if (sortField === 'totalAmount') {
        comparison = a.totalAmount - b.totalAmount
      } else if (sortField === 'supplierName') {
        comparison = a.supplierName.localeCompare(b.supplierName)
      }
      return sortDir === 'asc' ? comparison : -comparison
    })

    return result
  }, [invoices, searchQuery, statusFilter, sortField, sortDir])

  // Stats
  const stats = React.useMemo(() => {
    const unpaid = invoices.filter(i => i.status !== 'betald')
    const overdue = invoices.filter(i => i.status === 'förfallen')
    const toApprove = invoices.filter(i => i.status === 'mottagen')

    return {
      totalUnpaid: unpaid.reduce((sum, i) => sum + i.totalAmount, 0),
      overdueAmount: overdue.reduce((sum, i) => sum + i.totalAmount, 0),
      overdueCount: overdue.length,
      toApproveCount: toApprove.length,
    }
  }, [invoices])

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredInvoices.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredInvoices.map(i => i.id)))
    }
  }

  const updateStatus = (id: string, status: SupplierInvoice['status']) => {
    setInvoices(prev => prev.map(inv =>
      inv.id === id ? { ...inv, status } : inv
    ))
  }

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <StatCardGrid columns={4}>
        <StatCard
          label={text.supplierInvoices.unpaid}
          value={formatCurrency(stats.totalUnpaid)}
          icon={FileText}
        />
        <StatCard
          label={text.supplierInvoices.overdueAmount}
          value={formatCurrency(stats.overdueAmount)}
          subtitle={`${stats.overdueCount} ${text.supplierInvoices.invoices}`}
          icon={AlertTriangle}
        />
        <StatCard
          label={text.supplierInvoices.toApprove}
          value={stats.toApproveCount.toString()}
          subtitle={text.supplierInvoices.invoices}
          icon={Clock}
        />
        <StatCard
          label={text.supplierInvoices.aiMatched}
          value="3"
          subtitle={`${text.supplierInvoices.ofReceived} 4`}
          icon={Sparkles}
        />
      </StatCardGrid>

      {/* Section Separator */}
      <div className="border-b-2 border-border/60" />

      {/* Table */}
      <DataTable
        title={text.supplierInvoices.title}
        headerActions={
          <>
            <SearchBar
              placeholder={text.supplierInvoices.search}
              value={searchQuery}
              onChange={setSearchQuery}
              className="w-64"
            />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <FilterButton
                  label={text.actions.filter}
                  isActive={!!statusFilter}
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">{text.labels.status}</div>
                <DropdownMenuItem onClick={() => setStatusFilter(null)}>
                  {text.actions.selectAll}
                </DropdownMenuItem>
                {Object.entries(statusConfig).map(([status, config]) => (
                  <DropdownMenuItem key={status} onClick={() => setStatusFilter(status)}>
                    <config.icon className="h-4 w-4 mr-2" />
                    {config.label}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">{text.labels.sortBy}</div>
                <DropdownMenuItem onClick={() => toggleSort('dueDate')}>
                  {text.supplierInvoices.dueDate} {sortField === 'dueDate' && (sortDir === 'asc' ? '↑' : '↓')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toggleSort('totalAmount')}>
                  {text.labels.amount} {sortField === 'totalAmount' && (sortDir === 'asc' ? '↑' : '↓')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toggleSort('supplierName')}>
                  {text.supplierInvoices.supplier} {sortField === 'supplierName' && (sortDir === 'asc' ? '↑' : '↓')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {selectedIds.size > 0 ? (
              <>
                <Button variant="outline" size="sm" className="h-8" onClick={() => {
                  selectedIds.forEach(id => updateStatus(id, 'attesterad'))
                  setSelectedIds(new Set())
                }}>
                  <Check className="h-4 w-4 mr-2" />
                  {text.supplierInvoices.approve} ({selectedIds.size})
                </Button>
                <Button variant="outline" size="sm" className="h-8">
                  <CreditCard className="h-4 w-4 mr-2" />
                  {text.supplierInvoices.pay}
                </Button>
              </>
            ) : (
              <Button size="sm" className="h-8">
                <Plus className="h-4 w-4 mr-2" />
                {text.actions.new}
              </Button>
            )}
          </>
        }
      >
        <DataTableHeader>
          <th className="w-10 px-4 py-3">
            <Checkbox
              checked={selectedIds.size === filteredInvoices.length && filteredInvoices.length > 0}
              onCheckedChange={toggleSelectAll}
            />
          </th>
          <DataTableHeaderCell
            label={text.supplierInvoices.supplier}
            icon={Building2}
          />
          <DataTableHeaderCell label={text.supplierInvoices.invoiceNumber} icon={Hash} />
          <DataTableHeaderCell
            label={text.supplierInvoices.dueDate}
            icon={Clock}
          />
          <DataTableHeaderCell
            label={text.labels.amount}
            icon={Banknote}
          />
          <DataTableHeaderCell label={text.labels.status} icon={CheckCircle2} />
          <DataTableHeaderCell label="" />
        </DataTableHeader>
        <DataTableBody>
          {filteredInvoices.map((invoice) => {
            const statusLabel = statusLabelMap[invoice.status]
            const isOverdue = invoice.status === 'förfallen'

            return (
              <DataTableRow
                key={invoice.id}
                selected={selectedIds.has(invoice.id)}
              >
                <DataTableCell>
                  <Checkbox
                    checked={selectedIds.has(invoice.id)}
                    onCheckedChange={() => toggleSelect(invoice.id)}
                  />
                </DataTableCell>
                <DataTableCell bold>
                  <div>
                    <div className="font-medium">{invoice.supplierName}</div>
                    {invoice.category && (
                      <div className="text-xs text-muted-foreground">{invoice.category}</div>
                    )}
                  </div>
                </DataTableCell>
                <DataTableCell>
                  <span className="tabular-nums text-sm">{invoice.invoiceNumber}</span>
                </DataTableCell>
                <DataTableCell>
                  <span className={cn(isOverdue && "text-red-600 dark:text-red-500/70 font-medium")}>
                    {formatDate(invoice.dueDate)}
                  </span>
                </DataTableCell>
                <DataTableCell>
                  <div>
                    <div className="font-medium">{formatCurrency(invoice.totalAmount)}</div>
                    <div className="text-xs text-muted-foreground">
                      {text.bookkeeping.vat} {formatCurrency(invoice.vatAmount)}
                    </div>
                  </div>
                </DataTableCell>
                <DataTableCell>
                  <AppStatusBadge status={statusLabel} />
                </DataTableCell>
                <DataTableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="h-4 w-4 mr-2" />
                        {text.actions.viewDetails}
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="h-4 w-4 mr-2" />
                        {text.actions.download}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {invoice.status === 'mottagen' && (
                        <DropdownMenuItem onClick={() => updateStatus(invoice.id, 'attesterad')}>
                          <Check className="h-4 w-4 mr-2" />
                          {text.supplierInvoices.approve}
                        </DropdownMenuItem>
                      )}
                      {invoice.status === 'attesterad' && (
                        <DropdownMenuItem onClick={() => updateStatus(invoice.id, 'betald')}>
                          <CreditCard className="h-4 w-4 mr-2" />
                          {text.supplierInvoices.markAsPaid}
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </DataTableCell>
              </DataTableRow>
            )
          })}
        </DataTableBody>
      </DataTable>

      {filteredInvoices.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>{text.supplierInvoices.empty}</p>
        </div>
      )}
    </div>
  )
})
