"use client"

import { AppSidebar, MobileBottomNav } from "@/components/layout"
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"
import { AIChatProvider } from "@/providers/ai-chat-provider"
import { ToastProvider } from "@/components/ui/toast"
import { CompanyProvider } from "@/providers/company-provider"
import { TextModeProvider } from "@/providers/text-mode-provider"

export default function AIWorkspaceLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <TextModeProvider>
            <CompanyProvider>
                <AIChatProvider>
                    <ToastProvider>
                        <SidebarProvider>
                            <AppSidebar variant="minimal" />
                            <SidebarInset>
                                {children}
                            </SidebarInset>
                        </SidebarProvider>
                        <MobileBottomNav />
                    </ToastProvider>
                </AIChatProvider>
            </CompanyProvider>
        </TextModeProvider>
    )
}
// Forced rebuild to clear generic ReferenceError cache
