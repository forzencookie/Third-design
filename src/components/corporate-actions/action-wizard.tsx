"use client"

import { useState } from "react"
import {
    Users,
    Coins,
    TrendingUp,
    Building2,
    FileText,
    ChevronRight,
    Check,
    Plus,
    Minus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import type { CorporateActionType } from "@/types/events"
import { corporateActionTypeMeta } from "@/types/events"
import { mockShareholders, mockBoardMeetings, mockShareCapital } from "@/data/ownership"

// Icon mapping for corporate action types
const actionIcons: Record<CorporateActionType, React.ElementType> = {
    board_change: Users,
    dividend: Coins,
    capital_change: TrendingUp,
    authority_filing: Building2,
    statute_change: FileText,
}

// Configure step with real form fields
interface ConfigureStepProps {
    actionType: CorporateActionType
    onBack: () => void
    onContinue: () => void
}

function ConfigureStep({ actionType, onBack, onContinue }: ConfigureStepProps) {
    const [formData, setFormData] = useState<Record<string, string>>({})

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    // Board change form
    if (actionType === 'board_change') {
        const currentBoard = mockBoardMeetings[0]?.attendees || []
        return (
            <div className="space-y-4">
                <Card className="p-4">
                    <div className="space-y-4">
                        <div>
                            <Label className="text-xs text-muted-foreground">Nuvarande styrelse</Label>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {currentBoard.map(name => (
                                    <div key={name} className="text-sm px-2 py-1 bg-muted rounded-md flex items-center gap-1">
                                        {name}
                                        <button className="text-muted-foreground hover:text-destructive">
                                            <Minus className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="grid gap-3">
                            <div>
                                <Label htmlFor="newMember">Lägg till styrelseledamot</Label>
                                <div className="flex gap-2 mt-1">
                                    <Input
                                        id="newMember"
                                        placeholder="Namn"
                                        value={formData.newMember || ''}
                                        onChange={(e) => handleChange('newMember', e.target.value)}
                                    />
                                    <Button variant="outline" size="icon">
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="changeDate">Ändringsdatum</Label>
                                <Input
                                    id="changeDate"
                                    type="date"
                                    value={formData.changeDate || new Date().toISOString().split('T')[0]}
                                    onChange={(e) => handleChange('changeDate', e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                        </div>
                    </div>
                </Card>
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={onBack}>Tillbaka</Button>
                    <Button onClick={onContinue}>Fortsätt till granskning</Button>
                </div>
            </div>
        )
    }

    // Dividend form
    if (actionType === 'dividend') {
        const totalShares = mockShareCapital.totalShares
        return (
            <div className="space-y-4">
                <Card className="p-4">
                    <div className="space-y-4">
                        <div className="p-3 bg-muted/50 rounded-lg">
                            <p className="text-sm text-muted-foreground">
                                Aktiekapital: <span className="font-medium text-foreground">{mockShareCapital.shareCapital.toLocaleString()} kr</span>
                                <span className="mx-2">·</span>
                                Antal aktier: <span className="font-medium text-foreground">{totalShares}</span>
                            </p>
                        </div>
                        <div>
                            <Label htmlFor="dividendTotal">Total utdelning (kr)</Label>
                            <Input
                                id="dividendTotal"
                                type="number"
                                placeholder="t.ex. 100000"
                                value={formData.dividendTotal || ''}
                                onChange={(e) => handleChange('dividendTotal', e.target.value)}
                                className="mt-1"
                            />
                            {formData.dividendTotal && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    = {(parseFloat(formData.dividendTotal) / totalShares).toFixed(2)} kr per aktie
                                </p>
                            )}
                        </div>
                        <div>
                            <Label className="text-xs text-muted-foreground">Fördelning per aktieägare</Label>
                            <div className="space-y-2 mt-2">
                                {mockShareholders.map(s => (
                                    <div key={s.id} className="flex justify-between text-sm p-2 bg-muted/30 rounded">
                                        <span>{s.name} ({s.ownershipPercentage}%)</span>
                                        <span className="font-medium">
                                            {formData.dividendTotal
                                                ? (parseFloat(formData.dividendTotal) * s.ownershipPercentage / 100).toLocaleString() + ' kr'
                                                : '–'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </Card>
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={onBack}>Tillbaka</Button>
                    <Button onClick={onContinue}>Fortsätt till granskning</Button>
                </div>
            </div>
        )
    }

    // Default form for other types
    return (
        <div className="space-y-4">
            <Card className="p-4">
                <div className="space-y-3">
                    <div>
                        <Label htmlFor="description">Beskrivning</Label>
                        <Input
                            id="description"
                            placeholder="Beskriv åtgärden..."
                            value={formData.description || ''}
                            onChange={(e) => handleChange('description', e.target.value)}
                            className="mt-1"
                        />
                    </div>
                    <div>
                        <Label htmlFor="effectiveDate">Giltighetsdatum</Label>
                        <Input
                            id="effectiveDate"
                            type="date"
                            value={formData.effectiveDate || new Date().toISOString().split('T')[0]}
                            onChange={(e) => handleChange('effectiveDate', e.target.value)}
                            className="mt-1"
                        />
                    </div>
                </div>
            </Card>
            <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={onBack}>Tillbaka</Button>
                <Button onClick={onContinue}>Fortsätt till granskning</Button>
            </div>
        </div>
    )
}

interface ActionWizardProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onComplete?: (actionType: CorporateActionType) => void
}

type WizardStep = 'select' | 'configure' | 'preview' | 'complete'

export function ActionWizard({ open, onOpenChange, onComplete }: ActionWizardProps) {
    const [step, setStep] = useState<WizardStep>('select')
    const [selectedAction, setSelectedAction] = useState<CorporateActionType | null>(null)

    const handleSelectAction = (actionType: CorporateActionType) => {
        setSelectedAction(actionType)
        setStep('configure')
    }

    const handleConfigure = () => {
        setStep('preview')
    }

    const handleComplete = () => {
        if (selectedAction && onComplete) {
            onComplete(selectedAction)
        }
        setStep('complete')
    }

    const handleReset = () => {
        setStep('select')
        setSelectedAction(null)
        onOpenChange(false)
    }

    const actionTypes: CorporateActionType[] = [
        'board_change',
        'dividend',
        'capital_change',
        'authority_filing',
        'statute_change',
    ]

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>
                        {step === 'select' && 'Ny bolagsåtgärd'}
                        {step === 'configure' && corporateActionTypeMeta[selectedAction!]?.label}
                        {step === 'preview' && 'Granska och godkänn'}
                        {step === 'complete' && 'Åtgärd skapad'}
                    </DialogTitle>
                    <DialogDescription>
                        {step === 'select' && 'Välj vilken typ av åtgärd du vill genomföra.'}
                        {step === 'configure' && 'Fyll i detaljerna för denna åtgärd.'}
                        {step === 'preview' && 'Kontrollera att allt ser korrekt ut innan du fortsätter.'}
                        {step === 'complete' && 'Din åtgärd har skapats och väntar på nästa steg.'}
                    </DialogDescription>
                </DialogHeader>

                {/* Step indicator */}
                <div className="flex items-center justify-center gap-2 py-4">
                    {(['select', 'configure', 'preview', 'complete'] as WizardStep[]).map((s, i) => (
                        <div key={s} className="flex items-center">
                            <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                                step === s ? "bg-primary text-primary-foreground" :
                                    (['select', 'configure', 'preview', 'complete'].indexOf(step) > i)
                                        ? "bg-emerald-500 text-white"
                                        : "bg-muted text-muted-foreground"
                            )}>
                                {(['select', 'configure', 'preview', 'complete'].indexOf(step) > i) ? (
                                    <Check className="h-4 w-4" />
                                ) : (
                                    i + 1
                                )}
                            </div>
                            {i < 3 && <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground" />}
                        </div>
                    ))}
                </div>

                {/* Step content */}
                <div className="py-4">
                    {step === 'select' && (
                        <div className="grid gap-3 sm:grid-cols-2">
                            {actionTypes.map((actionType) => {
                                const meta = corporateActionTypeMeta[actionType]
                                const Icon = actionIcons[actionType]
                                return (
                                    <Card
                                        key={actionType}
                                        className="cursor-pointer hover:border-primary/50 transition-colors"
                                        onClick={() => handleSelectAction(actionType)}
                                    >
                                        <CardHeader className="pb-2">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-950/50">
                                                    <Icon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                                </div>
                                                <CardTitle className="text-base">{meta.label}</CardTitle>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <CardDescription className="text-xs">
                                                {actionType === 'board_change' && 'Ändra styrelse, verkställande direktör eller firmatecknare.'}
                                                {actionType === 'dividend' && 'Besluta och verkställ utdelning till aktieägare.'}
                                                {actionType === 'capital_change' && 'Höj eller sänk aktiekapitalet.'}
                                                {actionType === 'authority_filing' && 'Skicka in anmälan till Bolagsverket eller Skatteverket.'}
                                                {actionType === 'statute_change' && 'Ändra bolagsordningen.'}
                                            </CardDescription>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    )}

                    {step === 'configure' && selectedAction && (
                        <ConfigureStep
                            actionType={selectedAction}
                            onBack={() => setStep('select')}
                            onContinue={handleConfigure}
                        />
                    )}

                    {step === 'preview' && selectedAction && (
                        <div className="space-y-4">
                            <Card className="p-4">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-950/50">
                                        {(() => {
                                            const Icon = actionIcons[selectedAction]
                                            return <Icon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                        })()}
                                    </div>
                                    <div>
                                        <p className="font-medium">{corporateActionTypeMeta[selectedAction].label}</p>
                                        <p className="text-xs text-muted-foreground">Utkast – väntar på godkännande</p>
                                    </div>
                                </div>
                                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
                                    <p className="text-sm text-amber-800 dark:text-amber-200">
                                        ⚠️ Denna åtgärd kräver signatur från behörig firmatecknare innan inskick.
                                    </p>
                                </div>
                            </Card>
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setStep('configure')}>
                                    Tillbaka
                                </Button>
                                <Button onClick={handleComplete}>
                                    Skapa åtgärd
                                </Button>
                            </div>
                        </div>
                    )}

                    {step === 'complete' && (
                        <div className="text-center space-y-4">
                            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center">
                                <Check className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                                <p className="font-medium">Åtgärden har skapats!</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Den visas nu i tidslinjen under "Händelser" med status "Utkast".
                                </p>
                            </div>
                            <Button onClick={handleReset}>Stäng</Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
