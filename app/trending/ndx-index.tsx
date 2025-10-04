"use client"

import {TrendingDown, TrendingUp} from "lucide-react"
import {Area, AreaChart, CartesianGrid, ReferenceLine, XAxis, YAxis} from "recharts"

import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,} from "@/components/ui/card"
import {ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent,} from "@/components/ui/chart"
import {useEffect, useState} from "react";
import {Spinner} from "@/components/ui/spinner";
import {Badge} from "@/components/ui/badge";


const NDXChartConfig = {
    price: {
        label: "Price",
        color: "var(--chart-2)",
    },
} satisfies ChartConfig

async function fetchData() {
    const response = await fetch("/api/quote/NDX/chart?assetclass=index");
    return await response.json();
}

export default function NDXIndex() {
    const [dataLoading, setDataLoading] = useState(false)
    const [chartData, setChartData] = useState([] as { time: string; price: string }[])
    const [pctChange, setPctChange] = useState(0)
    const [timeAsOf, setTimeAsOf] = useState("")
    const [previousClose, setPreviousClose] = useState(0)

    useEffect(() => {
        setDataLoading(true)

        fetchData().then(data => {
            const sortedData = data["data"]["chart"].sort((a: never, b: never) => a["x"] - b["x"]);
            const prices = sortedData.map((item: never) => {
                return {
                    time: item["z"]["dateTime"],
                    price: item["y"],
                }
            })

            setChartData(prices)
            setPreviousClose(parseFloat(data["data"]["previousClose"].replace(/,/g, '')))
            setTimeAsOf(data["data"]["timeAsOf"])
            setPctChange(data["data"]["percentageChange"])
            setDataLoading(false)
        })
    }, [])

    return (
        <Card>
            <CardHeader>
                <CardTitle>NDX</CardTitle>
                <CardDescription>The Nasdaq-100 Index</CardDescription>
            </CardHeader>
            <CardContent className={"pl-4 pr-3 relative"}>
                {dataLoading && (<Spinner className={"size-5 absolute left-8"}/>)}
                <ChartContainer config={NDXChartConfig}>
                    <AreaChart
                        accessibilityLayer
                        data={chartData}
                        margin={{
                            left: 10,
                            right: 10,
                        }}
                    >
                        <defs>
                            <linearGradient id="fillPrice1" x1="0" y1="0" x2="0" y2="1">
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
                            tickFormatter={(value: string) => value.slice(0, value.length - 3)}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="line"/>}
                        />
                        <Area
                            dataKey="price"
                            type="natural"
                            stroke="var(--color-price)"
                            fill="url(#fillPrice1)"
                            strokeWidth={2}
                            dot={false}
                        />
                        <ReferenceLine orientation="right" y={previousClose} stroke={"oklch(55.1% 0.027 264.364)"}
                                       strokeDasharray="3 3" label={{
                            value: `Prev Close: ${previousClose}`,
                            color: "oklch(55.1% 0.027 264.364)",
                            position: "top",
                            fontSize: 10,
                        }}/>
                    </AreaChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm">
                <div className="flex gap-2 leading-none font-medium">
                    <div className={"flex justify-start items-center"}>
                        <div>
                            {pctChange > 0 ? <TrendingUp className="h-4 w-4 mr-1"/> :
                                <TrendingDown className={"h-4 w-4 mr-1"}/>}
                        </div>
                        <span>{pctChange >= 0 ? "Trending up" : "Trending down"} by <span
                            className={"text-[var(--color-profit)]"}>{pctChange}</span> in <Badge
                            variant={"outline"}>{timeAsOf}</Badge></span>
                    </div>
                </div>
                <div className="text-muted-foreground leading-none">
                    Showing real-time data for NDX index
                </div>
            </CardFooter>
        </Card>
    )
}