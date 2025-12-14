"use client"

import { 
    Calendar, 
    Building2, 
    Clock, 
    Bot,
} from "lucide-react"
import { StatCard, StatCardGrid } from "@/components/ui/stat-card"
import { SectionCard } from "@/components/ui/section-card"
import { 
    DataTable, 
    DataTableHeader, 
    DataTableHeaderCell, 
    DataTableBody, 
    DataTableRow, 
    DataTableCell 
} from "@/components/ui/data-table"
import { useCompany } from "@/providers/company-provider"

// Simplified P&L data for sole proprietors
const simplifiedPLItems = [
    { label: "Försäljning och övriga intäkter", value: 485000, bold: true },
    { label: "Varor, material och tjänster", value: -125000 },
    { label: "Övriga externa kostnader", value: -85000 },
    { label: "Personalkostnader", value: 0 },
    { label: "Avskrivningar", value: -15000 },
    { label: "Årets resultat", value: 260000, bold: true, separator: true },
]

// Simplified Balance Sheet data
const simplifiedBalanceSheet = {
    assets: [
        { label: "Tillgångar", value: 385000, bold: true },
        { label: "Inventarier", value: 45000, indent: true },
        { label: "Kundfordringar", value: 62000, indent: true },
        { label: "Kassa och bank", value: 278000, indent: true },
    ],
    liabilities: [
        { label: "Eget kapital och skulder", value: 385000, bold: true, separator: true },
        { label: "Eget kapital", value: 310000, indent: true },
        { label: "Leverantörsskulder", value: 45000, indent: true },
        { label: "Skatteskulder", value: 30000, indent: true },
    ],
}

export function ArsbokslutContent() {
    const { companyTypeName } = useCompany()
    
    return (
        <main className="flex-1 flex flex-col px-6 pt-2 pb-6">
            <div className="max-w-6xl w-full space-y-6">
                <StatCardGrid columns={3}>
                    <StatCard
                        label="Räkenskapsår"
                        value="2024"
                        subtitle="2024-01-01 – 2024-12-31"
                        icon={Calendar}
                    />
                    <StatCard
                        label="Bolagsform"
                        value={companyTypeName}
                        subtitle="Förenklat årsbokslut"
                        icon={Building2}
                    />
                    <StatCard
                        label="Status"
                        value="Under arbete"
                        subtitle="Deadline: 2 maj 2025"
                        icon={Clock}
                    />
                </StatCardGrid>

                {/* Section Separator */}
                <div className="border-b-2 border-border/60" />

                <SectionCard
                    icon={Bot}
                    title="AI-årsbokslut"
                    description="Genereras automatiskt från bokföringen enligt BFL."
                    variant="ai"
                    onAction={() => {}}
                />

                {/* Simplified P&L for sole proprietors */}
                <DataTable title="Resultaträkning (förenklad)">
                    <DataTableHeader>
                        <DataTableHeaderCell label="Post" />
                        <DataTableHeaderCell label="Belopp" align="right" />
                    </DataTableHeader>
                    <DataTableBody>
                        {simplifiedPLItems.map((item) => (
                            <DataTableRow key={item.label} className={item.separator ? "border-t-2" : ""}>
                                <DataTableCell bold={item.bold}>{item.label}</DataTableCell>
                                <DataTableCell align="right" bold={item.bold}>
                                    {item.value.toLocaleString('sv-SE')} kr
                                </DataTableCell>
                            </DataTableRow>
                        ))}
                    </DataTableBody>
                </DataTable>

                {/* Simplified Balance Sheet */}
                <DataTable title="Balansräkning (förenklad)">
                    <DataTableHeader>
                        <DataTableHeaderCell label="Post" />
                        <DataTableHeaderCell label="Belopp" align="right" />
                    </DataTableHeader>
                    <DataTableBody>
                        {simplifiedBalanceSheet.assets.map((item) => (
                            <DataTableRow key={item.label}>
                                <DataTableCell bold={item.bold} className={item.indent ? "pl-6" : ""}>
                                    {item.label}
                                </DataTableCell>
                                <DataTableCell align="right" bold={item.bold}>
                                    {item.value.toLocaleString('sv-SE')} kr
                                </DataTableCell>
                            </DataTableRow>
                        ))}
                        {simplifiedBalanceSheet.liabilities.map((item) => (
                            <DataTableRow key={item.label} className={item.separator ? "border-t" : ""}>
                                <DataTableCell bold={item.bold} className={item.indent ? "pl-6" : ""}>
                                    {item.label}
                                </DataTableCell>
                                <DataTableCell align="right" bold={item.bold}>
                                    {item.value.toLocaleString('sv-SE')} kr
                                </DataTableCell>
                            </DataTableRow>
                        ))}
                    </DataTableBody>
                </DataTable>
            </div>
        </main>
    )
}
