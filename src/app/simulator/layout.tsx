/**
 * Simulator Layout
 * 
 * Forces light mode for the simulator pages
 * Separate from the main app layout
 */

import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Transaction Simulator | Dev Tools",
  description: "Developer tool for simulating bank transactions",
}

export default function SimulatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-white text-gray-900 light">
      <style>{`
        /* Force light mode for simulator */
        :root {
          color-scheme: light;
        }
        .simulator-container * {
          --background: 0 0% 100%;
          --foreground: 222.2 84% 4.9%;
          --card: 0 0% 100%;
          --card-foreground: 222.2 84% 4.9%;
          --popover: 0 0% 100%;
          --popover-foreground: 222.2 84% 4.9%;
          --primary: 222.2 47.4% 11.2%;
          --primary-foreground: 210 40% 98%;
          --secondary: 210 40% 96%;
          --secondary-foreground: 222.2 47.4% 11.2%;
          --muted: 210 40% 96%;
          --muted-foreground: 215.4 16.3% 46.9%;
          --accent: 210 40% 96%;
          --accent-foreground: 222.2 47.4% 11.2%;
          --destructive: 0 84.2% 60.2%;
          --destructive-foreground: 210 40% 98%;
          --border: 214.3 31.8% 91.4%;
          --input: 214.3 31.8% 91.4%;
          --ring: 222.2 84% 4.9%;
        }
      `}</style>
      <div className="simulator-container">
        {/* Dev Tools Header */}
        <header className="border-b bg-amber-50 px-6 py-3">
          <div className="container max-w-5xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">🧪</span>
              <span className="font-semibold text-amber-800">Dev Tools</span>
              <span className="text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">
                Test Environment
              </span>
            </div>
            <div className="flex items-center gap-4">
              <nav className="flex items-center gap-1">
                <a 
                  href="/simulator" 
                  className="text-sm px-3 py-1.5 rounded-md hover:bg-amber-100 text-amber-700"
                >
                  💳 Transaktioner
                </a>
                <a 
                  href="/bank" 
                  className="text-sm px-3 py-1.5 rounded-md hover:bg-amber-100 text-amber-700"
                >
                  🏦 Bank
                </a>
                <a 
                  href="/myndigheter" 
                  className="text-sm px-3 py-1.5 rounded-md hover:bg-amber-100 text-amber-700"
                >
                  🏛️ Myndigheter
                </a>
              </nav>
              <a 
                href="/dashboard" 
                className="text-sm text-amber-700 hover:text-amber-900 underline"
              >
                ← Back to App
              </a>
            </div>
          </div>
        </header>
        
        {/* Main Content */}
        <main>
          {children}
        </main>
      </div>
    </div>
  )
}
