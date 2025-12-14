"use client"

import { TrendingDown } from "lucide-react"
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
} from "@/components/ui/chart"
import { PieChart, Pie } from "recharts"
import {
    expenseCategories,
    expensePieColors,
    expensePieConfig,
} from "./statistics-data"

export function ExpensesTab() {
    const totalExpenses = expenseCategories.reduce((sum, cat) => sum + cat.amount, 0)

    return (
        <div className="space-y-6">
            {/* Pie Chart and Categories */}
            <div className="grid grid-cols-3 gap-6">
                {/* Large Pie Chart */}
                <Card className="flex flex-col">
                    <CardHeader className="items-center pb-0">
                        <CardTitle>Kostnadsfördelning</CardTitle>
                        <CardDescription>Januari - December 2024</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 pb-0">
                        <ChartContainer config={expensePieConfig} className="mx-auto aspect-square max-h-[250px]">
                            <PieChart>
                                <ChartTooltip 
                                    cursor={false} 
                                    content={<ChartTooltipContent hideLabel />} 
                                />
                                <Pie
                                    data={expenseCategories.map((cat, index) => ({
                                        name: Object.keys(expensePieConfig)[index],
                                        value: cat.amount,
                                        fill: expensePieColors[index]
                                    }))}
                                    dataKey="value"
                                    nameKey="name"
                                    stroke="0"
                                />
                            </PieChart>
                        </ChartContainer>
                    </CardContent>
                    <CardFooter className="flex-col gap-2 text-sm">
                        <div className="flex items-center gap-2 font-medium leading-none">
                            {totalExpenses.toLocaleString("sv-SE")} kr totalt <TrendingDown className="h-4 w-4" />
                        </div>
                        <div className="leading-none text-muted-foreground">
                            Visar totala kostnader för hela året
                        </div>
                    </CardFooter>
                </Card>

                {/* Category Details */}
                <div className="col-span-2 space-y-3">
                    <h2 className="text-sm font-medium text-muted-foreground mb-3">Kostnadsfördelning per kategori</h2>
                    {expenseCategories.map((cat, index) => {
                        const Icon = cat.icon
                        return (
                            <Card key={cat.category} className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                        <div 
                                            className="h-10 w-10 rounded-lg flex items-center justify-center"
                                            style={{ backgroundColor: `${expensePieColors[index]}20` }}
                                        >
                                            <Icon className="h-5 w-5" style={{ color: expensePieColors[index] }} />
                                        </div>
                                        <div>
                                            <span className="font-medium">{cat.category}</span>
                                            <p className="text-xs text-muted-foreground">{cat.percentage}% av totala kostnader</p>
                                        </div>
                                    </div>
                                    <span className="text-xl font-semibold">{cat.amount.toLocaleString("sv-SE")} kr</span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-2">
                                    <div
                                        className="h-2 rounded-full transition-all"
                                        style={{ 
                                            width: `${cat.percentage}%`,
                                            backgroundColor: expensePieColors[index]
                                        }}
                                    />
                                </div>
                            </Card>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
