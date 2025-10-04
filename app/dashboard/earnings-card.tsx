"use client"

import {ChartAreaIcon, FileTextIcon, TrendingUp} from "lucide-react"
import {Area, AreaChart, CartesianGrid} from "recharts"

import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,} from "@/components/ui/card"
import {ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent,} from "@/components/ui/chart"
import {Button} from "@/components/ui/button";
import {Separator} from "@/components/ui/separator";


const chartConfig = {
    value: {
        label: "累计收益",
        color: "var(--color-profit)",
    }
} satisfies ChartConfig

export function EarningsCard() {

    const rawData = []

    let x = 0
    for (let i = 0; i < 200; i++) {
        rawData.push({
            date: `234-${i}`,
            value: x
        })

        x = x + Math.random() * 10 - 5
    }

    const sd = {
        "yesterday_earnings": Math.random() * 1000 - 500,
        "total_earnings": Math.random() * 10000 - 5000,
        "earnings_rate": Math.random() * 20 - 10
    }

    // 计算最大值和最小值，用于确定 0 的渐变位置
    const values = rawData.map(d => d.value)
    const maxValue = Math.max(...values)
    const minValue = Math.min(...values)
    const zeroPercent = maxValue / (maxValue - minValue) * 100 // 0 在渐变中的位置百分比

    const moneyFormatter = (value: number | null | undefined) =>
        value !== null && value !== undefined
            ? new Intl.NumberFormat("zh-CN", {
                style: "currency",
                currency: "CNY",
                minimumFractionDigits: 0,   // 最少小数位
                maximumFractionDigits: 2    // 最多小数位
            }).format(value)
            : ""

    return (
        <Card className="pt-4 pb-2 gap-2">
            <CardHeader className="px-4">
                <CardDescription>总金额</CardDescription>
                <CardTitle className="text-2xl">
                    {moneyFormatter(1234567.891233)}
                </CardTitle>
                <Separator className={"my-2"}/>
                <div className="flex items-center w-full space-x-5">
                    <div className="col-span-1">
                        <CardDescription className="text-[11px] underline underline-offset-4">昨日收益</CardDescription>
                        <CardTitle className="text-sm">
                            {moneyFormatter(sd.yesterday_earnings)}
                        </CardTitle>
                    </div>
                    <div className="col-span-1">
                        <CardDescription className="text-[11px] underline underline-offset-4">累计收益</CardDescription>
                        <CardTitle className="text-sm">
                            {moneyFormatter(sd.total_earnings)}
                        </CardTitle>
                    </div>
                    <div className="col-span-1">
                        <CardDescription className="text-[11px] underline underline-offset-4">
                            <div className={`flex items-center ${sd.earnings_rate > 0 ? "text-[var(--color-profit)]" : sd.earnings_rate < 0 ? "text-[var(--color-loss)]" : "text-muted-foreground"}`}>
                                {sd.earnings_rate > 0 ?
                                    <TrendingUp className="mr-1" size={12}/> :
                                    <TrendingUp className="mr-1 rotate-180" size={12}/>}
                                收益率
                            </div>
                        </CardDescription>
                        <div className={`flex items-center`}>
                            <CardTitle className="text-sm">
                                {sd.earnings_rate.toFixed(2)}%
                            </CardTitle>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="px-1">
                <ChartContainer config={chartConfig} className={"h-[150px] w-full"}>
                    <AreaChart
                        accessibilityLayer
                        data={rawData}
                        margin={{
                            left: 10,
                            right: 10,
                        }}
                    >
                        <defs>
                            <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset={0} stopColor="var(--color-profit)" stopOpacity={1}/>
                                <stop offset={`${zeroPercent}%`} stopColor="var(--color-profit)" stopOpacity={0.9}/>
                                <stop offset={`${zeroPercent}%`} stopColor="var(--color-loss)" stopOpacity={0.9}/>
                                <stop offset={100} stopColor="var(--color-loss)" stopOpacity={1}/>
                            </linearGradient>
                        </defs>

                        <CartesianGrid vertical={false}/>

                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="dot" hideLabel hideIndicator/>}
                        />

                        <Area
                            dataKey="value"
                            type="linear"
                            fill="url(#profitGradient)"
                            stroke="url(#profitGradient)"
                            fillOpacity={0.5}
                            connectNulls
                        />
                    </AreaChart>
                </ChartContainer>
            </CardContent>

            <CardFooter className={"px-4"}>
                <div className="flex w-full justify-end space-x-2">
                    <Button variant="outline" size="sm">
                        <FileTextIcon/>
                        交易记录
                    </Button>
                    <Button variant="outline" size="sm">
                        <ChartAreaIcon/>
                        收益明细
                    </Button>
                </div>
            </CardFooter>
        </Card>
    )
}