"use client"

import { useState } from "react"
import {
    Calendar,
    Wallet,
    Send,
    Download,
    Edit,
    Save,
    X,
    FileText,
    Building2,
    CreditCard,
    Info
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AppStatusBadge } from "@/components/ui/status-badge"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import type { VatReport } from "@/lib/vat-processor"

interface MomsDetailDialogProps {
    report: VatReport | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onSave?: (report: VatReport) => void
}

function FormRow({
    code,
    label,
    value,
    editable,
    onChange,
    highlight = false
}: {
    code: string
    label: string
    value: number
    editable: boolean
    onChange?: (val: number) => void
    highlight?: boolean
}) {
    return (
        <div className={cn(
            "grid grid-cols-[3rem_1fr_10rem] gap-4 items-center p-3 border-b last:border-0",
            highlight && "bg-muted/30"
        )}>
            <div className="font-mono font-bold text-muted-foreground bg-muted/50 rounded px-1.5 py-0.5 text-center text-sm border">
                {code}
            </div>
            <div className="text-sm font-medium">
                {label}
            </div>
            <div className="text-right">
                {editable && onChange ? (
                    <Input
                        type="number"
                        className="text-right h-8"
                        value={value}
                        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
                    />
                ) : (
                    <span className={cn(
                        "font-mono font-medium",
                        highlight && "text-base"
                    )}>
                        {Math.floor(value).toLocaleString("sv-SE")}
                    </span>
                )}
            </div>
        </div>
    )
}

