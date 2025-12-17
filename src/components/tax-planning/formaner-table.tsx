"use client"

import { useState, useEffect } from "react"
import { Plus, Gift, Heart, Car, Utensils, GraduationCap, Dumbbell, MoreHorizontal, Users, Calculator } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatCurrency } from "@/lib/utils"
import { StatCard, StatCardGrid } from "@/components/ui/stat-card"
import { DataTable, DataTableHeader, DataTableHeaderCell, DataTableBody, DataTableRow, DataTableCell } from "@/components/ui/data-table"
import { Badge } from "@/components/ui/badge"
import { useTextMode } from "@/providers/text-mode-provider"
import type { FormanCatalogItem, EmployeeBenefit, BenefitCategory } from "@/lib/ai-tool-types"
import {
    listAvailableBenefits,
    assignBenefit,
    getEmployeeBenefits,
    getRemainingAllowance,
    suggestUnusedBenefits,
    calculateBenefitTaxImpact,
} from "@/lib/formaner"

const getCategoryIcon = (category: BenefitCategory) => {
    switch (category) {
        case 'tax_free': return Heart
        case 'taxable': return Car
        case 'salary_sacrifice': return Calculator
        default: return Gift
    }
}

// Note: getCategoryLabel uses text object inside the component
const getBenefitIcon = (id: string) => {
    switch (id) {
        case 'friskvard': return Dumbbell
        case 'tjanstebil': return Car
        case 'utbildning': return GraduationCap
        case 'kost':
        case 'lunch': return Utensils
        default: return Gift
    }
}

