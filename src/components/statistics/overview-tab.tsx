"use client"

import * as React from "react"
import { Wallet, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { StatCard, StatCardGrid } from "@/components/ui/stat-card"
import { Card } from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
} from "@/components/ui/chart"
import {
    AreaChart,
    Area,
    XAxis,
    CartesianGrid,
} from "recharts"
import {
    termExplanations,
    financialHealth,
    accounts,
    revenueChartConfig,
    timeRangeOptions,
    filterDataByTimeRange,
} from "./statistics-data"

export function OverviewTab() {
    const [timeRange, setTimeRange] = React.useState("12m")
    
    const filteredRevenueData = React.useMemo(() => {
        return filterDataByTimeRange(timeRange)
    }, [timeRange])

    return (
        <div className="space-y-6">
            {/* Financial Health KPIs */}
            <div>
                <StatCardGrid columns={4}>
                    {financialHealth.map((kpi) => (
                        <StatCard
                            key={kpi.label}
                            label={kpi.label}
                            value={kpi.value}
                            icon={kpi.icon}
                            tooltip={termExplanations[kpi.label]}
                            change={kpi.change}
                            changeType={kpi.positive ? "positive" : "negative"}
                            subtitle={kpi.subtitle}
                        />
                    ))}
                </StatCardGrid>
            </div>

            {/* Revenue Trend Chart */}
            <div className="pt-6 border-t-2 border-border/60">
                <div className="flex items-center gap-2 space-y-0 pb-5 sm:flex-row">
                    <div className="grid flex-1 gap-1">
                        <h3 className="font-semibold leading-none tracking-tight">Intäkter & Kostnader 2024</h3>
                        <p className="text-sm text-muted-foreground">
                            Visar intäkter och kostnader över tid
                        </p>
                    </div>
                    <Select value={timeRange} onValueChange={setTimeRange}>
                        <SelectTrigger
                            className="hidden w-[180px] rounded-lg border-2 border-border/60 sm:ml-auto sm:flex"
                            aria-label="Välj tidsperiod"
                        >
                            <SelectValue placeholder="Senaste 12 månader" />
                        </SelectTrigger>
                        <SelectContent className="rounded-lg border-2 border-border/60">
                            {timeRangeOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value} className="rounded-lg">
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="pt-4">
                    <ChartContainer config={revenueChartConfig} className="aspect-auto h-[250px] w-full">
                        <AreaChart data={filteredRevenueData}>
                            <defs>
                                <linearGradient id="fillIntakter" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--color-intäkter)" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="var(--color-intäkter)" stopOpacity={0.1} />
                                </linearGradient>
                                <linearGradient id="fillKostnader" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--color-kostnader)" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="var(--color-kostnader)" stopOpacity={0.1} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid vertical={false} />
                            <XAxis 
                                dataKey="month" 
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                minTickGap={32}
                            />
                            <ChartTooltip 
                                cursor={false} 
                                content={
                                    <ChartTooltipContent 
                                        labelFormatter={(value) => value}
                                        indicator="dot"
                                    />
                                } 
                            />
                            <Area 
                                dataKey="kostnader"
                                type="natural" 
                                fill="url(#fillKostnader)"
                                stroke="var(--color-kostnader)" 
                                stackId="a"
                            />
                            <Area 
                                dataKey="intäkter"
                                type="natural" 
                                fill="url(#fillIntakter)"
                                stroke="var(--color-intäkter)" 
                                stackId="a"
                            />
                            <ChartLegend content={<ChartLegendContent />} />
                        </AreaChart>
                    </ChartContainer>
                </div>
                <div className="flex-col gap-2 text-sm pt-4 flex items-center">
                    <div className="flex items-center gap-2 font-medium leading-none">
                        Årsresultat: +713 000 kr <TrendingUp className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div className="leading-none text-muted-foreground">
                        +18% jämfört med förra året
                    </div>
                </div>
            </div>

            {/* Account Balances */}
            <div className="pt-6 border-t-2 border-border/60">
                <div className="grid grid-cols-3 gap-4">
                    {accounts.map((account) => (
                        <Card key={account.name} className="p-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-muted-foreground">{account.name}</span>
                                <Wallet className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="mt-2">
                                <span className="text-2xl font-bold">{account.balance.toLocaleString("sv-SE")} kr</span>
                                {account.change !== "0" && (
                                    <span className={cn(
                                        "ml-2 text-sm",
                                        account.change.startsWith("+") ? "text-emerald-600" : "text-rose-600"
                                    )}>
                                        {account.change} kr
                                    </span>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}
