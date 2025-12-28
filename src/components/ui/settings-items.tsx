"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Check } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { LogOut, Laptop, Smartphone } from "lucide-react"

/**
 * SettingsPageHeader - Page header with title and description
 */
export interface SettingsPageHeaderProps {
    title: string
    description: string
}

export function SettingsPageHeader({ title, description }: SettingsPageHeaderProps) {
    return (
        <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
    )
}

/**
 * SettingsFormField - Reusable form field with label and input
 */
export interface SettingsFormFieldProps {
    id: string
    label: string
    type?: string
    placeholder?: string
    defaultValue?: string
    value?: string
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
    className?: string
}

export function SettingsFormField({
    id,
    label,
    type = "text",
    placeholder,
    defaultValue,
    value,
    onChange,
    className,
}: SettingsFormFieldProps) {
    return (
        <div className={cn("grid gap-2", className)}>
            <Label htmlFor={id}>{label}</Label>
            <Input
                id={id}
                type={type}
                placeholder={placeholder}
                defaultValue={defaultValue}
                value={value}
                onChange={onChange}
            />
        </div>
    )
}

/**
 * SettingsSaveButton - Save button aligned to the right
 */
export interface SettingsSaveButtonProps {
    label?: string
    onClick?: () => void
    disabled?: boolean
}

export function SettingsSaveButton({
    label = "Spara ändringar",
    onClick,
    disabled,
}: SettingsSaveButtonProps) {
    return (
        <div className="flex justify-end">
            <Button size="sm" onClick={onClick} disabled={disabled}>
                {label}
            </Button>
        </div>
    )
}

/**
 * SettingsToggle - Simple toggle without icon (for accessibility settings etc)
 */
export interface SettingsToggleProps {
    label: string
    description?: string
    checked?: boolean
    onCheckedChange?: (checked: boolean) => void
    disabled?: boolean
}

export function SettingsToggle({
    label,
    description,
    checked,
    onCheckedChange,
    disabled,
}: SettingsToggleProps) {
    return (
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium">{label}</p>
                {description && (
                    <p className="text-xs text-muted-foreground">{description}</p>
                )}
            </div>
            <Switch
                checked={checked}
                onCheckedChange={onCheckedChange}
                disabled={disabled}
            />
        </div>
    )
}

/**
 * SettingsToggleItem - A toggle row for settings with icon, label, description
 */
export interface SettingsToggleItemProps {
    icon: LucideIcon
    label: string
    description?: string
    checked?: boolean
    onCheckedChange?: (checked: boolean) => void
    disabled?: boolean
}

export function SettingsToggleItem({
    icon: Icon,
    label,
    description,
    checked,
    onCheckedChange,
    disabled,
}: SettingsToggleItemProps) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <div>
                    <p className="text-sm font-medium">{label}</p>
                    {description && (
                        <p className="text-xs text-muted-foreground">{description}</p>
                    )}
                </div>
            </div>
            <Switch
                checked={checked}
                onCheckedChange={onCheckedChange}
                disabled={disabled}
            />
        </div>
    )
}

/**
 * IntegrationCard - Card for showing integration status
 */
export interface IntegrationCardProps {
    name: string
    description: string
    connected?: boolean
    comingSoon?: boolean
    onConnect?: () => void
    onDisconnect?: () => void
}

export function IntegrationCard({
    name,
    description,
    connected = false,
    comingSoon = false,
    onConnect,
    onDisconnect,
}: IntegrationCardProps) {
    return (
        <div className="flex items-center justify-between rounded-lg border-2 border-border/60 p-4">
            <div>
                <p className="font-medium text-sm">{name}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
            </div>
            {comingSoon ? (
                <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                    Kommer snart
                </span>
            ) : (
                <Button
                    variant={connected ? "outline" : "default"}
                    size="sm"
                    onClick={connected ? onDisconnect : onConnect}
                >
                    {connected ? "Ansluten" : "Anslut"}
                </Button>
            )}
        </div>
    )
}

/**
 * BillingHistoryRow - Row for billing history table
 */
export interface BillingHistoryRowProps {
    date: string
    amount: string
    status: "Betald" | "Obetald" | "Väntande"
}

export function BillingHistoryRow({
    date,
    amount,
    status,
}: BillingHistoryRowProps) {
    const statusColors = {
        "Betald": "text-green-600 dark:text-green-400",
        "Obetald": "text-red-600 dark:text-red-400",
        "Väntande": "text-yellow-600 dark:text-yellow-400",
    }

    return (
        <div className="flex items-center justify-between text-sm py-2 border-b last:border-0">
            <span className="text-muted-foreground">{date}</span>
            <span>{amount}</span>
            <span className={statusColors[status]}>{status}</span>
        </div>
    )
}

/**
 * ThemeButton - Button for theme selection
 */
