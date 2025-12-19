"use client"

import { Suspense } from "react"
import { Activity, Bot, Bell, History, CheckCircle2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useLastUpdated } from "@/hooks/use-last-updated"

// Placeholder activity data
const activities = [
    { id: "1", type: "ai", title: "AI bokförde 3 transaktioner", time: "2 min sedan", icon: Bot },
    { id: "2", type: "action", title: "Momsdeklaration Q4 skickades", time: "1 timme sedan", icon: CheckCircle2 },
    { id: "3", type: "alert", title: "Ny leverantörsfaktura behöver godkännas", time: "3 timmar sedan", icon: Bell },
    { id: "4", type: "ai", title: "AI kategoriserade 5 kvitton", time: "Igår", icon: Bot },
    { id: "5", type: "action", title: "Lönebesked för december skickades", time: "2 dagar sedan", icon: CheckCircle2 },
]

function HandelserPageContent() {
    const lastUpdated = useLastUpdated()

    return (
        <div className="flex flex-col min-h-svh">
            {/* Page Heading */}
            <div className="px-6 pt-6">
                <div className="max-w-4xl w-full">
                    <h2 className="text-xl font-semibold">Händelser</h2>
                    <p className="text-sm text-muted-foreground">Vad har hänt i ditt företag? AI-åtgärder, uppdateringar och händelser.</p>
                </div>
            </div>

            {/* Activity Feed */}
            <div className="px-6 py-6">
                <div className="max-w-4xl w-full space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-muted-foreground" />
                            <span className="font-medium">Aktivitetslogg</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{lastUpdated}</span>
                    </div>

                    <Card className="divide-y">
                        {activities.map((activity) => {
                            const Icon = activity.icon
                            return (
                                <div key={activity.id} className="flex items-start gap-4 p-4 hover:bg-muted/30 transition-colors">
                                    <div className={`p-2 rounded-lg ${activity.type === 'ai' ? 'bg-primary/10 text-primary' : activity.type === 'alert' ? 'bg-amber-500/10 text-amber-600' : 'bg-emerald-500/10 text-emerald-600'}`}>
                                        <Icon className="h-4 w-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium">{activity.title}</p>
                                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                                    </div>
                                </div>
                            )
                        })}
                    </Card>

                    <div className="text-center py-4">
                        <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                            <History className="h-4 w-4 inline mr-1.5" />
                            Visa äldre händelser
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

function HandelserPageLoading() {
    return (
        <div className="flex items-center justify-center h-svh">
            <div className="animate-pulse text-muted-foreground">Laddar...</div>
        </div>
    )
}

export default function HandelserPage() {
    return (
        <Suspense fallback={<HandelserPageLoading />}>
            <HandelserPageContent />
        </Suspense>
    )
}
