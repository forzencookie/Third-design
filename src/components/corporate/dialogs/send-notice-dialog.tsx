"use client"

import * as React from "react"
import {
    Users,
    FileText,
    Megaphone,
    Send,
    Sparkles
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

export type NoticeVariant = "association" | "corporate"

interface SendNoticeDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    variant: NoticeVariant
    recipientCount: number
    onSubmit?: () => void
}

export function SendNoticeDialog({
    open,
    onOpenChange,
    variant,
    recipientCount,
    onSubmit
}: SendNoticeDialogProps) {
    const isAssociation = variant === "association"
    const title = isAssociation ? "Skicka kallelse till årsmöte" : "Skicka kallelse till bolagsstämma"
    const recipientType = isAssociation ? "aktiva medlemmar" : "aktieägare"

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg" expandable>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                        Skicka ut kallelse till alla {isAssociation ? "medlemmar" : "aktieägare"}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                        <div>
                            <p className="font-medium">Mottagare</p>
                            <p className="text-sm text-muted-foreground">
                                {recipientCount} {recipientType} kommer få kallelse
                            </p>
                        </div>
                        <Users className="h-8 w-8 text-muted-foreground" />
                    </div>

                    <div className="space-y-2">
                        <Label>Skicka via</Label>
                        <div className="grid grid-cols-2 gap-2">
                            <Button variant="outline" className="justify-start">
                                <FileText className="h-4 w-4 mr-2" />
                                E-post
                            </Button>
                            {isAssociation ? (
                                <Button variant="outline" className="justify-start">
                                    <Megaphone className="h-4 w-4 mr-2" />
                                    Nyhetsbrev
                                </Button>
                            ) : (
                                <Button variant="outline" className="justify-start">
                                    <Send className="h-4 w-4 mr-2" />
                                    Rekommenderat brev
                                </Button>
                            )}
                        </div>
                    </div>

                    {isAssociation && (
                        <div className="space-y-2">
                            <Label>Bifoga</Label>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" id="attach-agenda" defaultChecked />
                                    <label htmlFor="attach-agenda" className="text-sm">Dagordning</label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" id="attach-motions" defaultChecked />
                                    <label htmlFor="attach-motions" className="text-sm">Motioner med styrelsens yttranden</label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" id="attach-report" />
                                    <label htmlFor="attach-report" className="text-sm">Verksamhetsberättelse</label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" id="attach-economy" />
                                    <label htmlFor="attach-economy" className="text-sm">Ekonomisk rapport</label>
                                </div>
                            </div>
                        </div>
                    )}

                    <Card className="bg-muted/50">
                        <CardContent className="pt-4">
                            <div className="flex items-start gap-2">
                                <Sparkles className="h-4 w-4 mt-0.5 text-primary" />
                                <div className="text-sm">
                                    <p className="font-medium">AI-genererad kallelse</p>
                                    <p className="text-muted-foreground">
                                        {isAssociation
                                            ? "Låt AI skapa kallelse med tydlig information om tid, plats och dagordning."
                                            : "Låt AI skapa kallelse baserat på bolagets data, inklusive årsredovisning och förslag till beslut."}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Avbryt
                    </Button>
                    <Button onClick={() => {
                        onSubmit?.()
                        onOpenChange(false)
                    }}>
                        <Send className="h-4 w-4 mr-2" />
                        Förhandsgranska kallelse
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
