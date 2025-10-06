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
import {getDateRangeLabel, parseYYYYMMDD, parseYYYYMMDDHHMM} from "@/lib/utils";
import {fetchCSI300IndexData} from "@/lib/api";


const CSI_300_CHART_CONFIG = {
    price: {
        label: "Value",
        color: "var(--color-profit)",
    },
} satisfies ChartConfig

export default function CSI300Index() {
    const [dataLoading, setDataLoading] = useState(false)
    const [chartData, setChartData] = useState([] as { time: string; price: number }[])
    const [pctChange, setPctChange] = useState(0)
    const [dateRangeLabel, setDateRangeLabel] = useState("")
    const [previousClose, setPreviousClose] = useState(0)
    const [dateRange, setDateRange] = useState("1d")

    useEffect(() => {
        setDataLoading(true)

        fetchCSI300IndexData(dateRange).then(data => {
            let formattedData = null
            if (data.startsWith("min_data_sh000300")) {
                const jsonString = data.substring(data.indexOf('=') + 1).trim();
                formattedData = JSON.parse(jsonString)["data"]["sh000300"];
            } else if (data.startsWith("fdays_data_sh000300")) {
                const jsonString = data.substring(data.indexOf('=') + 1).trim();
                formattedData = JSON.parse(jsonString)["data"]["sh000300"];
            } else if (data.startsWith("kline_dayqfq")) {
                const jsonString = data.substring(data.indexOf('=') + 1).trim();
                formattedData = JSON.parse(jsonString)["data"]["sh000300"];
            }

            let prices = [] as { time: string; price: number }[]
            if (dateRange === "1d") {
                prices = formattedData["data"]["data"].map((item: string) => {
                    const parts = item.split(" ")
                    return {
                        time: parts[0],
                        price: parseFloat(parts[1])
                    }
                })
            } else if (dateRange === "1w") {
                for (const item of formattedData["data"].reverse()) {
                    const date = item["date"]
                    for (const dayData of item["data"]) {
                        const parts = dayData.split(" ")
                        prices.push({
                            time: date + parts[0],
                            price: parseFloat(parts[1])
                        })
                    }
                }
            } else {
                prices = formattedData["day"].map((item: string[]) => {
                    return {
                        time: item[0],
                        price: parseFloat(item[2])
                    }
                });
            }

            let previousClose: number;
            let changed: number;

            if (dateRange === "1d") {
                const arr = formattedData["qt"]["sh000300"]
                const close = parseFloat(arr[3])
                previousClose = parseFloat(arr[4])
                changed = (close - previousClose) / previousClose * 100;
                setPctChange(changed)
                setPreviousClose(previousClose)
            } else if (dateRange === "1w") {
                const arr = formattedData["qt"]["sh000300"]
                const close = parseFloat(arr[3])
                previousClose = parseFloat(formattedData["data"][0]["prec"])
                changed = (close - previousClose) / previousClose * 100;
                setPctChange(changed)
                setPreviousClose(previousClose)
            } else {
                previousClose = prices[0].price
                const close = prices[prices.length - 1].price
                changed = (close - previousClose) / previousClose * 100;
                setPctChange(changed)
                setPreviousClose(previousClose)
            }

            if (changed >= 0) {
                CSI_300_CHART_CONFIG.price.color = "var(--color-profit)"
            } else {
                CSI_300_CHART_CONFIG.price.color = "var(--color-loss)"
            }

            setChartData(prices)

            if (dateRange === "1d") {
                const label = parseYYYYMMDD(formattedData["data"]["date"])
                    .toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                    });

                setDateRangeLabel(label)
            } else if (dateRange) {
                setDateRangeLabel(getDateRangeLabel(dateRange))
            }

            setDataLoading(false)
        }).catch((ex) => {
            console.error(ex)
            setDataLoading(false)
            toast.error("Failed to fetch CSI 300 Index data")
        })
    }, [dateRange])

    return (
        <Card className={"gap-4"}>
            <CardHeader>
                <CardTitle>000300.SH</CardTitle>
                <CardDescription>The CSI 300 Index</CardDescription>
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
                                <SelectItem value="3m">3M</SelectItem>
                                <SelectItem value="6m">6M</SelectItem>
                                <SelectItem value="1y">1Y</SelectItem>
                                <SelectItem value="3y">3Y</SelectItem>
                                <SelectItem value="5y">5Y</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </CardAction>
            </CardHeader>
            <CardContent className={"px-4 relative"}>
                {dataLoading && (<Spinner className={"size-5 absolute left-8 top-2 text-muted-foreground"}/>)}
                <ChartContainer config={CSI_300_CHART_CONFIG}>
                    <AreaChart
                        accessibilityLayer
                        data={chartData}
                        margin={{
                            left: 5,
                            right: 5,
                        }}
                    >
                        <defs>
                            <linearGradient id="csi-300-index-chart-fill-color" x1="0" y1="0" x2="0" y2="1">
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
                        <YAxis domain={['dataMin - 20', 'dataMax + 20']} hide={true}/>
                        <XAxis
                            dataKey="time"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={10}
                            tickFormatter={(value) => {
                                if (value.length === 4) {
                                    return value.substring(0, 2) + ":" + value.substring(2, 4)
                                }

                                if (value.length === 10) {
                                    return value
                                }

                                return parseYYYYMMDDHHMM(value).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric"
                                });
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
                            fill="url(#csi-300-index-chart-fill-color)"
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
                                <span>
                            {pctChange >= 0 ? "Trending up" : "Trending down"} by <span
                                    className={`text-[${CSI_300_CHART_CONFIG.price.color}]`}>{pctChange.toFixed(2)}%</span> in <Badge
                                    variant={"outline"}>{dateRangeLabel}</Badge>
                        </span>
                            </div>
                        </div>
                    )
                }
            </CardFooter>
        </Card>
    )
}