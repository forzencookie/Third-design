"use client"

import * as React from "react"
import { useState, useEffect, useRef } from "react"
import {
    Calendar,
    UploadCloud,
    FileText,
    CheckCircle2,
    Loader2,
    X,
    Building2,
    Banknote,
    Tag,
    Pencil,
    Check,
    AlertCircle,
    Bot,
    Camera,
    RefreshCw
} from "lucide-react"
import { cn } from "@/lib/utils"
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
import { RECEIPT_STATUSES, type ReceiptStatus } from "@/lib/status-types"
import { AiProcessingState } from "@/components/shared"
import { type Receipt } from "@/data/receipts"

// AI processing states
type AiState = 'idle' | 'processing' | 'preview' | 'error'

// Extended receipt type for form handling
interface UnderlagFormState {
    supplier: string
    date: string
    amount: string
    moms: string
    category: string
    status: ReceiptStatus
    file: File | null
    fileName?: string
}

interface UnderlagDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    mode: "create" | "edit" | "view"
    receipt?: Receipt
    onSave?: (data: UnderlagFormState) => void
}

export function UnderlagDialog({
    open,
    onOpenChange,
    mode = "create",
    receipt,
    onSave
}: UnderlagDialogProps) {
    const [activeTab, setActiveTab] = useState<"manual" | "ai">("manual")
    const [aiState, setAiState] = useState<AiState>('idle')
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const cameraInputRef = useRef<HTMLInputElement>(null)

    const [formState, setFormState] = useState<UnderlagFormState>({
        supplier: "",
        date: new Date().toISOString().split('T')[0],
        amount: "",
        moms: "",
        category: "Övriga kostnader",
        status: RECEIPT_STATUSES.PENDING,
        file: null
    })

    // Reset or populate form when dialog opens
    useEffect(() => {
        if (open) {
            if (receipt && mode !== "create") {
                setFormState({
                    supplier: receipt.supplier,
                    date: receipt.date,
                    amount: receipt.amount,
                    moms: "", // Receipt type doesn't have moms yet, default to empty or calculate if we had it
                    category: receipt.category,
                    status: receipt.status as ReceiptStatus,
                    file: null,
                    fileName: receipt.attachment
                })
                setActiveTab("manual")
            } else {
                setFormState({
                    supplier: "",
                    date: new Date().toISOString().split('T')[0],
                    amount: "",
                    moms: "", // Reset to empty
                    category: "Övriga kostnader",
                    status: RECEIPT_STATUSES.PENDING,
                    file: null
                })
                setActiveTab("manual")
                setAiState('idle')
                setErrorMessage(null)
                setImagePreview(null)
            }
        }
    }, [open, receipt, mode])

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

    // Process file with AI
    const processWithAI = async (file: File) => {
        setAiState('processing')
        setErrorMessage(null)
        generateImagePreview(file)

        try {
            const formData = new FormData()
            formData.append('file', file)

            const response = await fetch('/api/ai/extract-receipt', {
                method: 'POST',
                body: formData
            })

            const result = await response.json()

            if (result.success && result.data) {
                const { supplier, date, amount, moms, category } = result.data

                setFormState(prev => ({
                    ...prev,
                    supplier: supplier?.value || supplier || prev.supplier,
                    date: date?.value || date || prev.date,
                    amount: `${amount?.value || amount} kr` || prev.amount,
                    moms: moms ? `${moms?.value || moms} kr` : prev.moms,
                    category: category?.value || category || prev.category,
                    status: RECEIPT_STATUSES.REVIEW_NEEDED
                }))

                setAiState('preview')

                if (result.warning) {
                    setErrorMessage(result.warning)
                }
            } else {
                throw new Error(result.error || 'Failed to extract data')
            }
        } catch (error) {
            console.error('AI extraction error:', error)
            setErrorMessage('Kunde inte tolka kvittot. Försök igen eller använd manuell inmatning.')
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
        await processWithAI(formState.file!)
    }

    const handleAcceptAi = () => {
        // User approved AI extraction - mark as verified
        onSave?.({ ...formState, status: RECEIPT_STATUSES.VERIFIED })
        onOpenChange(false)
    }

    const handleEditAi = () => {
        setActiveTab("manual")
        setAiState('idle')
    }

    const handleSave = () => {
        // Manual upload/save - user has reviewed, mark as verified
        onSave?.({ ...formState, status: RECEIPT_STATUSES.VERIFIED })
        onOpenChange(false)
    }

    const isViewMode = mode === "view"

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>
                        {mode === "create" ? "Lägg till underlag" :
                            mode === "edit" ? "Redigera underlag" : "Underlag"}
                    </DialogTitle>
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
                    {!isViewMode && (
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
                    )}

                    {/* Manual Tab */}
                    <TabsContent value="manual" className="space-y-4">
                        {!formState.file && !formState.fileName ? (
                            <UploadDropzone
                                onFilesSelected={handleManualFileSelect}
                                accept=".pdf,.jpg,.jpeg,.png"
                                title="Ladda upp underlag"
                                description="Valfritt - bifoga kvitto eller faktura"
                            />
                        ) : (
                            <div className="space-y-2">
                                {imagePreview && (
                                    <div className="relative rounded-lg overflow-hidden border bg-muted/30">
                                        <img
                                            src={imagePreview}
                                            alt="Receipt preview"
                                            className="w-full max-h-32 object-contain"
                                        />
                                    </div>
                                )}
                                {formState.file && (
                                    <FilePreview
                                        file={formState.file}
                                        onRemove={() => {
                                            setFormState(prev => ({ ...prev, file: null, fileName: undefined }))
                                            setImagePreview(null)
                                        }}
                                    />
                                )}
                                {!formState.file && formState.fileName && (
                                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm truncate">{formState.fileName}</span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6"
                                            onClick={() => {
                                                setFormState(prev => ({ ...prev, file: null, fileName: undefined }))
                                                setImagePreview(null)
                                            }}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
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
                                            placeholder="T.ex. Adobe Systems"
                                            disabled={isViewMode}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="date" className="flex items-center gap-2">
                                                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                                Datum
                                            </Label>
                                            <Input
                                                id="date"
                                                type="date"
                                                value={formState.date}
                                                onChange={(e) => setFormState({ ...formState, date: e.target.value })}
                                                disabled={isViewMode}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="amount" className="flex items-center gap-2">
                                                <Banknote className="h-3.5 w-3.5 text-muted-foreground" />
                                                Belopp (inkl. moms)
                                            </Label>
                                            <Input
                                                id="amount"
                                                value={formState.amount}
                                                onChange={(e) => setFormState({ ...formState, amount: e.target.value })}
                                                placeholder="0 kr"
                                                disabled={isViewMode}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="moms" className="flex items-center gap-2">
                                            <Banknote className="h-3.5 w-3.5 text-muted-foreground" />
                                            Varav moms
                                        </Label>
                                        <Input
                                            id="moms"
                                            value={formState.moms}
                                            onChange={(e) => setFormState({ ...formState, moms: e.target.value })}
                                            placeholder="0 kr"
                                            disabled={isViewMode}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="category" className="flex items-center gap-2">
                                            <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                                            Kategori
                                        </Label>
                                        <Select
                                            value={formState.category}
                                            onValueChange={(v) => setFormState({ ...formState, category: v })}
                                            disabled={isViewMode}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Välj kategori" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Övriga kostnader">Övriga kostnader</SelectItem>
                                                <SelectItem value="Kontorsmaterial">Kontorsmaterial</SelectItem>
                                                <SelectItem value="Programvara">Programvara</SelectItem>
                                                <SelectItem value="Resekostnader">Resekostnader</SelectItem>
                                                <SelectItem value="Representation">Representation</SelectItem>
                                                <SelectItem value="IT-utrustning">IT-utrustning</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        )}
                    </TabsContent>

                    {/* AI Tab */}
                    <TabsContent value="ai" className="space-y-4">
                        {aiState === 'idle' && (
                            <div className="space-y-4">
                                <UploadDropzone
                                    onFilesSelected={handleAiFileSelect}
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    title="Ladda upp för AI-skanning"
                                    description="AI läser av all information automatiskt"
                                />

                                {/* Camera button for mobile */}
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
                                    "Analyserar kvittot...",
                                    "Läser av text...",
                                    "Identifierar belopp...",
                                    "Snart klar...",
                                    "Nästan där..."
                                ]}
                                subtext="Leverantör, belopp, datum och moms"
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
                                {/* Success header */}
                                <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800/30">
                                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                                    <p className="font-medium text-green-900 dark:text-green-100 text-sm">Analys klar!</p>
                                </div>

                                {/* Warning */}
                                {errorMessage && (
                                    <div className="flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-950/20 rounded text-xs text-amber-800 dark:text-amber-200">
                                        <AlertCircle className="h-3 w-3 shrink-0" />
                                        {errorMessage}
                                    </div>
                                )}

                                {/* Preview with image */}
                                <div className="flex gap-4">
                                    {/* Image thumbnail */}
                                    {imagePreview && (
                                        <div className="w-24 h-32 rounded-lg overflow-hidden border bg-muted/30 shrink-0">
                                            <img
                                                src={imagePreview}
                                                alt="Receipt"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    )}

                                    {/* Extracted data */}
                                    <div className="flex-1 space-y-3">
                                        <div>
                                            <p className="text-xs text-muted-foreground">Leverantör</p>
                                            <p className="font-medium">{formState.supplier || '—'}</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <p className="text-xs text-muted-foreground">Belopp (inkl. moms)</p>
                                                <p className="font-semibold text-lg">{formState.amount || '—'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">Varav moms</p>
                                                <p className="font-medium">{formState.moms || '—'}</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <p className="text-xs text-muted-foreground">Datum</p>
                                                <p className="text-sm">{formState.date || '—'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">Kategori</p>
                                                <p className="text-sm">{formState.category || '—'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
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
                {(activeTab === 'manual' || isViewMode) && (
                    <DialogFooter className="mt-4">
                        {!isViewMode ? (
                            <>
                                <Button variant="outline" onClick={() => onOpenChange(false)}>
                                    Avbryt
                                </Button>
                                <Button onClick={handleSave}>
                                    Spara underlag
                                </Button>
                            </>
                        ) : (
                            <Button onClick={() => onOpenChange(false)}>
                                Stäng
                            </Button>
                        )}
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    )
}