export interface ThemeButtonProps {
    value: string
    label: string
    icon: LucideIcon
    selected?: boolean
    onClick?: () => void
}

export function ThemeButton({
    label,
    icon: Icon,
    selected = false,
    onClick,
}: ThemeButtonProps) {
    return (
        <Button
            variant="outline"
            className={cn(
                "h-auto py-4 flex flex-col items-center gap-2",
                selected && "border-primary bg-primary/5 ring-2 ring-primary"
            )}
            onClick={onClick}
        >
            <Icon className="h-5 w-5" />
            <span className="text-sm">{label}</span>
        </Button>
    )
}

/**
 * SessionCard - Card showing active session
 */
export interface SessionCardProps {
    device: string
    location: string
    isCurrent?: boolean
    deviceType?: "desktop" | "mobile"
    onLogout?: () => void
}

export function SessionCard({
    device,
    location,
    isCurrent = false,
    deviceType = "desktop",
    onLogout,
}: SessionCardProps) {
    const DeviceIcon = deviceType === "mobile" ? Smartphone : Laptop

    return (
        <div className="flex items-center justify-between rounded-lg border-2 border-border/60 p-3">
            <div className="flex items-center gap-3">
                <DeviceIcon className="h-4 w-4 text-muted-foreground" />
                <div>
                    <p className="text-sm font-medium">
                        {device}
                        {isCurrent && (
                            <span className="ml-2 text-xs text-green-600 dark:text-green-400">
                                (denna enhet)
                            </span>
                        )}
                    </p>
                    <p className="text-xs text-muted-foreground">{location}</p>
                </div>
            </div>
            {!isCurrent && onLogout && (
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={onLogout}
                >
                    <LogOut className="h-4 w-4" />
                </Button>
            )}
        </div>
    )
}

/**
 * KeyboardShortcut - Display a keyboard shortcut
 */
export interface KeyboardShortcutProps {
    action: string
    keys: string
}

export function KeyboardShortcut({
    action,
    keys,
}: KeyboardShortcutProps) {
    return (
        <div className="flex items-center justify-between py-1">
            <span className="text-muted-foreground">{action}</span>
            <kbd className="bg-muted px-2 py-1 rounded text-xs tabular-nums">{keys}</kbd>
        </div>
    )
}

/**
 * SettingsSection - Section wrapper with title and description
 */
export interface SettingsSectionProps {
    title: string
    description?: string
    children: React.ReactNode
    className?: string
}

export function SettingsSection({
    title,
    description,
    children,
    className,
}: SettingsSectionProps) {
    return (
        <div className={cn("space-y-4", className)}>
            {(title || description) && (
                <div>
                    {title && <h4 className="text-sm font-medium">{title}</h4>}
                    {description && (
                        <p className="text-xs text-muted-foreground">{description}</p>
                    )}
                </div>
            )}
            {children}
        </div>
    )
}

/**
 * ModeButton - Selectable mode button (for Enkel/Avancerad mode)
 */
export interface ModeButtonProps {
    label: string
    description: string
    selected?: boolean
    onClick?: () => void
}

export function ModeButton({
    label,
    description,
    selected = false,
    onClick,
}: ModeButtonProps) {
    return (
        <Button
            variant="outline"
            className={cn(
                "h-auto py-4 flex flex-col items-center gap-2 transition-all",
                selected && "border-primary bg-primary/5 ring-2 ring-primary"
            )}
            onClick={onClick}
        >
            <span className="text-base font-medium">{label}</span>
            <span className="text-xs text-muted-foreground text-center">{description}</span>
            {selected && <Check className="h-4 w-4 text-primary" />}
        </Button>
    )
}

/**
 * BorderedSection - Reusable bordered container with consistent styling
 * Use this for any section that needs the standard border treatment
 */
export interface BorderedSectionProps {
    children: React.ReactNode
    className?: string
}

export function BorderedSection({ children, className }: BorderedSectionProps) {
    return (
        <div className={cn("rounded-lg border-2 border-border/60 p-3", className)}>
            {children}
        </div>
    )
}

/**
 * PropertyRow - A row displaying a label with icon and value
 * Commonly used in detail dialogs and summary panels
 */
export interface PropertyRowProps {
    icon: LucideIcon
    label: string
    children: React.ReactNode
    showBorder?: boolean
}

export function PropertyRow({
    icon: Icon,
    label,
    children,
    showBorder = true,
}: PropertyRowProps) {
    return (
        <div className={cn(
            "flex items-center justify-between py-2",
            showBorder && "border-b border-border/40 last:border-0"
        )}>
            <div className="flex items-center gap-2 text-muted-foreground">
                <Icon className="h-4 w-4" />
                <span className="text-sm">{label}</span>
            </div>
            <div>
                {children}
            </div>
        </div>
    )
}
