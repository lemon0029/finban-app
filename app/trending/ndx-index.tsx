"use client"

import {TrendingDown, TrendingUp} from "lucide-react"
import {Area, AreaChart, CartesianGrid, ReferenceLine, XAxis, YAxis} from "recharts"

import {Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,} from "@/components/ui/card"
import {ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent,} from "@/components/ui/chart"
import {useEffect, useState} from "react";
import {Spinner} from "@/components/ui/spinner";
import {Badge} from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import {toast} from "sonner";
import {getDateRangeLabel} from "@/lib/utils";
import {fetchNDXData} from "@/lib/api";


const NDX_CHART_CONFIG = {
    price: {
        label: "Value",
        color: "var(--color-profit)",
    },
} satisfies ChartConfig

export default function NDXIndex() {
    const [dataLoading, setDataLoading] = useState(false)
    const [chartData, setChartData] = useState([] as { time: string; price: string }[])
    const [pctChange, setPctChange] = useState(0)
    const [dateRangeLabel, setDateRangeLabel] = useState("")
    const [previousClose, setPreviousClose] = useState(0)
    const [dateRange, setDateRange] = useState("1d")

    useEffect(() => {
        setDataLoading(true)

        fetchNDXData(dateRange).then(data => {
            const sortedData = data["data"]["chart"].sort((a: never, b: never) => a["x"] - b["x"]);
            const prices = sortedData.map((item: never) => {
                return {
                    time: item["z"]["dateTime"],
                    price: item["y"],
                }
            })

            if (dateRange === "1d") {
                setPctChange(parseFloat(data["data"]["percentageChange"]))
            } else {
                if (prices.length >= 2) {
                    const change = ((prices[prices.length - 1].price - prices[0].price) / prices[0].price) * 100
                    setPctChange(change)
                }
            }

            const deltaIndicator = data["data"]["deltaIndicator"];
            if (deltaIndicator === "up") {
                NDX_CHART_CONFIG.price.color = "var(--color-profit)"
            } else {
                NDX_CHART_CONFIG.price.color = "var(--color-loss)"
            }

            setChartData(prices)
            setPreviousClose(parseFloat(data["data"]["previousClose"].replace(/,/g, '')))

            if (dateRange === "1d") {
                let timeAsOf = data["data"]["timeAsOf"]
                if (timeAsOf.length > 11) {
                    timeAsOf = timeAsOf.substring(0, 11)
                }

                setDateRangeLabel(timeAsOf)
            } else {
                setPreviousClose(0)
                setDateRangeLabel(getDateRangeLabel(dateRange))
            }

            setDataLoading(false)
        }).catch((ex) => {
            console.error(ex)
            setDataLoading(false)
            toast.error("Failed to fetch NDX data")
        })
    }, [dateRange])

    const dateRanges = [
        {
            value: "1d",
            label: "1D",
        },
        {
            value: "1w",
            label: "1W",
        },
        {
            value: "1m",
            label: "1M",
        },
        {
            value: "6m",
            label: "6M",
        },
        {
            value: "ytd",
            label: "YTD",
        },
        {
            value: "1y",
            label: "1Y",
        },
        {
            value: "5y",
            label: "5Y",
        },
        {
            value: "10y",
            label: "10Y",
        },
    ]

    return (
        <Card className={"gap-4"}>
            <CardHeader>
                <CardTitle>NDX</CardTitle>
                <CardDescription>The Nasdaq-100 Index</CardDescription>
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
                                {
                                    dateRanges.map((range) => (
                                        <SelectItem key={range.value} value={range.value} disabled={dataLoading}>
                                            {range.label}
                                        </SelectItem>
                                    ))
                                }
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </CardAction>
            </CardHeader>
            <CardContent className={"px-4 relative"}>
                {dataLoading && (<Spinner className={"text-muted-foreground size-5 absolute left-8 top-2"}/>)}
                <ChartContainer config={NDX_CHART_CONFIG}>
                    <AreaChart
                        accessibilityLayer
                        data={chartData}
                        margin={{
                            left: 5,
                            right: 5,
                        }}
                    >
                        <defs>
                            <linearGradient id="ndx-chart-fill-color" x1="0" y1="0" x2="0" y2="1">
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
                        <YAxis domain={['dataMin - 10', 'dataMax + 10']} hide={true}/>
                        <XAxis
                            dataKey="time"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={10}
                            tickFormatter={(value: string) => {
                                switch (dateRange) {
                                    case "1d":
                                        return value.slice(0, value.length - 3)
                                    default:
                                        return value
                                }
                            }}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="line"/>}
                        />
                        <Area
                            dataKey="price"
                            type="natural"
                            stroke="var(--color-price)"
                            fill="url(#ndx-chart-fill-color)"
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
            <CardFooter className="flex-col items-start text-xs lg:text-sm">
                {
                    dataLoading ? (
                        <div className={"flex justify-start items-center text-muted-foreground h-[22px]"}>
                            <Spinner className={"mr-2"}/> Updating...</div>
                    ) : (
                        <div className="flex gap-2 leading-none font-medium">
                            <div className={"flex justify-start items-center"}>
                                <div>
                                    {pctChange > 0 ? <TrendingUp className="h-4 w-4 mr-1"/> :
                                        <TrendingDown className={"h-4 w-4 mr-1"}/>}
                                </div>
                                <div className={"flex items-center gap-1"}>
                                    <span>
                                        {pctChange >= 0 ? "Trending up" : "Trending down"} by
                                    </span>
                                    <span
                                        className={`text-[${NDX_CHART_CONFIG.price.color}] h-full`}>
                                        {pctChange.toFixed(2)}%
                                    </span>
                                    <span>
                                        in <Badge variant={"outline"}>{dateRangeLabel}</Badge>
                                    </span>
                                </div>
                            </div>
                        </div>
                    )
                }
            </CardFooter>
        </Card>
    )
}