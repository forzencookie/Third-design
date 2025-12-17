"use client"

import * as React from "react"
import { useState, useEffect, useRef } from "react"
import {
    Calendar,
    UploadCloud,
    FileText,
    CheckCircle2,
    Building2,
    Banknote,
    Tag,
    Pencil,
    Check,
    AlertCircle,
    Bot,
    Camera,
    RefreshCw,
    Hash,
    CreditCard
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { UploadDropzone, FilePreview } from "@/components/ui/upload-dropzone"
import { AiProcessingState } from "@/components/shared"
import { type SupplierInvoiceStatus } from "@/lib/status-types"

// AI processing states
type AiState = 'idle' | 'processing' | 'preview' | 'error'

// Extended supplier invoice type for form handling
interface SupplierInvoiceFormState {
    supplier: string // Leverantör
    invoiceNumber: string // Fakturanummer
    ocr: string // OCR-nummer
    date: string // Fakturadatum
    dueDate: string // Förfallodatum
    amount: string // Totalt belopp
    vatAmount: string // Momsbelopp
    category: string // Kategori
    status: SupplierInvoiceStatus
    file: File | null
    fileName?: string
}

interface SupplierInvoiceDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSave?: (data: SupplierInvoiceFormState) => void
}

export function SupplierInvoiceDialog({
    open,
    onOpenChange,
    onSave
}: SupplierInvoiceDialogProps) {
    const [activeTab, setActiveTab] = useState<"manual" | "ai">("manual")
    const [aiState, setAiState] = useState<AiState>('idle')
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const cameraInputRef = useRef<HTMLInputElement>(null)

    const [formState, setFormState] = useState<SupplierInvoiceFormState>({
        supplier: "",
        invoiceNumber: "",
        ocr: "",
        date: new Date().toISOString().split('T')[0],
        dueDate: "",
        amount: "",
        vatAmount: "",
        category: "Övriga kostnader",
        status: "Mottagen",
        file: null
    })

    // Calculate due date based on invoice date (default 30 days)
    useEffect(() => {
        if (formState.date && !formState.dueDate) {
            const date = new Date(formState.date)
            date.setDate(date.getDate() + 30)
            setFormState(prev => ({ ...prev, dueDate: date.toISOString().split('T')[0] }))
        }
    }, [formState.date])

    // Reset form when dialog opens
    useEffect(() => {
        if (open) {
            setFormState({
                supplier: "",
                invoiceNumber: "",
                ocr: "",
                date: new Date().toISOString().split('T')[0],
                dueDate: "", // Will be set by effect above
                amount: "",
                vatAmount: "",
                category: "Övriga kostnader",
                status: "Mottagen",
                file: null
            })
            setActiveTab("manual")
            setAiState('idle')
            setErrorMessage(null)
            setImagePreview(null)
        }
    }, [open])

    // Generate image preview when file is selected
    const generateImagePreview = (file: File) => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader()
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string)
            }
            reader.readAsDataURL(file)
        } else {
            setImagePreview(null)
        }
    }

    // Handle file selection for manual mode (no AI)
    const handleManualFileSelect = (files: File[]) => {
        if (files.length > 0) {
            const file = files[0]
            setFormState(prev => ({ ...prev, file }))
            generateImagePreview(file)
        }
    }

    // Process file with AI (Mock for now, using receipt extract as template)
    const processWithAI = async (file: File) => {
        setAiState('processing')
        setErrorMessage(null)
        generateImagePreview(file)

        try {
            // Using existing receipt extraction endpoint for now as a placeholder
            // In a real app, this would point to a specific supplier invoice extraction
            const formData = new FormData()
            formData.append('file', file)

            // Artificial delay to show processing state
            await new Promise(resolve => setTimeout(resolve, 3000))

            // Mock response since we don't have specific invoice extraction yet
            setFormState(prev => ({
                ...prev,
                supplier: "Leverantör AB",
                invoiceNumber: "INV-" + Math.floor(Math.random() * 10000),
                ocr: Math.floor(Math.random() * 1000000000).toString(),
                amount: "12500",
                vatAmount: "2500",
                category: "Konsulttjänster",
                status: "Mottagen"
            }))

            setAiState('preview')

        } catch (error) {
            console.error('AI extraction error:', error)
            setErrorMessage('Kunde inte tolka fakturan. Försök igen eller använd manuell inmatning.')
            setAiState('error')
        }
    }

    // Handle file selection for AI mode
    const handleAiFileSelect = async (files: File[]) => {
        if (files.length === 0) return
        const file = files[0]
        setFormState(prev => ({ ...prev, file }))
        await processWithAI(file)
    }

    // Handle camera capture
    const handleCameraCapture = () => {
        cameraInputRef.current?.click()
    }

    const handleCameraChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (files && files.length > 0) {
            const file = files[0]
            setFormState(prev => ({ ...prev, file }))
            await processWithAI(file)
        }
    }

    // Retry AI processing
    const handleRetry = async () => {
        if (formState.file) {
            await processWithAI(formState.file)
        }
    }

    const handleAcceptAi = () => {
        onSave?.({ ...formState, status: "Mottagen" })
        onOpenChange(false)
    }

    const handleEditAi = () => {
        setActiveTab("manual")
        setAiState('idle')
    }

    const handleSave = () => {
        onSave?.(formState)
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Lägg till leverantörsfaktura</DialogTitle>
                </DialogHeader>

                {/* Hidden camera input for mobile */}
                <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleCameraChange}
                />

                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="manual" className="gap-2">
                            <UploadCloud className="h-4 w-4" />
                            Manuell
                        </TabsTrigger>
                        <TabsTrigger value="ai" className="gap-2">
                            <Bot className="h-4 w-4" />
                            Skanna med AI
                        </TabsTrigger>
                    </TabsList>

                    {/* Manual Tab */}
                    <TabsContent value="manual" className="space-y-4">
                        {!formState.file && !formState.fileName ? (
                            <UploadDropzone
                                onFilesSelected={handleManualFileSelect}
                                accept=".pdf,.jpg,.jpeg,.png"
                                title="Ladda upp faktura"
                                description="Bifoga PDF eller bild på fakturan"
                            />
                        ) : (
                            <div className="space-y-2">
                                {imagePreview && (
                                    <div className="relative rounded-lg overflow-hidden border bg-muted/30">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="w-full max-h-32 object-contain"
                                        />
                                    </div>
                                )}
                                <FilePreview
                                    file={formState.file}
                                    fileName={formState.fileName}
                                    onRemove={() => {
                                        setFormState(prev => ({ ...prev, file: null, fileName: undefined }))
                                        setImagePreview(null)
                                    }}
                                />
                            </div>
                        )}

                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="supplier" className="flex items-center gap-2">
                                    <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                                    Leverantör
                                </Label>
                                <Input
                                    id="supplier"
                                    value={formState.supplier}
                                    onChange={(e) => setFormState({ ...formState, supplier: e.target.value })}
                                    placeholder="T.ex. Leverantör AB"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="invoiceNumber" className="flex items-center gap-2">
                                        <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                                        Fakturanummer
                                    </Label>
                                    <Input
                                        id="invoiceNumber"
                                        value={formState.invoiceNumber}
                                        onChange={(e) => setFormState({ ...formState, invoiceNumber: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="ocr" className="flex items-center gap-2">
                                        <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                                        OCR-nummer
                                    </Label>
                                    <Input
                                        id="ocr"
                                        value={formState.ocr}
                                        onChange={(e) => setFormState({ ...formState, ocr: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="date" className="flex items-center gap-2">
                                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                        Fakturadatum
                                    </Label>
                                    <Input
                                        id="date"
                                        type="date"
                                        value={formState.date}
                                        onChange={(e) => setFormState({ ...formState, date: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="dueDate" className="flex items-center gap-2">
                                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                        Förfallodatum
                                    </Label>
                                    <Input
                                        id="dueDate"
                                        type="date"
                                        value={formState.dueDate}
                                        onChange={(e) => setFormState({ ...formState, dueDate: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="amount" className="flex items-center gap-2">
                                        <Banknote className="h-3.5 w-3.5 text-muted-foreground" />
                                        Totalbelopp
                                    </Label>
                                    <Input
                                        id="amount"
                                        value={formState.amount}
                                        onChange={(e) => setFormState({ ...formState, amount: e.target.value })}
                                        placeholder="0 kr"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="vatAmount" className="flex items-center gap-2">
                                        <Banknote className="h-3.5 w-3.5 text-muted-foreground" />
                                        Momsbelopp
                                    </Label>
                                    <Input
                                        id="vatAmount"
                                        value={formState.vatAmount}
                                        onChange={(e) => setFormState({ ...formState, vatAmount: e.target.value })}
                                        placeholder="0 kr"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="category" className="flex items-center gap-2">
                                    <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                                    Kategori
                                </Label>
                                <Select
                                    value={formState.category}
                                    onValueChange={(v) => setFormState({ ...formState, category: v })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Välj kategori" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Övriga kostnader">Övriga kostnader</SelectItem>
                                        <SelectItem value="Kontorsmaterial">Kontorsmaterial</SelectItem>
                                        <SelectItem value="Programvara">Programvara</SelectItem>
                                        <SelectItem value="Konsulttjänster">Konsulttjänster</SelectItem>
                                        <SelectItem value="Hyra">Hyra</SelectItem>
                                        <SelectItem value="Inköp material">Inköp material</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="pt-4 border-t">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label className="text-base">Avtal & Abonnemang</Label>
                                            <p className="text-xs text-muted-foreground">
                                                Koppla denna faktura till ett avtal för bättre koll på uppsägningstider.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="bg-muted/30 border rounded-lg p-4 space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="contract-type" className="text-xs text-muted-foreground">Typ av avtal</Label>
                                                <Select defaultValue="tillsvidare">
                                                    <SelectTrigger id="contract-type" className="h-8">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="tillsvidare">Tillsvidare</SelectItem>
                                                        <SelectItem value="visstid">Visstid</SelectItem>
                                                        <SelectItem value="engangs">Projekt / Engångs</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="notice-period" className="text-xs text-muted-foreground">Uppsägningstid</Label>
                                                <Select defaultValue="3">
                                                    <SelectTrigger id="notice-period" className="h-8">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="0">Ingen</SelectItem>
                                                        <SelectItem value="1">1 månad</SelectItem>
                                                        <SelectItem value="3">3 månader</SelectItem>
                                                        <SelectItem value="6">6 månader</SelectItem>
                                                        <SelectItem value="12">12 månader</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="grid gap-2">
                                            <Label className="text-xs text-muted-foreground">Avtalsdokument (PDF)</Label>
                                            <div className="flex items-center gap-3">
                                                <Button variant="outline" size="sm" className="h-8 gap-2 w-full justify-start text-muted-foreground font-normal">
                                                    <UploadCloud className="h-3.5 w-3.5" />
                                                    Ladda upp avtal...
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    {/* AI Tab */}
                    <TabsContent value="ai" className="space-y-4">
                        {aiState === 'idle' && (
                            <div className="space-y-4">
                                <UploadDropzone
                                    onFilesSelected={handleAiFileSelect}
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    title="Ladda upp för AI-skanning"
                                    description="AI läser av leverantör, belopp, OCR och datum automatiskt"
                                />
                                <div className="flex justify-center">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleCameraCapture}
                                        className="gap-2"
                                    >
                                        <Camera className="h-4 w-4" />
                                        Ta foto med kamera
                                    </Button>
                                </div>
                            </div>
                        )}

                        {aiState === 'processing' && (
                            <AiProcessingState
                                messages={[
                                    "Analyserar faktura...",
                                    "Läser av leverantör...",
                                    "Identifierar OCR-nummer...",
                                    "Kontrollerar belopp och moms...",
                                    "Snart klar..."
                                ]}
                                subtext="Leverantör, fakturanummer, OCR och belopp"
                            />
                        )}

                        {aiState === 'error' && (
                            <div className="space-y-4 py-6">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                        <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                                    </div>
                                    <div className="text-center">
                                        <h3 className="font-semibold">Tolkning misslyckades</h3>
                                        <p className="text-sm text-muted-foreground mt-1">{errorMessage}</p>
                                    </div>
                                </div>
                                <div className="flex gap-3 justify-center">
                                    <Button variant="outline" onClick={handleRetry} className="gap-2">
                                        <RefreshCw className="h-4 w-4" />
                                        Försök igen
                                    </Button>
                                    <Button variant="outline" onClick={() => setActiveTab('manual')}>
                                        Fyll i manuellt
                                    </Button>
                                </div>
                            </div>
                        )}

                        {aiState === 'preview' && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800/30">
                                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                                    <p className="font-medium text-green-900 dark:text-green-100 text-sm">Analys klar! Kontrollera uppgifterna.</p>
                                </div>

                                <div className="flex gap-4">
                                    {imagePreview && (
                                        <div className="w-24 h-32 rounded-lg overflow-hidden border bg-muted/30 shrink-0">
                                            <img
                                                src={imagePreview}
                                                alt="Invoice"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    )}

                                    <div className="flex-1 space-y-3">
                                        <div>
                                            <p className="text-xs text-muted-foreground">Leverantör</p>
                                            <p className="font-medium">{formState.supplier || '—'}</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <p className="text-xs text-muted-foreground">OCR / Fakturanr</p>
                                                <p className="font-mono text-sm">{formState.ocr || formState.invoiceNumber || '—'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">Totalt belopp</p>
                                                <p className="font-semibold">{formState.amount ? `${formState.amount} kr` : '—'}</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <p className="text-xs text-muted-foreground">Förfallodatum</p>
                                                <p className="text-sm">{formState.dueDate || '—'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">Moms</p>
                                                <p className="text-sm">{formState.vatAmount ? `${formState.vatAmount} kr` : '—'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <Button variant="outline" className="flex-1 gap-2" onClick={handleEditAi}>
                                        <Pencil className="h-4 w-4" />
                                        Redigera
                                    </Button>
                                    <Button className="flex-1 gap-2 bg-green-600 hover:bg-green-700" onClick={handleAcceptAi}>
                                        <Check className="h-4 w-4" />
                                        Godkänn
                                    </Button>
                                </div>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>

                {/* Footer for manual tab */}
                {activeTab === 'manual' && (
                    <DialogFooter className="mt-4">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Avbryt
                        </Button>
                        <Button onClick={handleSave}>
                            Spara faktura
                        </Button>
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    )
}
