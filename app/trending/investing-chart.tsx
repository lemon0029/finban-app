"use client"

import {Area, AreaChart, CartesianGrid, ReferenceLine, XAxis, YAxis} from "recharts"
import {ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent,} from "@/components/ui/chart"
import React, {useEffect, useRef, useState} from "react";
import {toast} from "sonner";
import {fetchInvestingChartData} from "@/lib/api";
import {Spinner} from "@/components/ui/spinner";
import {TrendingDown, TrendingUp} from "lucide-react";
import {getDateRangeLabel} from "@/lib/utils";
import {ToggleGroup, ToggleGroupItem} from "@/components/ui/toggle-group";
import {Separator} from "@/components/ui/separator";
import AnimatedNumber from "@/components/animated-number";
import {Timeout} from "@radix-ui/primitive";

const INVESTING_CHART_CONFIG = {
    price: {
        label: "Price",
        color: "var(--color-profit)",
    },
} satisfies ChartConfig

export default function InvestingChart({data}: { data: never }) {
    const [dateRange, setDateRange] = useState("1d")
    const [dataLoading, setDataLoading] = useState(false)
    const [chartData, setChartData] = useState([] as { time: string; price: number }[])
    const [pctChange, setPctChange] = useState(0)
    const [previousClose, setPreviousClose] = useState<number | null>()
    const [latestPrice, setLatestPrice] = useState<number | null>()
    const [intervalDataLoading, setIntervalDataLoading] = useState(false)

    const intervalId = useRef<Timeout | null>(null)

    const id = useRef(data['id'])
    const url = useRef(data['url'])

    useEffect(() => {
        setDataLoading(true)

        const updateData = () => {

            setIntervalDataLoading(true)

            let prices = [] as { time: string; price: number }[]

            fetchInvestingChartData(id.current, url.current, dateRange).then(data => {
                prices = data["data"].map((item: never[]) => {
                    const date = new Date(item[0])
                    let formattedTime

                    if (dateRange === "1d") {
                        formattedTime = date.toLocaleDateString("en-US", {
                            minute: "2-digit",
                            hour: "numeric"
                        })
                    } else if (dateRange === "1w") {
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
                        price: item[4]
                    }
                })

                setChartData(prices)

                setPreviousClose(null)

                if (prices.length >= 2) {
                    const lc = prices[prices.length - 1].price
                    setLatestPrice(lc)

                    const change = ((lc - prices[0].price) / prices[0].price) * 100
                    setPctChange(change)

                    if (change >= 0) {
                        INVESTING_CHART_CONFIG.price.color = "var(--color-profit)"
                    } else {
                        INVESTING_CHART_CONFIG.price.color = "var(--color-loss)"
                    }
                } else {
                    setPctChange(0)
                }

                setDataLoading(false)
                setIntervalDataLoading(false)

                if (dateRange === "1d" && intervalId.current === null) {
                    intervalId.current = setInterval(updateData, 10 * 1000)
                    console.log("Starting interval", intervalId.current)
                }

            }).catch((ex) => {
                console.error(ex)
                setDataLoading(false)
                setIntervalDataLoading(false)
                toast.error("Failed to fetch data")
            })
        }

        updateData()

        return () => {
            if (intervalId.current != null) {
                clearInterval(intervalId.current)
            }
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
        <>
            <div className="flex gap-2 leading-none">
                {
                    dataLoading ? (
                        <div className={"flex justify-start items-center text-muted-foreground h-[36px]"}>
                            <Spinner className={"h-3 w-3 mr-2"}/> Updating...
                        </div>
                    ) : (
                        <div className={"flex flex-col gap-1"}>
                            <div className={"flex font-medium items-center gap-3"}>
                                {latestPrice && <AnimatedNumber value={latestPrice}/>}
                                <div
                                    className={`text-xs flex items-center text-[${INVESTING_CHART_CONFIG.price.color}]`}>
                                    {pctChange > 0 ? <TrendingUp className="h-3 w-3 mr-1"/> :
                                        <TrendingDown className={"h-3 w-3 mr-1"}/>}
                                    <span className={`text-[${INVESTING_CHART_CONFIG.price.color}]`}>
                                        <AnimatedNumber value={pctChange}/>%
                                    </span>
                                </div>
                            </div>
                            <div className={"text-muted-foreground text-xs"}>
                                {getDateRangeLabel(dateRange)}
                            </div>
                        </div>
                    )
                }
            </div>

            <Separator className={"mt-2 !h-[0.5px]"}/>

            <ToggleGroup
                type="single"
                value={dateRange}
                onValueChange={(val) => val && setDateRange(val)}
                className="space-x-1 my-2"
                size="sm"
            >
                {
                    dataRanges.map((range) => (
                        <ToggleGroupItem key={range.value}
                                         value={range.value}
                                         disabled={intervalDataLoading || dataLoading}
                        >
                            {range.label}
                        </ToggleGroupItem>
                    ))
                }
            </ToggleGroup>

            <div className={"relative"}>
                {intervalDataLoading && (<Spinner className={"size-5 absolute left-3 top-3 text-muted-foreground"}/>)}
                <ChartContainer config={INVESTING_CHART_CONFIG} className={"w-full h-[300px]"}>
                    <AreaChart
                        accessibilityLayer
                        data={chartData}
                        margin={{
                            left: 2,
                            right: 2,
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
                                return dateRange === "1d" ? value.substring(10) : value
                            }}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator={"line"}/>}
                        />
                        <Area
                            className="transition-opacity duration-500 ease-in-out"
                            dataKey="price"
                            type="natural"
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
            </div>
        </>
    )
}