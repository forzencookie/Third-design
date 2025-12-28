"use client"

import { useState, useMemo } from "react"
import {
    Calendar,
    TrendingUp,
    Clock,
    Bot,
    Send,
    FileDown,
    ChevronDown,
    ChevronRight,
} from "lucide-react"
import { useToast } from "@/components/ui/toast"
import { StatCard, StatCardGrid } from "@/components/ui/stat-card"
import { Button } from "@/components/ui/button"
import { FilterButton } from "@/components/ui/filter-button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { SectionCard } from "@/components/ui/section-card"
import { InkomstWizardDialog } from "./ai-wizard-dialog"
import { SRUPreviewDialog } from "./sru-preview-dialog"
import { useVerifications } from "@/hooks/use-verifications"
import { Ink2Processor, type Ink2FormField } from "@/lib/ink2-processor"
import { INVOICE_STATUS_LABELS } from "@/lib/localization"
import { cn } from "@/lib/utils"

// =============================================================================
// INK2 Form Section Component
// =============================================================================

interface FormSectionProps {
    title: string
    fields: Ink2FormField[]
    defaultOpen?: boolean
}

function FormSection({ title, fields, defaultOpen = true }: FormSectionProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen)

    // Calculate section total
    const total = fields.reduce((sum, f) => sum + f.value, 0)

    if (fields.length === 0) return null

    return (
        <div className="space-y-1">
            {/* Section Header */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 py-2 hover:bg-muted/30 rounded-sm px-2 -mx-2 transition-colors"
            >
                {isOpen ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="font-medium text-sm">{title}</span>

                <span className={cn(
                    "font-medium text-sm tabular-nums px-2 py-0.5 rounded-sm",
                    total > 0 && "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-950/50",
                    total < 0 && "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-950/50",
                    total === 0 && "text-muted-foreground bg-muted/50"
                )}>
                    {total > 0 && "+"}{total.toLocaleString('sv-SE')} kr
                </span>

            </button>


            {/* Section Content */}
            {isOpen && (
                <div className="space-y-0.5 pl-6">
                    {fields.map((field) => (
                        <div
                            key={field.field}
                            className="flex items-start justify-between py-1.5"
                        >
                            <div className="flex items-start gap-3">
                                <span className="font-mono text-xs text-muted-foreground w-10 shrink-0 pt-0.5">
                                    {field.field}
                                </span>
                                <span className="text-sm">
                                    {field.label}
                                </span>
                            </div>
                            <span className={cn(
                                "font-medium text-sm tabular-nums shrink-0 ml-4",
                                field.value > 0 && "text-green-600 dark:text-green-400",
                                field.value < 0 && "text-red-600 dark:text-red-400",
                                field.value === 0 && "text-muted-foreground"
                            )}>
                                {field.value > 0 && "+"}{field.value.toLocaleString('sv-SE')} kr
                            </span>
                        </div>
                    ))}
                </div>
            )}


        </div>
    )
}



// =============================================================================
// Main Component
// =============================================================================


export function InkomstdeklarationContent() {
    const { addToast: toast } = useToast()
    const { verifications } = useVerifications()
    const [showAIDialog, setShowAIDialog] = useState(false)
    const [showSRUPreview, setShowSRUPreview] = useState(false)
    const [activeFilter, setActiveFilter] = useState<"all" | "incomeStatement" | "balanceSheet" | "taxAdjustments">("all")

    // Calculate all fields from ledger
    const calculatedData = useMemo(() => {
        return Ink2Processor.calculateAll(verifications, 2024)
    }, [verifications])

    // Calculate stats
    const stats = useMemo(() => {
        const arsResultat = calculatedData.totals.netIncome
        return {
            year: "2024",
            result: arsResultat,
            status: INVOICE_STATUS_LABELS.DRAFT,
        }
    }, [calculatedData])

    // Group income statement fields by sub-section
    const incomeStatementSections = useMemo(() => {
        const sections: { title: string; fields: Ink2FormField[] }[] = []
        const fieldsBySection = new Map<string, Ink2FormField[]>()

        calculatedData.incomeStatement.forEach(field => {
            const section = field.section || "Övrigt"
            const existing = fieldsBySection.get(section) || []
            existing.push(field)
            fieldsBySection.set(section, existing)
        })

        // Order the sections logically
        const sectionOrder = [
            "Rörelseintäkter",
            "Rörelsekostnader",
            "Finansiella poster",
            "Bokslutsdispositioner",
            "Skatt och resultat"
        ]

        sectionOrder.forEach(sectionName => {
            const fields = fieldsBySection.get(sectionName)
            if (fields && fields.length > 0) {
                sections.push({ title: sectionName, fields })
            }
        })

        return sections
    }, [calculatedData])

    // Group balance sheet fields by sub-section
    const balanceSheetSections = useMemo(() => {
        const sections: { title: string; fields: Ink2FormField[] }[] = []
        const fieldsBySection = new Map<string, Ink2FormField[]>()

        calculatedData.balanceSheet.forEach(field => {
            const section = field.section || "Övrigt"
            const existing = fieldsBySection.get(section) || []
            existing.push(field)
            fieldsBySection.set(section, existing)
        })

        // Get unique sections in order
        const seenSections = new Set<string>()
        calculatedData.balanceSheet.forEach(f => {
            if (f.section && !seenSections.has(f.section)) {
                seenSections.add(f.section)
                const fields = fieldsBySection.get(f.section)
                if (fields) {
                    sections.push({ title: f.section, fields })
                }
            }
        })

        return sections
    }, [calculatedData])

    // Group tax adjustment fields by sub-section
    const taxAdjustmentSections = useMemo(() => {
        const sections: { title: string; fields: Ink2FormField[] }[] = []
        const fieldsBySection = new Map<string, Ink2FormField[]>()

        calculatedData.taxAdjustments.forEach(field => {
            const section = field.section || "Övrigt"
            const existing = fieldsBySection.get(section) || []
            existing.push(field)
            fieldsBySection.set(section, existing)
        })

        // Get unique sections in order
        const seenSections = new Set<string>()
        calculatedData.taxAdjustments.forEach(f => {
            if (f.section && !seenSections.has(f.section)) {
                seenSections.add(f.section)
                const fields = fieldsBySection.get(f.section)
                if (fields) {
                    sections.push({ title: f.section, fields })
                }
            }
        })

        return sections
    }, [calculatedData])

    const handleSend = () => {
        toast({
            title: "Deklaration skickad",
            description: "Inkomstdeklaration 2 har skickats till Skatteverket.",
        })
    }

    return (

        <main className="flex-1 flex flex-col p-6">
            <div className="max-w-6xl w-full space-y-6">
                <StatCardGrid columns={3}>
                    <StatCard
                        label="Beskattningsår"
                        value="2024"
                        subtitle="Inkomstdeklaration 2"
                        icon={Calendar}
                    />
                    <StatCard
                        label="Bokfört resultat"
                        value={`${stats.result.toLocaleString('sv-SE')} kr`}
                        subtitle="Före skattemässiga justeringar"
                        icon={TrendingUp}
                    />
                    <StatCard
                        label="Status"
                        value={INVOICE_STATUS_LABELS.DRAFT}
                        subtitle="Deadline: 1 jul 2025"
                        icon={Clock}
                    />
                </StatCardGrid>

                {/* Section Separator */}
                <div className="border-b-2 border-border/60" />

                <SectionCard
                    icon={Bot}
                    title="AI-inkomstdeklaration"
                    description="INK2-fälten genereras automatiskt från bokföringen."
                    variant="ai"
                    onAction={() => setShowAIDialog(true)}
                />

                <InkomstWizardDialog
                    open={showAIDialog}
                    onOpenChange={setShowAIDialog}
                />

                <SRUPreviewDialog
                    open={showSRUPreview}
                    onOpenChange={setShowSRUPreview}
                />


                {/* Thick separator below AI card */}
                <div className="border-b-2 border-border/60" />

                {/* Form Header with Actions */}

                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">
                        {activeFilter === "all" && "INK2 – Komplett"}
                        {activeFilter === "incomeStatement" && "INK2 – Resultaträkning"}
                        {activeFilter === "balanceSheet" && "INK2R – Balansräkning"}
                        {activeFilter === "taxAdjustments" && "INK2S – Skattemässiga justeringar"}
                    </h2>
                    <div className="flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <FilterButton
                                    label={activeFilter === "all" ? "Visa alla" : "Filtrerad"}
                                    isActive={activeFilter !== "all"}
                                />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-64">
                                <DropdownMenuLabel>Visa sektion</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => setActiveFilter("all")}
                                    className={activeFilter === "all" ? "bg-accent" : ""}
                                >
                                    Visa alla (komplett INK2)
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => setActiveFilter("incomeStatement")}
                                    className={activeFilter === "incomeStatement" ? "bg-accent" : ""}
                                >
                                    Resultaträkning (3.x)
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => setActiveFilter("balanceSheet")}
                                    className={activeFilter === "balanceSheet" ? "bg-accent" : ""}
                                >
                                    Balansräkning (2.x)
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => setActiveFilter("taxAdjustments")}
                                    className={activeFilter === "taxAdjustments" ? "bg-accent" : ""}
                                >
                                    Skattemässiga justeringar (4.x)
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowSRUPreview(true)}
                        >
                            <FileDown className="h-4 w-4 mr-1.5" />
                            Exportera SRU
                        </Button>

                        <Button size="sm" onClick={handleSend}>
                            <Send className="h-4 w-4 mr-1.5" />
                            Skicka till Skatteverket
                        </Button>
                    </div>
                </div>

                {/* Form Sections */}
                <div className="space-y-8">
                    {/* Income Statement */}
                    {(activeFilter === "all" || activeFilter === "incomeStatement") && (
                        <div className="space-y-4">
                            {activeFilter === "all" && (
                                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide pb-2 border-b border-border/60">
                                    Resultaträkning (3.x)
                                </h3>
                            )}
                            {incomeStatementSections.map((section, idx) => (
                                <FormSection
                                    key={section.title}
                                    title={section.title}
                                    fields={section.fields}
                                    defaultOpen={activeFilter === "incomeStatement" || idx < 3}
                                />
                            ))}
                        </div>
                    )}

                    {/* Balance Sheet */}

                    {(activeFilter === "all" || activeFilter === "balanceSheet") && (
                        <div className="space-y-4">
                            {activeFilter === "all" && (
                                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide pb-2 border-b border-border/60">
                                    Balansräkning (2.x)
                                </h3>
                            )}
                            {balanceSheetSections.map((section, idx) => (
                                <FormSection
                                    key={section.title}
                                    title={section.title}
                                    fields={section.fields}
                                    defaultOpen={activeFilter === "balanceSheet" && idx < 3}
                                />
                            ))}
                        </div>
                    )}

                    {/* Tax Adjustments */}

                    {(activeFilter === "all" || activeFilter === "taxAdjustments") && (
                        <div className="space-y-4">
                            {activeFilter === "all" && (
                                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide pb-2 border-b border-border/60">
                                    Skattemässiga justeringar (4.x)
                                </h3>
                            )}
                            {taxAdjustmentSections.map((section, idx) => (
                                <FormSection
                                    key={section.title}
                                    title={section.title}
                                    fields={section.fields}
                                    defaultOpen={activeFilter === "taxAdjustments" && idx < 3}
                                />
                            ))}
                        </div>
                    )}
                </div>


            </div>
        </main>
    )
}
