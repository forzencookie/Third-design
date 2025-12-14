"use client"

import { useState, useCallback, useEffect } from "react"
import { 
    Bot, 
    Upload, 
    FileText, 
    Check, 
    X, 
    Sparkles,
    Edit3,
    ChevronRight,
    AlertCircle,
    CheckCircle2,
    Loader2,
    Receipt,
    Building2,
    Calendar,
    Banknote,
    CreditCard,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useTextMode } from "@/providers/text-mode-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AppStatusBadge } from "@/components/ui/status-badge"
import { UploadDropzone } from "@/components/ui/upload-dropzone"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import type { Transaction, AISuggestion } from "@/types"

// ============================================================================
// BAS Account options for manual selection
// ============================================================================

const BAS_ACCOUNTS = [
    { value: "1930", label: "1930 - Företagskonto / checkkonto" },
    { value: "2440", label: "2440 - Leverantörsskulder" },
    { value: "3010", label: "3010 - Försäljning varor" },
    { value: "3040", label: "3040 - Försäljning tjänster" },
    { value: "4010", label: "4010 - Inköp varor" },
    { value: "5010", label: "5010 - Lokalhyra" },
    { value: "5020", label: "5020 - El för lokaler" },
    { value: "5410", label: "5410 - Förbrukningsinventarier" },
    { value: "5420", label: "5420 - Programvara" },
    { value: "5600", label: "5600 - Kostnader för transportmedel" },
    { value: "5800", label: "5800 - Resekostnader" },
    { value: "6071", label: "6071 - Representation, avdragsgill" },
    { value: "6072", label: "6072 - Representation, ej avdragsgill" },
    { value: "6110", label: "6110 - Kontorsmaterial" },
    { value: "6212", label: "6212 - Mobiltelefon" },
    { value: "6250", label: "6250 - Porto" },
    { value: "6310", label: "6310 - Företagsförsäkringar" },
    { value: "6540", label: "6540 - IT-tjänster" },
    { value: "6570", label: "6570 - Bankkostnader" },
    { value: "6990", label: "6990 - Övriga externa kostnader" },
]

const CATEGORIES = [
    "Intäkter",
    "IT & Programvara",
    "Kontorsmaterial",
    "Programvara",
    "Representation",
    "Resor",
    "Material",
    "Lokalhyra",
    "Telefon",
    "Fordon",
    "Porto",
    "Lokalkostnader",
    "Energi",
    "Försäkringar",
    "Övriga kostnader",
]

// ============================================================================
// Types
// ============================================================================

interface BookingDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    transaction: Transaction | null
    aiSuggestion?: AISuggestion | null
    onBook: (booking: BookingData) => Promise<void>
}

export interface BookingData {
    transactionId: string
    useAiSuggestion: boolean
    category: string
    debitAccount: string
    creditAccount: string
    description: string
    attachmentUrl?: string
    attachmentName?: string
}

// ============================================================================
// BookingDialog Component
// ============================================================================

