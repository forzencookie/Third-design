import { 
    Shield,
    Droplets,
    Scale,
    Percent,
    Users,
    Building2,
    Package,
    CreditCard,
    Plane,
    MoreHorizontal,
    type LucideIcon 
} from "lucide-react"
import type { ChartConfig } from "@/components/ui/chart"

// Swedish accounting term explanations
export const termExplanations: Record<string, string> = {
    "Soliditet": "Andel eget kapital i förhållande till totala tillgångar. Högre = stabilare ekonomi. Över 30% anses bra.",
    "Kassalikviditet": "Förmåga att betala kortfristiga skulder med likvida medel. Över 100% = kan täcka alla kortsiktiga skulder.",
    "Skuldsättningsgrad": "Skulder delat med eget kapital. Lägre = mindre finansiell risk.",
    "Vinstmarginal": "Resultat delat med omsättning i procent. Visar hur stor del av försäljningen som blir vinst.",
}

// Financial health KPIs
export interface FinancialKPI {
    label: string
    value: string
    change: string
    positive: boolean
    icon: LucideIcon
    subtitle: string
}

export const financialHealth: FinancialKPI[] = [
    { label: "Soliditet", value: "42%", change: "+3%", positive: true, icon: Shield, subtitle: "vs förra året" },
    { label: "Kassalikviditet", value: "156%", change: "-2%", positive: false, icon: Droplets, subtitle: "vs förra året" },
    { label: "Skuldsättningsgrad", value: "0,8", change: "-0,1", positive: true, icon: Scale, subtitle: "vs förra året" },
    { label: "Vinstmarginal", value: "20,5%", change: "+2,3%", positive: true, icon: Percent, subtitle: "vs förra året" },
]

// Transaction overview
export const transactionStats = {
    total: 156,
    recorded: 128,
    pending: 18,
    missingDocs: 10,
}

// Invoice overview
export const invoiceStats = {
    sent: 45,
    paid: 38,
    overdue: 4,
    draft: 3,
    totalValue: 485000,
    overdueValue: 52000,
}

// Expense categories
export interface ExpenseCategory {
    category: string
    amount: number
    percentage: number
    icon: LucideIcon
    color: string
}

export const expenseCategories: ExpenseCategory[] = [
    { category: "Personal", amount: 520000, percentage: 37, icon: Users, color: "bg-blue-500" },
    { category: "Lokalkostnader", amount: 180000, percentage: 13, icon: Building2, color: "bg-indigo-500" },
    { category: "Material & Varor", amount: 220000, percentage: 16, icon: Package, color: "bg-violet-500" },
    { category: "IT & Programvara", amount: 125000, percentage: 9, icon: CreditCard, color: "bg-purple-500" },
    { category: "Resor & Representation", amount: 95000, percentage: 7, icon: Plane, color: "bg-pink-500" },
    { category: "Övriga kostnader", amount: 260000, percentage: 18, icon: MoreHorizontal, color: "bg-slate-500" },
]

// Account balances
export const accounts = [
    { name: "Företagskonto", balance: 245000, change: "+12 500" },
    { name: "Skattekonto", balance: 38000, change: "-5 200" },
    { name: "Sparkonto", balance: 150000, change: "0" },
]