export function FormanerTable() {
    const { text } = useTextMode()
    const [benefits, setBenefits] = useState<FormanCatalogItem[]>([])
    const [assignedBenefits, setAssignedBenefits] = useState<EmployeeBenefit[]>([])

    // Category label helper using translations
    const getCategoryLabel = (category: BenefitCategory) => {
        switch (category) {
            case 'tax_free': return text.formaner.taxFree
            case 'taxable': return text.formaner.taxable
            case 'salary_sacrifice': return text.formaner.salarySacrifice
            default: return category
        }
    }
    const [suggestions, setSuggestions] = useState<FormanCatalogItem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [showAssignDialog, setShowAssignDialog] = useState(false)
    const [selectedBenefit, setSelectedBenefit] = useState<FormanCatalogItem | null>(null)
    const [activeTab, setActiveTab] = useState<'catalog' | 'assigned'>('catalog')

    // Form state
    const [employeeName, setEmployeeName] = useState("")
    const [assignAmount, setAssignAmount] = useState("")

    const currentYear = new Date().getFullYear()

    // Load data
    useEffect(() => {
        async function load() {
            setIsLoading(true)
            const [allBenefits, unuusedSuggestions] = await Promise.all([
                listAvailableBenefits('AB'),
                suggestUnusedBenefits('Demo Anställd', currentYear, 'AB')
            ])
            setBenefits(allBenefits)
            setSuggestions(unuusedSuggestions)
            setIsLoading(false)
        }
        load()
    }, [currentYear])

    // Calculate stats
    const taxFreeBenefits = benefits.filter(b => b.category === 'tax_free')
    const taxableBenefits = benefits.filter(b => b.category === 'taxable')
    const salarySacrifice = benefits.filter(b => b.category === 'salary_sacrifice')

    // Handlers
    const handleAssign = async () => {
        if (!selectedBenefit || !employeeName) return
        const amount = parseFloat(assignAmount) || 0

        const assigned = await assignBenefit({
            employeeName,
            benefitType: selectedBenefit.id,
            amount,
            year: currentYear,
        })

        if (assigned) {
            setAssignedBenefits(prev => [assigned, ...prev])
            setShowAssignDialog(false)
            setSelectedBenefit(null)
            setEmployeeName("")
            setAssignAmount("")
        }
    }

    const openAssignDialog = (benefit: FormanCatalogItem) => {
        setSelectedBenefit(benefit)
        setShowAssignDialog(true)
    }

    return (
        <div className="space-y-6">
            {/* Stats */}
            <StatCardGrid columns={4}>
                <StatCard
                    label={text.formaner.taxFree}
                    value={taxFreeBenefits.length}
                    icon={Heart}
                />
                <StatCard
                    label={text.formaner.taxable}
                    value={taxableBenefits.length}
                    icon={Car}
                />
                <StatCard
                    label={text.formaner.salarySacrifice}
                    value={salarySacrifice.length}
                    icon={Calculator}
                />
                <StatCard
                    label={text.formaner.unused}
                    value={suggestions.length}
                    icon={Gift}
                />
            </StatCardGrid>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'catalog' | 'assigned')}>
                <TabsList>
                    <TabsTrigger value="catalog">{text.formaner.catalog}</TabsTrigger>
                    <TabsTrigger value="assigned">{text.formaner.assigned}</TabsTrigger>
                </TabsList>

                {/* Catalog Tab */}
                <TabsContent value="catalog" className="mt-4">
                    <DataTable
                        title={text.formaner.catalog}
                    >
                        <DataTableHeader>
                            <DataTableHeaderCell label={text.formaner.benefit} />
                            <DataTableHeaderCell label={text.formaner.category} />
                            <DataTableHeaderCell label={text.formaner.maxAmount} align="right" />
                            <DataTableHeaderCell label={text.formaner.isTaxFree} />
                            <DataTableHeaderCell label={text.formaner.basAccount} />
                            <DataTableHeaderCell label="" align="right" />
                        </DataTableHeader>
                        <DataTableBody>
                            {isLoading ? (
                                <DataTableRow>
                                    <DataTableCell colSpan={6}>{text.formaner.loading}</DataTableCell>
                                </DataTableRow>
                            ) : (
                                benefits.map((benefit) => {
                                    const Icon = getBenefitIcon(benefit.id)
                                    return (
                                        <DataTableRow key={benefit.id}>
                                            <DataTableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-lg bg-muted">
                                                        <Icon className="h-4 w-4" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{benefit.name}</p>
                                                        {benefit.description && (
                                                            <p className="text-xs text-muted-foreground">{benefit.description}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </DataTableCell>
                                            <DataTableCell>
                                                <Badge variant={benefit.category === 'tax_free' ? 'default' : 'secondary'}>
                                                    {getCategoryLabel(benefit.category)}
                                                </Badge>
                                            </DataTableCell>
                                            <DataTableCell align="right">
                                                {benefit.maxAmount ? formatCurrency(benefit.maxAmount) : '—'}
                                            </DataTableCell>
                                            <DataTableCell>
                                                {benefit.taxFree ? (
                                                    <Badge variant="outline" className="text-green-600">{text.formaner.yes}</Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-orange-600">{text.formaner.no}</Badge>
                                                )}
                                            </DataTableCell>
                                            <DataTableCell>
                                                <code className="text-xs">{benefit.basAccount || '—'}</code>
                                            </DataTableCell>
                                            <DataTableCell align="right">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => openAssignDialog(benefit)}
                                                >
                                                    <Plus className="h-4 w-4 mr-1" />
                                                    {text.formaner.assign}
                                                </Button>
                                            </DataTableCell>
                                        </DataTableRow>
                                    )
                                })
                            )}
                        </DataTableBody>
                    </DataTable>
                </TabsContent>

                {/* Assigned Tab */}
                <TabsContent value="assigned" className="mt-4">
                    <DataTable
                        title={text.formaner.assignedBenefitsTitle}
                    >
                        <DataTableHeader>
                            <DataTableHeaderCell label={text.formaner.employee} />
                            <DataTableHeaderCell label={text.formaner.benefit} />
                            <DataTableHeaderCell label={text.periodiseringsfonder.amount} align="right" />
                            <DataTableHeaderCell label={text.formaner.formansvarde} align="right" />
                            <DataTableHeaderCell label={text.formaner.year} />
                        </DataTableHeader>
                        <DataTableBody>
                            {assignedBenefits.length === 0 ? (
                                <DataTableRow>
                                    <DataTableCell colSpan={5}>
                                        <div className="text-center py-8 text-muted-foreground">
                                            {text.formaner.noBenefitsAssigned}
                                        </div>
                                    </DataTableCell>
                                </DataTableRow>
                            ) : (
                                assignedBenefits.map((ab) => (
                                    <DataTableRow key={ab.id}>
                                        <DataTableCell bold>
                                            <div className="flex items-center gap-2">
                                                <Users className="h-4 w-4 text-muted-foreground" />
                                                {ab.employeeName}
                                            </div>
                                        </DataTableCell>
                                        <DataTableCell>{ab.benefitType}</DataTableCell>
                                        <DataTableCell align="right">{formatCurrency(ab.amount)}</DataTableCell>
                                        <DataTableCell align="right">
                                            {ab.formansvarde ? formatCurrency(ab.formansvarde) : '0 kr'}
                                        </DataTableCell>
                                        <DataTableCell>{ab.year}</DataTableCell>
                                    </DataTableRow>
                                ))
                            )}
                        </DataTableBody>
                    </DataTable>
                </TabsContent>
            </Tabs>

            {/* Assign Benefit Dialog */}
            <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{text.formaner.assignTitle}</DialogTitle>
                        <DialogDescription>
                            {selectedBenefit?.name} — {selectedBenefit?.description}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        {selectedBenefit?.taxFree && selectedBenefit?.maxAmount && (
                            <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                                <p className="text-sm text-green-800 dark:text-green-200">
                                    {text.formaner.taxFreeNote} {formatCurrency(selectedBenefit.maxAmount)}{text.formaner.perYear}
                                </p>
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label>{text.formaner.employee}</Label>
                            <Input
                                value={employeeName}
                                onChange={(e) => setEmployeeName(e.target.value)}
                                placeholder="Anna Andersson"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>{text.formaner.amountSek}</Label>
                            <Input
                                type="number"
                                value={assignAmount}
                                onChange={(e) => setAssignAmount(e.target.value)}
                                placeholder={selectedBenefit?.maxAmount?.toString() || "5000"}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
                            {text.formaner.cancel}
                        </Button>
                        <Button onClick={handleAssign}>
                            {text.formaner.confirmAssign}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
