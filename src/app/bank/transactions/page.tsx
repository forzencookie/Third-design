"use client"

import { useState, useEffect, useCallback } from "react"
import {
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  Filter,
  Trash2,
  Download,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

// Types from Bank API
interface BankTransaction {
  id: string
  description: string
  amount: number
  date: string
  timestamp: string
  account: string
  balance: number
  reference?: string
  counterparty?: string
  type: string
  status: string
}

interface BankBalances {
  foretagskonto: number
  sparkonto: number
  skattekonto: number
}

// Helper functions
function getAccountLabel(account: string): string {
  const labels: Record<string, string> = {
    foretagskonto: 'Företagskonto',
    sparkonto: 'Sparkonto',
    skattekonto: 'Skattekonto',
  }
  return labels[account] || account
}

function getTransactionTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    payment: 'Betalning',
    deposit: 'Insättning',
    transfer: 'Överföring',
    withdrawal: 'Uttag',
    fee: 'Avgift',
  }
  return labels[type] || type
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<BankTransaction[]>([])
  const [balances, setBalances] = useState<BankBalances>({ foretagskonto: 0, sparkonto: 0, skattekonto: 0 })
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)

  const loadData = useCallback(async () => {
    try {
      const response = await fetch('/api/bank')
      const data = await response.json()
      setTransactions(data.transactions || [])
      setBalances(data.balances || { foretagskonto: 0, sparkonto: 0, skattekonto: 0 })
    } catch (error) {
      console.error('Failed to fetch bank data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
    // const interval = setInterval(loadData, 3000)
    // return () => clearInterval(interval)
  }, [loadData])

  const handleClear = async () => {
    try {
      await fetch('/api/bank', { method: 'DELETE' })
      await loadData()
    } catch (error) {
      console.error('Failed to clear bank:', error)
    }
  }

  // Filter transactions
  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = searchQuery === '' ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.counterparty?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.reference?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesFilter = filterType === 'all' || t.type === filterType

    return matchesSearch && matchesFilter
  })

  // Group by date
  const groupedByDate = filteredTransactions.reduce((groups, transaction) => {
    const date = transaction.date
    if (!groups[date]) groups[date] = []
    groups[date].push(transaction)
    return groups
  }, {} as Record<string, BankTransaction[]>)

  // Calculate totals from amounts (positive = in, negative = out)
  const totalIn = filteredTransactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0)
  const totalOut = filteredTransactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)

  if (isLoading) {
    return (
      <div className="container max-w-5xl py-8 px-4">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-5xl py-8 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">📋 Transaktionshistorik</h1>
        <p className="text-gray-600">
          Alla transaktioner från Dashboard samlas här.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-gray-500">Antal transaktioner</p>
            <p className="text-2xl font-bold">{filteredTransactions.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-gray-500">Totalt in</p>
            <p className="text-2xl font-bold text-green-600">+{totalIn.toLocaleString('sv-SE')} kr</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-gray-500">Totalt ut</p>
            <p className="text-2xl font-bold text-red-600">-{totalOut.toLocaleString('sv-SE')} kr</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Sök transaktioner..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 border rounded-md text-sm"
        >
          <option value="all">Alla typer</option>
          <option value="payment">Betalningar</option>
          <option value="transfer">Överföringar</option>
          <option value="salary">Löner</option>
          <option value="tax">Skatt</option>
          <option value="deposit">Insättningar</option>
        </select>
        <Button variant="outline" size="sm" onClick={handleClear}>
          <Trash2 className="h-4 w-4 mr-2" />
          Rensa
        </Button>
      </div>

      {/* Transactions List */}
      {Object.keys(groupedByDate).length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            <p>Inga transaktioner hittades</p>
            <p className="text-sm mt-1">
              Transaktioner från Dashboard visas här automatiskt.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedByDate).map(([date, txns]) => (
            <div key={date}>
              <h3 className="text-sm font-medium text-gray-500 mb-3">{date}</h3>
              <Card>
                <CardContent className="divide-y">
                  {txns.map((transaction) => (
                    <TransactionDetail key={transaction.id} transaction={transaction} />
                  ))}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function TransactionDetail({ transaction }: { transaction: BankTransaction }) {
  const isOutgoing = transaction.amount < 0

  return (
    <div className="py-4 first:pt-0 last:pb-0">
      <div className="flex items-start gap-4">
        <div className={cn(
          "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
          isOutgoing ? "bg-red-100" : "bg-green-100"
        )}>
          {isOutgoing ? (
            <ArrowUpRight className="h-5 w-5 text-red-600" />
          ) : (
            <ArrowDownLeft className="h-5 w-5 text-green-600" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-4">
            <p className="font-medium">{transaction.description}</p>
            <div className="text-right shrink-0">
              <p className={cn(
                "font-semibold",
                isOutgoing ? "text-red-600" : "text-green-600"
              )}>
                {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString('sv-SE')} kr
              </p>
              <p className="text-xs text-gray-400">
                Saldo: {transaction.balance.toLocaleString('sv-SE')} kr
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-gray-500">
            <span>
              {new Date(transaction.timestamp).toLocaleTimeString('sv-SE', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
            <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">
              {getTransactionTypeLabel(transaction.type)}
            </span>
            <span className="px-2 py-0.5 bg-blue-50 rounded text-xs text-blue-700">
              {getAccountLabel(transaction.account)}
            </span>
          </div>

          <div className="flex gap-4 mt-2 text-xs text-gray-400">
            {transaction.counterparty && (
              <span>{isOutgoing ? 'Till' : 'Från'}: {transaction.counterparty}</span>
            )}
            {transaction.reference && (
              <span>Ref: {transaction.reference}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
