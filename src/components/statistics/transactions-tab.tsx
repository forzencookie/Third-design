"use client"

import { TrendingUp } from "lucide-react"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
} from "@/components/ui/chart"
import {
    PieChart,
    Pie,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
} from "recharts"
import {
    transactionStats,
    invoiceStats,
    transactionPieData,
    transactionPieConfig,
    invoicePieData,
    invoicePieConfig,
    barChartConfig,
    monthlyRevenueData,
} from "./statistics-data"

export function TransactionsTab() {
    return (
        <div className="space-y-6">
            {/* Pie Charts Row */}
            <div className="grid grid-cols-2 gap-6">
                {/* Transaction Pie Chart */}
                <Card className="flex flex-col">
                    <CardHeader className="items-center pb-0">
                        <CardTitle>Transaktionsstatus</CardTitle>
                        <CardDescription>{transactionStats.total} transaktioner totalt</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 pb-0">
                        <ChartContainer config={transactionPieConfig} className="mx-auto aspect-square max-h-[250px]">
                            <PieChart>
                                <ChartTooltip 
                                    cursor={false} 
                                    content={<ChartTooltipContent hideLabel />} 
                                />
                                <Pie
                                    data={transactionPieData}
                                    dataKey="value"
                                    nameKey="name"
                                    stroke="0"
                                />
                            </PieChart>
                        </ChartContainer>
                    </CardContent>
                    <CardFooter className="flex-col gap-2 text-sm">
                        <div className="flex items-center gap-2 font-medium leading-none">
                            {transactionStats.recorded} bokförda ({Math.round((transactionStats.recorded / transactionStats.total) * 100)}%)
                        </div>
                        <div className="leading-none text-muted-foreground">
                            {transactionStats.pending} att bokföra · {transactionStats.missingDocs} saknar underlag
                        </div>
                    </CardFooter>
                </Card>

                {/* Invoice Pie Chart */}
                <Card className="flex flex-col">
                    <CardHeader className="items-center pb-0">
                        <CardTitle>Fakturastatus</CardTitle>
                        <CardDescription>{invoiceStats.sent} fakturor skickade</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 pb-0">
                        <ChartContainer config={invoicePieConfig} className="mx-auto aspect-square max-h-[250px]">
                            <PieChart>
                                <ChartTooltip 
                                    cursor={false} 
                                    content={<ChartTooltipContent hideLabel />} 
                                />
                                <Pie
                                    data={invoicePieData}
                                    dataKey="value"
                                    nameKey="name"
                                    stroke="0"
                                />
                            </PieChart>
                        </ChartContainer>
                    </CardContent>
                    <CardFooter className="flex-col gap-2 text-sm">
                        <div className="flex items-center gap-2 font-medium leading-none">
                            {invoiceStats.totalValue.toLocaleString("sv-SE")} kr fakturerat <TrendingUp className="h-4 w-4 text-emerald-500" />
                        </div>
                        <div className="leading-none text-muted-foreground">
                            {invoiceStats.paid} betalda · {invoiceStats.overdue} förfallna
                        </div>
                    </CardFooter>
                </Card>
            </div>

            {/* Monthly Bar Chart */}
            <div className="pt-6 border-t-2 border-border/60">
                <div className="flex items-center gap-2 space-y-0 pb-5 sm:flex-row">
                    <div className="grid flex-1 gap-1">
                        <h3 className="font-semibold leading-none tracking-tight">Månatlig jämförelse</h3>
                        <p className="text-sm text-muted-foreground">
                            Intäkter och kostnader per månad
                        </p>
                    </div>
                </div>
                <div className="pt-4">
                    <ChartContainer config={barChartConfig} className="aspect-auto h-[240px] w-full [&_.recharts-bar-rectangle]:transition-all [&_.recharts-bar-rectangle]:duration-150 [&_.recharts-active-bar]:!stroke-foreground [&_.recharts-active-bar]:!stroke-2">
                        <BarChart data={monthlyRevenueData.slice(-12)} barGap={2}>
                            <CartesianGrid vertical={false} />
                            <XAxis 
                                dataKey="month" 
                                tickLine={false}
                                axisLine={false}
                                tickMargin={10}
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tickMargin={10}
                                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                                width={45}
                            />
                            <ChartTooltip 
                                cursor={false}
                                content={<ChartTooltipContent indicator="dashed" />} 
                            />
                            <Bar 
                                dataKey="intäkter" 
                                fill="var(--color-intäkter)" 
                                radius={4}
                            />
                            <Bar 
                                dataKey="kostnader" 
                                fill="var(--color-kostnader)" 
                                radius={4}
                            />
                            <ChartLegend content={<ChartLegendContent />} />
                        </BarChart>
                    </ChartContainer>
                </div>
            </div>
        </div>
    )
}
