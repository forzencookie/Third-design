"use client"

import { useState, useEffect } from "react"
import {
  CreditCard,
  Wallet,
  Building2,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  ArrowUpRight,
  ArrowDownLeft,
  RotateCcw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import {
  getBalances,
  getNakedTransactions,
  resetBank,
  type BankBalances,
} from "@/services/bank-transaction-service"
import type { NakedBankTransaction } from "@/types/bank"

export default function BankPage() {
  const [balances, setBalances] = useState<BankBalances>({
    foretagskonto: 0,
    sparkonto: 0,
    skattekonto: 0,
  })
  const [transactions, setTransactions] = useState<NakedBankTransaction[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadData = () => {
    setBalances(getBalances())
    setTransactions(getNakedTransactions().slice(0, 5)) // Last 5 transactions
    setIsLoading(false)
  }

  useEffect(() => {
    loadData()
    // Poll for updates every 2 seconds
    // const interval = setInterval(loadData, 2000)
    // return () => clearInterval(interval)
  }, [])

  const handleReset = () => {
    resetBank()
    loadData()
  }

  const totalBalance = balances.foretagskonto + balances.sparkonto + balances.skattekonto

  // Calculate today's transactions
  const today = new Date().toISOString().split('T')[0]
  const todayTransactions = transactions.filter(t => t.timestamp.startsWith(today))
  const todayIncome = todayTransactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0)
  const todayExpense = todayTransactions
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-2">💳 Företagsbank</h1>
          <p className="text-gray-600">
            Simulerad bankvy - transaktioner från Dashboard visas här.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleReset}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Återställ
        </Button>
      </div>

      {/* Total Balance */}
      <Card className="mb-6 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0">
        <CardContent className="py-6">
          <p className="text-emerald-100 text-sm mb-1">Totalt saldo</p>
          <p className="text-3xl font-bold">{totalBalance.toLocaleString('sv-SE')} kr</p>
          <div className="flex gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <ArrowDownLeft className="h-4 w-4 text-emerald-200" />
              <span>Idag: +{todayIncome.toLocaleString('sv-SE')} kr</span>
            </div>
            <div className="flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4 text-emerald-200" />
              <span>Idag: -{todayExpense.toLocaleString('sv-SE')} kr</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <AccountCard
          title="Företagskonto"
          balance={balances.foretagskonto}
          icon={CreditCard}
          color="blue"
          description="Huvudkonto för daglig verksamhet"
        />
        <AccountCard
          title="Sparkonto"
          balance={balances.sparkonto}
          icon={Wallet}
          color="purple"
          description="Företagets buffert"
        />
        <AccountCard
          title="Skattekonto"
          balance={balances.skattekonto}
          icon={Building2}
          color="amber"
          description="Reserverat för skatt"
        />
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Senaste transaktioner</CardTitle>
          <a href="/bank/transactions" className="text-sm text-blue-600 hover:underline">
            Visa alla →
          </a>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              <p>Inga transaktioner ännu</p>
              <p className="text-sm mt-1">
                Transaktioner från Dashboard visas här automatiskt.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <TransactionRow key={transaction.id} transaction={transaction} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg text-sm text-blue-700">
        <p className="font-medium mb-1">💡 Dataflöde</p>
        <p>
          <strong>Simulator</strong> → skapar nakna transaktioner (som en riktig bank) →
          <strong> Bankkonto</strong> → lagrar transaktioner →
          <strong> Dashboard</strong> → hämtar och bokför med AI-kategorisering.
        </p>
      </div>
    </div>
  )
}

// Account Card Component
function AccountCard({
  title,
  balance,
  icon: Icon,
  color,
  description,
}: {
  title: string
  balance: number
  icon: typeof CreditCard
  color: 'blue' | 'purple' | 'amber'
  description: string
}) {
  const colorStyles = {
    blue: { bg: 'bg-blue-100', text: 'text-blue-600', icon: 'text-blue-600' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600', icon: 'text-purple-600' },
    amber: { bg: 'bg-amber-100', text: 'text-amber-600', icon: 'text-amber-600' },
  }

  const styles = colorStyles[color]

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-4">
          <div className={cn("p-2 rounded-lg", styles.bg)}>
            <Icon className={cn("h-5 w-5", styles.icon)} />
          </div>
          {balance >= 0 ? (
            <TrendingUp className="h-5 w-5 text-green-500" />
          ) : (
            <TrendingDown className="h-5 w-5 text-red-500" />
          )}
        </div>
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <p className={cn("text-xl font-bold", balance < 0 && "text-red-600")}>
          {balance.toLocaleString('sv-SE')} kr
        </p>
        <p className="text-xs text-gray-400 mt-2">{description}</p>
      </CardContent>
    </Card>
  )
}

// Transaction Row Component
function TransactionRow({ transaction }: { transaction: NakedBankTransaction }) {
  const isOutgoing = transaction.amount < 0
  const displayAmount = transaction.amount

  return (
    <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50">
      <div className={cn(
        "h-10 w-10 rounded-full flex items-center justify-center",
        isOutgoing ? "bg-red-100" : "bg-green-100"
      )}>
        {isOutgoing ? (
          <ArrowUpRight className="h-5 w-5 text-red-600" />
        ) : (
          <ArrowDownLeft className="h-5 w-5 text-green-600" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{transaction.description}</p>
        <p className="text-sm text-gray-500">
          {new Date(transaction.timestamp).toLocaleString('sv-SE', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
          {transaction.reference && ` • Ref: ${transaction.reference}`}
        </p>
      </div>
      <div className="text-right">
        <p className={cn(
          "font-semibold",
          isOutgoing ? "text-red-600" : "text-green-600"
        )}>
          {displayAmount > 0 ? '+' : ''}{displayAmount.toLocaleString('sv-SE')} kr
        </p>
        {transaction.balanceAfter !== undefined && (
          <p className="text-xs text-gray-400">
            Saldo: {transaction.balanceAfter.toLocaleString('sv-SE')} kr
          </p>
        )}
      </div>
    </div>
  )
}
