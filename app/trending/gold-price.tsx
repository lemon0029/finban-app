"use client"

import {TrendingDown, TrendingUp} from "lucide-react"
import {Area, AreaChart, CartesianGrid, XAxis, YAxis} from "recharts"

import {Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,} from "@/components/ui/card"
import {ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent,} from "@/components/ui/chart"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import {useEffect, useState} from "react";
import {GoldPriceDTO} from "@/lib/types";
import {Spinner} from "@/components/ui/spinner";
import {Badge} from "@/components/ui/badge";


const chartConfig = {
    price: {
        label: "Price",
        color: "var(--color-profit)",
    },
} satisfies ChartConfig

async function fetchGoldPrice(dateRange: string) {
    const response = await fetch("/igoldaccount/golddetail/history-price", {
        method: "POST",
        body: JSON.stringify({month: dateRange}),
        headers: {'Content-Type': 'application/json'}
    });
    return await response.json();
}

function parseYYYYMMDD(str: string) {
    const y = str.slice(0, 4)
    const m = str.slice(4, 6)
    const d = str.slice(6, 8)
    return new Date(`${y}-${m}-${d}`)
}

export default function GoldPrice() {
    const [dateRange, setDateRange] = useState("1")
    const [dataLoading, setDataLoading] = useState(false)
    const [chartData, setChartData] = useState([] as { time: Date; price: number }[])
    const [pctChange, setPctChange] = useState(0)

    useEffect(() => {
        setDataLoading(true)

        fetchGoldPrice(dateRange).then(data => {
            const prices = data["bizResult"]["data"]["priceList"].map((item: GoldPriceDTO) => {
                return {
                    time: parseYYYYMMDD(item.time).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                    }),
                    price: item.price,
                }
            })

            setChartData(prices)

            if (prices.length >= 2) {
                const change = ((prices[prices.length - 1].price - prices[0].price) / prices[0].price) * 100
                setPctChange(change)

                if (change >= 0) {
                    chartConfig.price.color = "var(--color-profit)"
                } else {
                    chartConfig.price.color = "var(--color-loss)"
                }
            }

            setDataLoading(false)
        })
    }, [dateRange])

    const dateRangeLabel = () => {
        switch (dateRange) {
            case "0": return "today";
            case "1": return "the past month";
            case "3": return "the past 3 months";
            case "6": return "the past 6 months";
            case "12": return "the past year";
            default: return "unknown period";
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Gold Price</CardTitle>
                <CardDescription>From China Merchants Bank</CardDescription>
                <CardAction>
                    <Select value={dateRange}
                            onValueChange={(value) => {
                                setDateRange(value);
                            }}>
                        <SelectTrigger className="w-[80px]">
                            <SelectValue/>
                        </SelectTrigger>
                        <SelectContent className="w-[var(--radix-select-trigger-width)] min-w-0">
                            <SelectGroup>
                                <SelectLabel>Period</SelectLabel>
                                <SelectItem value="0">1D</SelectItem>
                                <SelectItem value="1">1M</SelectItem>
                                <SelectItem value="3">3M</SelectItem>
                                <SelectItem value="6">6M</SelectItem>
                                <SelectItem value="12">1Y</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </CardAction>
            </CardHeader>
            <CardContent className={"pl-4 pr-3 relative"}>
                {dataLoading && (<Spinner className={"size-5 absolute left-8 top-2"}/>)}
                <ChartContainer config={chartConfig}>
                    <AreaChart
                        accessibilityLayer
                        data={chartData}
                        margin={{
                            left: 10,
                            right: 10,
                        }}
                    >
                        <defs>
                            <linearGradient id="fillPrice" x1="0" y1="0" x2="0" y2="1">
                                <stop
                                    offset="5%"
                                    stopColor="var(--color-price)"
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="var(--color-price)"
                                    stopOpacity={0.1}
                                />
                            </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false}/>
                        <YAxis domain={['dataMin', 'dataMax']} hide={true}/>
                        <XAxis
                            dataKey="time"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={10}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator={"line"} />}
                        />
                        <Area
                            className="transition-opacity duration-500 ease-in-out"
                            style={{opacity: dataLoading ? 0 : 1}}
                            dataKey="price"
                            type="linear"
                            stroke="var(--color-price)"
                            fill="url(#fillPrice)"
                            strokeWidth={2}
                            dot={false}
                        />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col items-start text-xs lg:text-sm">
                {
                    dataLoading ? (<div className={"flex justify-start items-center text-muted-foreground"}><Spinner className={"mr-2"}/> Updating...</div>) : (
                        <div className="flex gap-2 leading-none font-medium">
                            <div className={"flex justify-start items-center"}>
                                {pctChange > 0 ? <TrendingUp className="h-4 w-4 mr-1"/> : <TrendingDown className={"h-4 w-4 mr-1"}/>}
                                <span>{pctChange >= 0 ? "Trending up" : "Trending down"} by <span className={`text-[${chartConfig.price.color}]`}>{pctChange.toFixed(1)}%</span> in <Badge variant={"outline"}>{dateRangeLabel()}</Badge></span>
                            </div>
                        </div>
                    )
                }
            </CardFooter>
        </Card>
    )
}