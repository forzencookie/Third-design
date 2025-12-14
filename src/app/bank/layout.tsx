"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Landmark, CreditCard, ArrowLeftRight, LayoutDashboard, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"

export default function BankLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container max-w-6xl py-4 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/simulator" 
                className="flex items-center gap-2 text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm">Simulator</span>
              </Link>
              <div className="h-6 w-px bg-gray-200" />
              <div className="flex items-center gap-2">
                <Landmark className="h-5 w-5 text-emerald-600" />
                <h1 className="font-semibold">Företagsbank</h1>
              </div>
            </div>
            <Link
              href="/dashboard"
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <LayoutDashboard className="h-4 w-4" />
              Öppna Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Navigation tabs */}
      <div className="bg-white border-b">
        <div className="container max-w-6xl px-4">
          <nav className="flex gap-1">
            <Link
              href="/bank"
              className={cn(
                "px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                pathname === "/bank"
                  ? "border-emerald-600 text-emerald-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Konton
              </div>
            </Link>
            <Link
              href="/bank/transactions"
              className={cn(
                "px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                pathname === "/bank/transactions"
                  ? "border-emerald-600 text-emerald-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              <div className="flex items-center gap-2">
                <ArrowLeftRight className="h-4 w-4" />
                Transaktioner
              </div>
            </Link>
          </nav>
        </div>
      </div>

      {/* Content */}
      <main>{children}</main>
    </div>
  )
}
