"use client"

import * as React from "react"
import { Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

export type MeetingType = "annual" | "general"

interface PlanMeetingDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    type: MeetingType
    onSubmit?: (data: any) => void
    defaultAgenda: string[]
}

export function PlanMeetingDialog({
    open,
    onOpenChange,
    type,
    onSubmit,
    defaultAgenda
}: PlanMeetingDialogProps) {
    const isAnnual = type === "annual"
    const title = isAnnual ? "Planera årsmöte" : "Planera bolagsstämma"
    const description = isAnnual
        ? "Skapa ett nytt årsmöte och förbereda dagordning"
        : "Skapa en ny bolagsstämma och förbereda dagordning"

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg" expandable>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Datum</Label>
                            <Input type="date" />
                        </div>
                        {isAnnual ? (
                            <div className="space-y-2">
                                <Label>Tid</Label>
                                <Input type="time" defaultValue="19:00" />
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Label>År</Label>
                                <Input type="number" placeholder="2025" />
                            </div>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label>Plats</Label>
                        <Input placeholder={isAnnual ? "Föreningslokalen, Digitalt via Zoom..." : "Kontoret, Digitalt via Teams..."} />
                    </div>
                    <div className="space-y-2">
                        <Label>{isAnnual ? "Mötestyp" : "Stämmotyp"}</Label>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="flex-1">
                                {isAnnual ? "Ordinarie årsmöte" : "Ordinarie årsstämma"}
                            </Button>
                            <Button variant="outline" size="sm" className="flex-1">
                                {isAnnual ? "Extra årsmöte" : "Extra bolagsstämma"}
                            </Button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Dagordning</Label>
                        <div className="max-h-48 overflow-y-auto border rounded-md p-3 space-y-1">
                            {defaultAgenda.map((item, index) => (
                                <div key={index} className="text-sm flex items-start gap-2">
                                    <span className="text-muted-foreground font-mono">§{index + 1}</span>
                                    <span>{item}</span>
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {isAnnual
                                ? "Standarddagordning enligt föreningens stadgar."
                                : "Standarddagordning enligt ABL. Kan anpassas efter behov."
                            }
                        </p>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Avbryt
                    </Button>
                    <Button onClick={() => {
                        onSubmit?.({})
                        onOpenChange(false)
                    }}>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Skapa med AI-stöd
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