// Monthly revenue data (6 years)
export const monthlyRevenueData = [
    // 2019
    { month: "Jan 2019", intäkter: 85000, kostnader: 62000, resultat: 23000 },
    { month: "Feb 2019", intäkter: 88000, kostnader: 65000, resultat: 23000 },
    { month: "Mar 2019", intäkter: 92000, kostnader: 68000, resultat: 24000 },
    { month: "Apr 2019", intäkter: 90000, kostnader: 66000, resultat: 24000 },
    { month: "Maj 2019", intäkter: 95000, kostnader: 70000, resultat: 25000 },
    { month: "Jun 2019", intäkter: 98000, kostnader: 72000, resultat: 26000 },
    { month: "Jul 2019", intäkter: 88000, kostnader: 65000, resultat: 23000 },
    { month: "Aug 2019", intäkter: 92000, kostnader: 68000, resultat: 24000 },
    { month: "Sep 2019", intäkter: 100000, kostnader: 74000, resultat: 26000 },
    { month: "Okt 2019", intäkter: 105000, kostnader: 78000, resultat: 27000 },
    { month: "Nov 2019", intäkter: 108000, kostnader: 80000, resultat: 28000 },
    { month: "Dec 2019", intäkter: 112000, kostnader: 82000, resultat: 30000 },
    // 2020
    { month: "Jan 2020", intäkter: 95000, kostnader: 70000, resultat: 25000 },
    { month: "Feb 2020", intäkter: 98000, kostnader: 72000, resultat: 26000 },
    { month: "Mar 2020", intäkter: 75000, kostnader: 65000, resultat: 10000 },
    { month: "Apr 2020", intäkter: 68000, kostnader: 60000, resultat: 8000 },
    { month: "Maj 2020", intäkter: 72000, kostnader: 62000, resultat: 10000 },
    { month: "Jun 2020", intäkter: 85000, kostnader: 68000, resultat: 17000 },
    { month: "Jul 2020", intäkter: 92000, kostnader: 72000, resultat: 20000 },
    { month: "Aug 2020", intäkter: 98000, kostnader: 75000, resultat: 23000 },
    { month: "Sep 2020", intäkter: 105000, kostnader: 78000, resultat: 27000 },
    { month: "Okt 2020", intäkter: 110000, kostnader: 82000, resultat: 28000 },
    { month: "Nov 2020", intäkter: 115000, kostnader: 85000, resultat: 30000 },
    { month: "Dec 2020", intäkter: 120000, kostnader: 88000, resultat: 32000 },
    // 2021
    { month: "Jan 2021", intäkter: 100000, kostnader: 72000, resultat: 28000 },
    { month: "Feb 2021", intäkter: 108000, kostnader: 78000, resultat: 30000 },
    { month: "Mar 2021", intäkter: 115000, kostnader: 82000, resultat: 33000 },
    { month: "Apr 2021", intäkter: 112000, kostnader: 80000, resultat: 32000 },
    { month: "Maj 2021", intäkter: 125000, kostnader: 88000, resultat: 37000 },
    { month: "Jun 2021", intäkter: 135000, kostnader: 95000, resultat: 40000 },
    { month: "Jul 2021", intäkter: 118000, kostnader: 82000, resultat: 36000 },
    { month: "Aug 2021", intäkter: 128000, kostnader: 90000, resultat: 38000 },
    { month: "Sep 2021", intäkter: 142000, kostnader: 98000, resultat: 44000 },
    { month: "Okt 2021", intäkter: 150000, kostnader: 105000, resultat: 45000 },
    { month: "Nov 2021", intäkter: 158000, kostnader: 110000, resultat: 48000 },
    { month: "Dec 2021", intäkter: 165000, kostnader: 115000, resultat: 50000 },
    // 2022
    { month: "Jan 2022", intäkter: 108000, kostnader: 78000, resultat: 30000 },
    { month: "Feb 2022", intäkter: 118000, kostnader: 85000, resultat: 33000 },
    { month: "Mar 2022", intäkter: 128000, kostnader: 90000, resultat: 38000 },
    { month: "Apr 2022", intäkter: 125000, kostnader: 88000, resultat: 37000 },
    { month: "Maj 2022", intäkter: 140000, kostnader: 98000, resultat: 42000 },
    { month: "Jun 2022", intäkter: 152000, kostnader: 105000, resultat: 47000 },
    { month: "Jul 2022", intäkter: 135000, kostnader: 92000, resultat: 43000 },
    { month: "Aug 2022", intäkter: 145000, kostnader: 100000, resultat: 45000 },
    { month: "Sep 2022", intäkter: 160000, kostnader: 110000, resultat: 50000 },
    { month: "Okt 2022", intäkter: 170000, kostnader: 118000, resultat: 52000 },
    { month: "Nov 2022", intäkter: 178000, kostnader: 122000, resultat: 56000 },
    { month: "Dec 2022", intäkter: 188000, kostnader: 128000, resultat: 60000 },
    // 2023
    { month: "Jan 2023", intäkter: 115000, kostnader: 82000, resultat: 33000 },
    { month: "Feb 2023", intäkter: 125000, kostnader: 88000, resultat: 37000 },
    { month: "Mar 2023", intäkter: 138000, kostnader: 95000, resultat: 43000 },
    { month: "Apr 2023", intäkter: 135000, kostnader: 92000, resultat: 43000 },
    { month: "Maj 2023", intäkter: 155000, kostnader: 105000, resultat: 50000 },
    { month: "Jun 2023", intäkter: 168000, kostnader: 112000, resultat: 56000 },
    { month: "Jul 2023", intäkter: 148000, kostnader: 98000, resultat: 50000 },
    { month: "Aug 2023", intäkter: 158000, kostnader: 105000, resultat: 53000 },
    { month: "Sep 2023", intäkter: 175000, kostnader: 115000, resultat: 60000 },
    { month: "Okt 2023", intäkter: 188000, kostnader: 125000, resultat: 63000 },
    { month: "Nov 2023", intäkter: 198000, kostnader: 132000, resultat: 66000 },
    { month: "Dec 2023", intäkter: 210000, kostnader: 140000, resultat: 70000 },
    // 2024
    { month: "Jan", intäkter: 120000, kostnader: 85000, resultat: 35000 },
    { month: "Feb", intäkter: 135000, kostnader: 92000, resultat: 43000 },
    { month: "Mar", intäkter: 148000, kostnader: 98000, resultat: 50000 },
    { month: "Apr", intäkter: 142000, kostnader: 95000, resultat: 47000 },
    { month: "Maj", intäkter: 165000, kostnader: 105000, resultat: 60000 },
    { month: "Jun", intäkter: 178000, kostnader: 112000, resultat: 66000 },
    { month: "Jul", intäkter: 155000, kostnader: 98000, resultat: 57000 },
    { month: "Aug", intäkter: 168000, kostnader: 108000, resultat: 60000 },
    { month: "Sep", intäkter: 185000, kostnader: 118000, resultat: 67000 },
    { month: "Okt", intäkter: 195000, kostnader: 125000, resultat: 70000 },
    { month: "Nov", intäkter: 210000, kostnader: 135000, resultat: 75000 },
    { month: "Dec", intäkter: 225000, kostnader: 142000, resultat: 83000 },
]

