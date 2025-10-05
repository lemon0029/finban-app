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


const NDXChartConfig = {
    price: {
        label: "Price",
        color: "var(--color-profit)",
    },
} satisfies ChartConfig

async function fetchNDXData(dateRange: string) {
    if (dateRange == "1d") {
        const response = await fetch("/api/quote/NDX/chart?assetclass=index");
        return await response.json();
    }

    const today = new Date();
    let fromDate: string;
    if (dateRange === "1w") {
        const pastDate = new Date();
        pastDate.setDate(today.getDate() - 7); // 7天前，考虑到周末
        fromDate = pastDate.toISOString().split('T')[0];
    } else if (dateRange === "1m") {
        const pastDate = new Date();
        pastDate.setMonth(today.getMonth() - 1);
        fromDate = pastDate.toISOString().split('T')[0];
    } else if (dateRange === "6m") {
        const pastDate = new Date();
        pastDate.setMonth(today.getMonth() - 6);
        fromDate = pastDate.toISOString().split('T')[0];
    } else if (dateRange === "ytd") {
        const pastDate = new Date(today.getFullYear(), 0, 1);
        fromDate = pastDate.toISOString().split('T')[0];
    } else if (dateRange === "1y") {
        const pastDate = new Date();
        pastDate.setFullYear(today.getFullYear() - 1);
        fromDate = pastDate.toISOString().split('T')[0];
    } else if (dateRange === "5y") {
        const pastDate = new Date();
        pastDate.setFullYear(today.getFullYear() - 5);
        fromDate = pastDate.toISOString().split('T')[0];
    } else { // 10y
        const pastDate = new Date();
        pastDate.setFullYear(today.getFullYear() - 10);
        fromDate = pastDate.toISOString().split('T')[0];
    }

    const endDate = today.toISOString().split('T')[0];

    const response = await fetch(`/api/quote/NDX/chart?assetclass=index&fromdate=${fromDate}&todate=${endDate}`, {
        next: {revalidate: 3600}
    });
    return await response.json();
}

export default function NDXIndex() {
    const [dataLoading, setDataLoading] = useState(false)
    const [chartData, setChartData] = useState([] as { time: string; price: string }[])
    const [pctChange, setPctChange] = useState(0)
    const [timeAsOf, setTimeAsOf] = useState("")
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

            setPctChange(data["data"]["percentageChange"])

            if (prices.length >= 2) {
                const change = ((prices[prices.length - 1].price - prices[0].price) / prices[0].price) * 100
                setPctChange(change)
            }

            const deltaIndicator = data["data"]["deltaIndicator"];
            if (deltaIndicator === "up") {
                NDXChartConfig.price.color = "var(--color-profit)"
            } else {
                NDXChartConfig.price.color = "var(--color-loss)"
            }

            setChartData(prices)
            setPreviousClose(parseFloat(data["data"]["previousClose"].replace(/,/g, '')))

            if (dateRange === "1d") {
                setTimeAsOf(data["data"]["timeAsOf"])
            } else {
                setPreviousClose(0)
                setTimeAsOf(getDateRangeLabel(dateRange))
            }

            setDataLoading(false)
        }).catch((ex) => {
            console.error(ex)
            setDataLoading(false)
            toast.error("Failed to fetch NDX data")
        })
    }, [dateRange])

    return (
        <Card>
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
                                <SelectItem value="1d">1D</SelectItem>
                                <SelectItem value="1w">1W</SelectItem>
                                <SelectItem value="1m">1M</SelectItem>
                                <SelectItem value="6m">6M</SelectItem>
                                <SelectItem value="ytd">YTD</SelectItem>
                                <SelectItem value="1y">1Y</SelectItem>
                                <SelectItem value="5y">5Y</SelectItem>
                                <SelectItem value="10y">10Y</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </CardAction>
            </CardHeader>
            <CardContent className={"px-4 relative"}>
                {dataLoading && (<Spinner className={"size-5 absolute left-8 top-2"}/>)}
                <ChartContainer config={NDXChartConfig}>
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
                    dataLoading ? (<div className={"flex justify-start items-center text-muted-foreground"}><Spinner
                        className={"mr-2"}/> Updating...</div>) : (
                        <div className="flex gap-2 leading-none font-medium">
                            <div className={"flex justify-start items-center"}>
                                <div>
                                    {pctChange > 0 ? <TrendingUp className="h-4 w-4 mr-1"/> :
                                        <TrendingDown className={"h-4 w-4 mr-1"}/>}
                                </div>
                                <span>
                            {pctChange >= 0 ? "Trending up" : "Trending down"} by <span
                                    className={`text-[${NDXChartConfig.price.color}]`}>{pctChange.toFixed(2)}%</span> in <Badge
                                    variant={"outline"}>{timeAsOf}</Badge>
                        </span>
                            </div>
                        </div>
                    )
                }
            </CardFooter>
        </Card>
    )
}