export function BookingDialog({ 
    open, 
    onOpenChange, 
    transaction,
    aiSuggestion,
    onBook,
}: BookingDialogProps) {
    const { text } = useTextMode()
    const [step, setStep] = useState<'details' | 'booking' | 'confirm'>('details')
    const [isLoading, setIsLoading] = useState(false)
    const [uploadedFile, setUploadedFile] = useState<File | null>(null)
    const [uploadPreview, setUploadPreview] = useState<string | null>(null)
    
    // Booking fields - initialized from AI suggestion if available
    const [category, setCategory] = useState(aiSuggestion?.category || '')
    const [debitAccount, setDebitAccount] = useState(aiSuggestion?.account || '6990')
    const [creditAccount, setCreditAccount] = useState('1930')
    const [description, setDescription] = useState('')

    // Sync values when aiSuggestion changes or dialog opens
    useEffect(() => {
        if (open && aiSuggestion) {
            setCategory(aiSuggestion.category || '')
            setDebitAccount(aiSuggestion.account || '6990')
            setCreditAccount('1930')
        }
    }, [open, aiSuggestion])

    // Reset state when dialog opens/closes
    const handleOpenChange = useCallback((newOpen: boolean) => {
        if (!newOpen) {
            setStep('details')
            setUploadedFile(null)
            setUploadPreview(null)
            setCategory(aiSuggestion?.category || '')
            setDebitAccount(aiSuggestion?.account || '6990')
            setCreditAccount('1930')
            setDescription('')
        }
        onOpenChange(newOpen)
    }, [onOpenChange, aiSuggestion])

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setUploadedFile(file)
            // Create preview for images
            if (file.type.startsWith('image/')) {
                const reader = new FileReader()
                reader.onloadend = () => {
                    setUploadPreview(reader.result as string)
                }
                reader.readAsDataURL(file)
            } else {
                setUploadPreview(null)
            }
        }
    }

    const handleBook = async () => {
        if (!transaction) return
        
        setIsLoading(true)
        try {
            const bookingData: BookingData = {
                transactionId: transaction.id,
                useAiSuggestion: !!aiSuggestion,
                category: category,
                debitAccount: debitAccount,
                creditAccount: creditAccount,
                description: description || `Bokföring: ${transaction.name}`,
                attachmentName: uploadedFile?.name,
            }
            
            await onBook(bookingData)
            handleOpenChange(false)
        } catch (error) {
            console.error('Booking failed:', error)
        } finally {
            setIsLoading(false)
        }
    }

    if (!transaction) return null

    const hasAiSuggestion = !!aiSuggestion && aiSuggestion.confidence > 0

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Receipt className="h-5 w-5" />
                        Bokför transaktion
                    </DialogTitle>
                    <DialogDescription>
                        Granska och bokför transaktionen med AI-hjälp eller manuellt
                    </DialogDescription>
                </DialogHeader>

                {/* Progress indicator */}
                <div className="flex items-center gap-2 py-2">
                    <div className={cn(
                        "flex items-center gap-1.5 text-sm",
                        step === 'details' ? "text-primary font-medium" : "text-muted-foreground"
                    )}>
                        <div className={cn(
                            "h-6 w-6 rounded-full flex items-center justify-center text-xs",
                            step === 'details' ? "bg-primary text-primary-foreground" : "bg-muted"
                        )}>1</div>
                        Detaljer
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    <div className={cn(
                        "flex items-center gap-1.5 text-sm",
                        step === 'booking' ? "text-primary font-medium" : "text-muted-foreground"
                    )}>
                        <div className={cn(
                            "h-6 w-6 rounded-full flex items-center justify-center text-xs",
                            step === 'booking' ? "bg-primary text-primary-foreground" : "bg-muted"
                        )}>2</div>
                        Bokföring
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    <div className={cn(
                        "flex items-center gap-1.5 text-sm",
                        step === 'confirm' ? "text-primary font-medium" : "text-muted-foreground"
                    )}>
                        <div className={cn(
                            "h-6 w-6 rounded-full flex items-center justify-center text-xs",
                            step === 'confirm' ? "bg-primary text-primary-foreground" : "bg-muted"
                        )}>3</div>
                        Bekräfta
                    </div>
                </div>

                {/* Step 1: Transaction Details */}
                {step === 'details' && (
                    <div className="space-y-6">
                        {/* Transaction info card */}
                        <div className="rounded-lg border bg-muted/30 p-4 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-start gap-3">
                                    <Building2 className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Leverantör</p>
                                        <p className="font-medium">{transaction.name}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Datum</p>
                                        <p className="font-medium">{transaction.date}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Banknote className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Belopp</p>
                                        <p className={cn(
                                            "font-medium",
                                            transaction.amount.startsWith("+") 
                                                ? "text-green-600" 
                                                : "text-foreground"
                                        )}>{transaction.amount}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CreditCard className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Konto</p>
                                        <p className="font-medium">{transaction.account}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="pt-2 border-t">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Status</span>
                                    <AppStatusBadge status={transaction.status} />
                                </div>
                            </div>
                        </div>

                        {/* Upload underlag */}
                        <div className="space-y-3">
                            <Label className="flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Ladda upp underlag (kvitto/faktura)
                            </Label>
                            
                            {!uploadedFile ? (
                                <UploadDropzone
                                    accept=".pdf,.png,.jpg,.jpeg"
                                    maxSize={10 * 1024 * 1024}
                                    title="Klicka för att ladda upp"
                                    description="eller dra och släpp • PDF, PNG, JPG"
                                    buttonText="Välj fil"
                                    onFilesSelected={(files) => {
                                        if (files[0]) {
                                            const file = files[0]
                                            setUploadedFile(file)
                                            if (file.type.startsWith('image/')) {
                                                const reader = new FileReader()
                                                reader.onload = (e) => setUploadPreview(e.target?.result as string)
                                                reader.readAsDataURL(file)
                                            }
                                        }
                                    }}
                                />
                            ) : (
                                <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                                    {uploadPreview ? (
                                        <img 
                                            src={uploadPreview} 
                                            alt="Preview" 
                                            className="h-16 w-16 object-cover rounded"
                                        />
                                    ) : (
                                        <div className="h-16 w-16 rounded bg-muted flex items-center justify-center">
                                            <FileText className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <p className="font-medium text-sm">{uploadedFile.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {(uploadedFile.size / 1024).toFixed(1)} KB
                                        </p>
                                    </div>
                                    <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => {
                                            setUploadedFile(null)
                                            setUploadPreview(null)
                                        }}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Step 2: Booking details */}
                {step === 'booking' && (
                    <div className="space-y-6">
                        {/* AI Suggestion indicator */}
                        {hasAiSuggestion && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Sparkles className="h-4 w-4 text-violet-600" />
                                <span>Förslag baserat på AI-analys</span>
                            </div>
                        )}

                        {/* Editable booking fields */}
                        <div className="space-y-4 p-4 rounded-lg border bg-muted/30">
                            <div className="space-y-2">
                                <Label>Kategori</Label>
                                <Select value={category} onValueChange={setCategory}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Välj kategori..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CATEGORIES.map(cat => (
                                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>{text.bookkeeping.debit}</Label>
                                    <Select value={debitAccount} onValueChange={setDebitAccount}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Välj konto..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {BAS_ACCOUNTS.map(acc => (
                                                <SelectItem key={acc.value} value={acc.value}>
                                                    {acc.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>{text.bookkeeping.credit}</Label>
                                    <Select value={creditAccount} onValueChange={setCreditAccount}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Välj konto..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {BAS_ACCOUNTS.map(acc => (
                                                <SelectItem key={acc.value} value={acc.value}>
                                                    {acc.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Beskrivning (valfritt)</Label>
                                <Textarea 
                                    placeholder="Lägg till en beskrivning..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Confirmation */}
                {step === 'confirm' && (
                    <div className="space-y-6">
                        <div className="rounded-lg border bg-muted/30 p-4 space-y-4">
                            <h4 className="font-medium flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                Sammanfattning av bokföring
                            </h4>
                            
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <p className="text-muted-foreground">Transaktion</p>
                                    <p className="font-medium">{transaction.name}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Belopp</p>
                                    <p className="font-medium">{transaction.amount}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Kategori</p>
                                    <p className="font-medium">
                                        {bookingMode === 'ai' 
                                            ? (isEditingAI ? editedCategory : aiSuggestion?.category)
                                            : manualCategory}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Bokföringsmetod</p>
                                    <p className="font-medium flex items-center gap-1">
                                        {bookingMode === 'ai' ? (
                                            <>
                                                <Sparkles className="h-3 w-3 text-violet-600" />
                                                AI-rekommendation{isEditingAI && ' (redigerad)'}
                                            </>
                                        ) : (
                                            <>
                                                <Edit3 className="h-3 w-3" />
                                                Manuell
                                            </>
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">{text.bookkeeping.debit}</p>
                                    <p className="font-medium">
                                        {bookingMode === 'ai' 
                                            ? (isEditingAI ? editedDebitAccount : aiSuggestion?.account)
                                            : manualDebitAccount}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">{text.bookkeeping.credit}</p>
                                    <p className="font-medium">
                                        {bookingMode === 'ai'
                                            ? (isEditingAI ? editedCreditAccount : '1930')
                                            : manualCreditAccount}
                                    </p>
                                </div>
                            </div>

                            {uploadedFile && (
                                <div className="pt-3 border-t">
                                    <p className="text-sm text-muted-foreground mb-2">Bifogat underlag</p>
                                    <div className="flex items-center gap-2 text-sm">
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                        <span>{uploadedFile.name}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                            <div className="text-sm">
                                <p className="font-medium text-amber-800 dark:text-amber-200">
                                    Kontrollera uppgifterna
                                </p>
                                <p className="text-amber-700 dark:text-amber-300">
                                    När du bekräftar skapas en verifikation som sparas i bokföringen.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <DialogFooter className="gap-2">
                    {step === 'details' && (
                        <>
                            <Button variant="outline" className="min-w-24" onClick={() => handleOpenChange(false)}>
                                Avbryt
                            </Button>
                            <Button className="min-w-24" onClick={() => setStep('booking')}>
                                Fortsätt
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </>
                    )}
                    
                    {step === 'booking' && (
                        <>
                            <Button variant="outline" className="min-w-24" onClick={() => setStep('details')}>
                                Tillbaka
                            </Button>
                            <Button 
                                className="min-w-24"
                                onClick={() => setStep('confirm')}
                                disabled={bookingMode === 'manual' && !manualCategory}
                            >
                                Fortsätt
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </>
                    )}
                    
                    {step === 'confirm' && (
                        <>
                            <Button variant="outline" onClick={() => setStep('booking')}>
                                Tillbaka
                            </Button>
                            <Button 
                                onClick={handleBook}
                                disabled={isLoading}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Bokför...
                                    </>
                                ) : (
                                    <>
                                        <Check className="h-4 w-4 mr-2" />
                                        Bekräfta bokföring
                                    </>
                                )}
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
