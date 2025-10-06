"use client"

import {TrendingDown, TrendingUp} from "lucide-react"
import {Area, AreaChart, CartesianGrid, ReferenceLine, XAxis, YAxis} from "recharts"

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
import {Spinner} from "@/components/ui/spinner";
import {Badge} from "@/components/ui/badge";
import {toast} from "sonner";
import {getDateRangeLabel} from "@/lib/utils";
import {fetchXAUUSDData} from "@/lib/api";
import AnimatedNumber from "@/components/animated-number";

const XAU_USD_CHART_CONFIG = {
    price: {
        label: "Price",
        color: "var(--color-profit)",
    },
} satisfies ChartConfig

export default function GoldSpot() {
    const [dateRange, setDateRange] = useState("1d")
    const [dataLoading, setDataLoading] = useState(false)
    const [chartData, setChartData] = useState([] as { time: string; price: number }[])
    const [pctChange, setPctChange] = useState(0)
    const [previousClose, setPreviousClose] = useState<number | null>()
    const [latestPrice, setLatestPrice] = useState<number | null>()
    const [intervalDataLoading, setIntervalDataLoading] = useState(false)

    useEffect(() => {
        setDataLoading(true)

        const updateData = () => {

            setIntervalDataLoading(true)

            let prices = [] as { time: string; price: number }[]

            fetchXAUUSDData(dateRange).then(data => {
                if (dateRange === "1d") {
                    const values = data["values"]
                    const c = values["c"]
                    const t = values["t"]

                    for (let i = 0; i < c.length; i++) {
                        const date = new Date(t[i] * 1000)
                        const formattedTime = date.toLocaleDateString("en-US", {
                            minute: "2-digit",
                            hour: "numeric"
                        })

                        prices.push({
                            time: formattedTime,
                            price: c[i]
                        })
                    }
                } else {
                    prices = data["data"].map((item: never[]) => {
                        const date = new Date(item[0])
                        let formattedTime

                        if (dateRange === "1w") {
                            formattedTime = date.toLocaleDateString("en-US", {
                                minute: "2-digit",
                                hour: "numeric",
                                day: "numeric",
                                month: "short",
                            })
                        } else if (dateRange === "1m") {
                            formattedTime = date.toLocaleDateString("en-US", {
                                hour: "2-digit",
                                day: "numeric",
                                month: "short",
                            })
                        } else if (dateRange === "3m" || dateRange === "6m") {
                            formattedTime = date.toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                            })
                        } else if (dateRange == "1y") {
                            formattedTime = date.toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                            })
                        } else if (dateRange === "5y" || dateRange === "max") {
                            formattedTime = date.toLocaleDateString("en-US", {
                                month: "short",
                                year: "numeric",
                            })
                        }
                        return {
                            time: formattedTime,
                            price: item[1]
                        }
                    })
                }

                setChartData(prices)

                if (dateRange === "1d") {
                    if (prices.length > 1 && prices[prices.length - 1]) {
                        setLatestPrice(prices[prices.length - 1].price)
                    }

                    const configs = data["config"]
                    setPreviousClose(parseFloat(configs["lastClose"]))
                    setPctChange(parseFloat(configs["changePcr"]))
                } else {
                    setLatestPrice(null)
                    setPreviousClose(null)

                    if (prices.length >= 2) {
                        const change = ((prices[prices.length - 1].price - prices[0].price) / prices[0].price) * 100
                        setPctChange(change)

                        if (change >= 0) {
                            XAU_USD_CHART_CONFIG.price.color = "var(--color-profit)"
                        } else {
                            XAU_USD_CHART_CONFIG.price.color = "var(--color-loss)"
                        }
                    } else {
                        setPctChange(0)
                    }
                }

                setDataLoading(false)
                setIntervalDataLoading(false)
            }).catch((ex) => {
                console.error(ex)
                setDataLoading(false)
                setIntervalDataLoading(false)
                toast.error("Failed to fetch gold price data")
            })
        }

        updateData()

        if (dateRange === "1d") {
            const interval = setInterval(updateData, 10 * 1000)
            return () => clearInterval(interval)
        }

    }, [dateRange])

    const dataRanges = [
        {
            label: "1D",
            value: "1d",
        },
        {
            label: "1W",
            value: "1w",
        },
        {
            label: "1M",
            value: "1m",
        },
        {
            label: "3M",
            value: "3m",
        },
        {
            label: "6M",
            value: "6m",
        },
        {
            label: "1Y",
            value: "1y",
        },
        {
            label: "5Y",
            value: "5y",
        },
        {
            label: "MAX",
            value: "max",
        }
    ]

    return (
        <Card className={"gap-4"}>
            <CardHeader>
                <CardTitle>XAU/USD</CardTitle>
                <CardDescription>Gold Spot US Dollar</CardDescription>
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
                                    dataRanges.map((range) => (
                                        <SelectItem key={range.value}
                                                    value={range.value}
                                                    disabled={intervalDataLoading || dataLoading}
                                        >
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
                {dataLoading && (<Spinner className={"size-5 absolute left-8 top-2"}/>)}
                {!dataLoading && latestPrice && (
                    <Badge variant={"outline"} className={"absolute left-6"}>
                        <AnimatedNumber value={latestPrice}/>
                        <span className={`text-[${XAU_USD_CHART_CONFIG.price.color}]`}>
                            ({previousClose && latestPrice - previousClose > 0 ? "+" : ""}
                            {previousClose && (<AnimatedNumber value={latestPrice - previousClose}/>)}
                        </span>
                        <span className={`text-[${XAU_USD_CHART_CONFIG.price.color}]`}>
                            {pctChange && <AnimatedNumber value={pctChange}/>}%)
                        </span>
                    </Badge>
                )}
                <ChartContainer config={XAU_USD_CHART_CONFIG}>
                    <AreaChart
                        accessibilityLayer
                        data={chartData}
                        margin={{
                            left: 5,
                            right: 5,
                        }}
                    >
                        <defs>
                            <linearGradient id="xau-usd-price-fill-color" x1="0" y1="0" x2="0" y2="1">
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
                        <YAxis domain={['dataMin - 5', 'dataMax + 5']} hide={true}/>
                        <XAxis
                            dataKey="time"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={10}
                            tickFormatter={(value) => {
                                if (dataLoading) {
                                    return value
                                }
                                return dateRange === "1d" ? value.substring(10) : value
                            }}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator={"line"}/>}
                        />
                        <Area
                            className="transition-opacity duration-500 ease-in-out"
                            style={{opacity: dataLoading ? 0 : 1}}
                            dataKey="price"
                            type="linear"
                            stroke="var(--color-price)"
                            fill="url(#xau-usd-price-fill-color)"
                            strokeWidth={2}
                            dot={false}
                        />
                        {
                            previousClose && (
                                <ReferenceLine orientation="right" y={previousClose} stroke={"oklch(55.1% 0.027 264.364)"}
                                               strokeDasharray="3 3" label={{
                                    value: `Prev Close: ${previousClose}`,
                                    color: "oklch(55.1% 0.027 264.364)",
                                    position: "top",
                                    fontSize: 10,
                                }}/>
                            )
                        }

                    </AreaChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col items-start text-xs lg:text-sm">
                {
                    dataLoading ? (<div className={"flex justify-start items-center text-muted-foreground"}><Spinner
                        className={"mr-2"}/> Updating...</div>) : (
                        <div className="flex gap-2 leading-none font-medium">
                            <div className={"flex justify-start items-center"}>
                                {pctChange > 0 ? <TrendingUp className="h-4 w-4 mr-1"/> :
                                    <TrendingDown className={"h-4 w-4 mr-1"}/>}
                                <span>{pctChange >= 0 ? "Trending up" : "Trending down"} by <span
                                    className={`text-[${XAU_USD_CHART_CONFIG.price.color}]`}>{pctChange.toFixed(2)}%</span> in <Badge
                                    variant={"outline"}>{getDateRangeLabel(dateRange)}</Badge></span>
                            </div>
                        </div>
                    )
                }
            </CardFooter>
        </Card>
    )
}