// Chart configurations
export const revenueChartConfig = {
    intäkter: {
        label: "Intäkter",
        color: "var(--chart-1)",
    },
    kostnader: {
        label: "Kostnader",
        color: "var(--chart-5)",
    },
    resultat: {
        label: "Resultat",
        color: "var(--chart-3)",
    },
} satisfies ChartConfig

export const barChartConfig = {
    intäkter: {
        label: "Intäkter",
        color: "var(--chart-1)",
    },
    kostnader: {
        label: "Kostnader",
        color: "var(--chart-5)",
    },
} satisfies ChartConfig

// Transaction status pie chart data and config
export const transactionPieData = [
    { name: "bokförda", value: 128, fill: "var(--chart-1)" },
    { name: "attBokföra", value: 18, fill: "var(--chart-2)" },
    { name: "saknarUnderlag", value: 10, fill: "var(--chart-5)" },
]

export const transactionPieConfig = {
    bokförda: { label: "Bokförda", color: "var(--chart-1)" },
    attBokföra: { label: "Att bokföra", color: "var(--chart-2)" },
    saknarUnderlag: { label: "Saknar underlag", color: "var(--chart-5)" },
} satisfies ChartConfig

// Invoice status pie chart data and config
export const invoicePieData = [
    { name: "betalda", value: 38, fill: "var(--chart-1)" },
    { name: "förfallna", value: 4, fill: "var(--chart-5)" },
    { name: "utkast", value: 3, fill: "var(--chart-4)" },
]

export const invoicePieConfig = {
    betalda: { label: "Betalda", color: "var(--chart-1)" },
    förfallna: { label: "Förfallna", color: "var(--chart-5)" },
    utkast: { label: "Utkast", color: "var(--chart-4)" },
} satisfies ChartConfig

// Expense pie chart colors and config
export const expensePieColors = [
    "var(--chart-1)", 
    "var(--chart-2)", 
    "var(--chart-3)", 
    "var(--chart-4)", 
    "var(--chart-5)", 
    "var(--muted-foreground)"
]

export const expensePieConfig = {
    personal: { label: "Personal", color: "var(--chart-1)" },
    lokalkostnader: { label: "Lokalkostnader", color: "var(--chart-2)" },
    material: { label: "Material & Varor", color: "var(--chart-3)" },
    it: { label: "IT & Programvara", color: "var(--chart-4)" },
    resor: { label: "Resor & Representation", color: "var(--chart-5)" },
    övrigt: { label: "Övriga kostnader", color: "var(--muted-foreground)" },
} satisfies ChartConfig

// Time range options
export const timeRangeOptions = [
    { value: "3m", label: "Senaste 3 månader" },
    { value: "6m", label: "Senaste 6 månader" },
    { value: "12m", label: "Senaste 12 månader" },
    { value: "2y", label: "Senaste 2 år" },
    { value: "4y", label: "Senaste 4 år" },
    { value: "6y", label: "Senaste 6 år" },
]

// Helper function to filter data by time range
export function filterDataByTimeRange(timeRange: string) {
    switch (timeRange) {
        case "3m": return monthlyRevenueData.slice(-3)
        case "6m": return monthlyRevenueData.slice(-6)
        case "12m": return monthlyRevenueData.slice(-12)
        case "2y": return monthlyRevenueData.slice(-24)
        case "4y": return monthlyRevenueData.slice(-48)
        case "6y": return monthlyRevenueData
        default: return monthlyRevenueData.slice(-12)
    }
}