export function MomsDetailDialog({
    report,
    open,
    onOpenChange,
    onSave,
}: MomsDetailDialogProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [editedReport, setEditedReport] = useState<VatReport | null>(null)
    const [isExpanded, setIsExpanded] = useState(false)

    if (!report) return null

    const currentReport = editedReport || report

    const handleEdit = () => {
        setEditedReport({ ...report })
        setIsEditing(true)
    }

    const handleSave = () => {
        if (editedReport && onSave) {
            onSave(editedReport)
        }
        setIsEditing(false)
        setEditedReport(null)
    }

    const handleCancel = () => {
        setIsEditing(false)
        setEditedReport(null)
    }

    const updateField = (field: keyof VatReport, value: number) => {
        if (!editedReport) return

        const updated = { ...editedReport, [field]: value }

        // Recalculate derived fields if necessary
        // In the form: Net = Output - Input
        // If we edit the Net box directly, it's just a manual override, but usually implies calc

        if (field === 'ruta10' || field === 'ruta48') {
            // Basic recalc: Net = Ruta 10 + Ruta 11 + Ruta 12 - Ruta 48
            // (Assuming 11/12 are 0 for now)
            updated.salesVat = updated.ruta10
            updated.inputVat = updated.ruta48
            updated.ruta49 = updated.ruta10 - updated.ruta48
            updated.netVat = updated.ruta49

            // Also update sales base approximate
            if (field === 'ruta10') {
                updated.ruta05 = updated.ruta10 * 4
            }
        }
        if (field === 'ruta05') {
            // If base changes, update tax? Usually goes other way in manual entry 
            // but let's assume auto-calc 25%
            updated.ruta10 = updated.ruta05 * 0.25
            updated.salesVat = updated.ruta10
            updated.ruta49 = updated.ruta10 - updated.ruta48
            updated.netVat = updated.ruta49
        }

        setEditedReport(updated)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                expandable
                onExpandedChange={setIsExpanded}
                className="max-w-3xl"
            >
                <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 pr-16 bg-yellow-50/50 dark:bg-yellow-950/10 -mx-6 -mt-6 p-6 border-b border-yellow-100 dark:border-yellow-900/30">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-yellow-400 text-black flex items-center justify-center font-bold text-lg rounded shadow-sm">
                            SKV
                        </div>
                        <div>
                            <DialogTitle className="text-xl">
                                Momsdeklaration
                            </DialogTitle>
                            <DialogDescription className="text-yellow-700 dark:text-yellow-500">
                                {currentReport.period} • Deadline: {currentReport.dueDate}
                            </DialogDescription>
                        </div>
                    </div>
                    <AppStatusBadge
                        status={currentReport.status === "upcoming" ? "Kommande" : "Inskickad"}
                    />
                </DialogHeader>

                <div className={cn(
                    "space-y-6 overflow-y-auto pt-4",
                    isExpanded ? "max-h-[calc(90vh-200px)]" : "max-h-[60vh]"
                )}>
                    {/* The Form */}
                    <div className="border rounded-lg bg-card shadow-sm overflow-hidden">
                        {/* Section A: Sales */}
                        <div className="bg-muted/10 px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b flex justify-between">
                            <span>A. Försäljning m.m.</span>
                            <span>Belopp (kr)</span>
                        </div>
                        <FormRow
                            code="05"
                            label="Momspliktig försäljning som inte ingår i ruta 06, 07 eller 08"
                            value={currentReport.ruta05 || 0}
                            editable={isEditing}
                            onChange={(val) => updateField('ruta05', val)}
                        />

                        {/* Section B: Output VAT */}
                        <div className="bg-muted/10 px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-y flex justify-between mt-4">
                            <span>B. Utgående moms</span>
                            <span>Moms (kr)</span>
                        </div>
                        <FormRow
                            code="10"
                            label="Utgående moms 25%"
                            value={currentReport.ruta10 || 0}
                            editable={isEditing}
                            onChange={(val) => updateField('ruta10', val)}
                        />
                        {/* Placeholders for 12% and 6% */}
                        {isExpanded && (
                            <>
                                <FormRow code="11" label="Utgående moms 12%" value={0} editable={false} />
                                <FormRow code="12" label="Utgående moms 6%" value={0} editable={false} />
                            </>
                        )}

                        {/* Section C: Input VAT */}
                        <div className="bg-muted/10 px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-y flex justify-between mt-4">
                            <span>C. Ingående moms</span>
                            <span>Moms (kr)</span>
                        </div>
                        <FormRow
                            code="48"
                            label="Ingående moms att dra av"
                            value={currentReport.ruta48 || 0}
                            editable={isEditing}
                            onChange={(val) => updateField('ruta48', val)}
                        />

                        {/* Section D: Result */}
                        <div className="bg-muted/10 px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-y flex justify-between mt-4">
                            <span>D. Moms att betala eller få tillbaka</span>
                            <span>Belopp (kr)</span>
                        </div>
                        <FormRow
                            code="49"
                            label={currentReport.ruta49 >= 0 ? "Att betala" : "Att få tillbaka"}
                            value={Math.abs(currentReport.ruta49 || 0)}
                            editable={false} // Calculated
                            highlight
                        />
                    </div>

                    <div className="flex items-start gap-2 text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950/20 p-3 rounded border border-blue-100 dark:border-blue-900/30">
                        <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                        <p>
                            Detta är en förhandsvisning av uppgifterna som kommer att skickas till Skatteverket.
                            Kontrollera att alla belopp stämmer med din bokföring.
                        </p>
                    </div>

                    {/* Payment Info in Expanded */}
                    {isExpanded && currentReport.ruta49 > 0 && (
                        <div className="border rounded-lg p-4 bg-muted/5 space-y-3">
                            <h4 className="font-semibold text-sm flex items-center gap-2">
                                <CreditCard className="h-4 w-4" /> Betalningsuppgifter
                            </h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-muted-foreground">Bankgiro:</span>
                                    <span className="font-mono ml-2">5050-1055</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">OCR:</span>
                                    <span className="font-mono ml-2">123456789</span>
                                </div>
                            </div>
                        </div>
                    )}

                </div>

                <div className="flex items-center justify-between pt-4 border-t mt-4">
                    <div className="flex items-center gap-2">
                        {isEditing ? (
                            <>
                                <Button onClick={handleSave} className="gap-2">
                                    <Save className="h-4 w-4" />
                                    Spara ändringar
                                </Button>
                                <Button variant="outline" onClick={handleCancel} className="gap-2">
                                    <X className="h-4 w-4" />
                                    Avbryt
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button variant="outline" onClick={handleEdit} className="gap-2">
                                    <Edit className="h-4 w-4" />
                                    Redigera
                                </Button>
                                <Button variant="outline" className="gap-2">
                                    <Download className="h-4 w-4" />
                                    Ladda ner PDF
                                </Button>
                            </>
                        )}
                    </div>

                    {currentReport.status === "upcoming" && !isEditing && (
                        <Button className="gap-2 bg-yellow-500 hover:bg-yellow-600 text-black border-yellow-600">
                            <Send className="h-4 w-4" />
                            Signera och skicka
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
