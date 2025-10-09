"use client"

import {Area, AreaChart, CartesianGrid, ReferenceLine, XAxis, YAxis} from "recharts"
import {ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent,} from "@/components/ui/chart"
import React, {useEffect, useRef, useState} from "react";
import {toast} from "sonner";
import {fetchInvestingChartData, fetchInvestingChartDataChanges} from "@/lib/api";
import {Spinner} from "@/components/ui/spinner";
import {TrendingDown, TrendingUp} from "lucide-react";
import {getDateRangeLabel} from "@/lib/utils";
import {ToggleGroup, ToggleGroupItem} from "@/components/ui/toggle-group";
import {Separator} from "@/components/ui/separator";
import AnimatedNumber from "@/components/animated-number";
import {InvestingStreamingData, PidInfo} from "@/lib/investing-api/streaming-data";

const INVESTING_CHART_CONFIG = {
    price: {
        label: "Price",
        color: "var(--color-profit)",
    },
} satisfies ChartConfig

type ChartData = {
    time: string;
    price: number;
}

function loadChartData(dateRange: string, data: { [x: string]: never[][]; }): ChartData[] {
    const prices: ChartData[] = []

    if (dateRange === "1d" && data["c"] && data["t"]) {
        const c = data["c"]
        const t = data["t"]

        for (let i = 0; i < c.length; i++) {
            const time = t[i] as unknown as number
            const closeValue = c[i] as unknown as number
            const date = new Date(time * 1000)
            const formattedTime = date.toLocaleDateString("en-US", {
                minute: "2-digit",
                hour: "numeric"
            })

            prices.push({
                time: formattedTime,
                price: closeValue
            })
        }

        return prices
    }

    return data["data"].map((item: never[]) => {
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
        } else if (dateRange === "5y" || dateRange === "all_time") {
            formattedTime = date.toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
            })
        }
        return {
            time: formattedTime,
            price: item[4]
        }
    }) as ChartData[]
}

async function fetchTodayTradingData(pairId: number) {
    try {
        const today = new Date();
        const to = Math.floor(today.getTime() / 1000);
        const from = Math.floor(today.getTime() / 1000 - 86400);

        const response = await fetch(`/api/investing-proxy/historical-data?pairId=${pairId}&resolution=1&from=${from}&to=${to}`);

        if (response.ok) {
            return await response.json()
        }

        return fetchInvestingChartData(pairId, "", "1d")
    } catch (ex) {
        console.error(ex)
    }

    throw new Error("Failed to fetch data")
}

export default function InvestingChart({data}: { data: never }) {
    const [dateRange, setDateRange] = useState("1d")
    const [dataLoading, setDataLoading] = useState(false)
    const [chartData, setChartData] = useState([] as { time: string; price: number }[])
    const [pctChange, setPctChange] = useState<number | null>()
    const [valueChange, setValueChange] = useState<number | null>()
    const [previousClose, setPreviousClose] = useState<number | null>()
    const [lastPrice, setLastPrice] = useState<number | null>()
    const [intervalDataLoading, setIntervalDataLoading] = useState(false)
    const streaming = useRef<InvestingStreamingData>(null)
    const [historyDataLoaded, setHistoryDataLoaded] = useState(false)
    const [askPrice, setAskPrice] = useState<number | null>()
    const [bidPrice, setBidPrice] = useState<number | null>()

    const pairId = useRef<number>(data['id'])
    const symbolUrl = useRef(data['url'])

    useEffect(() => {

        if (!historyDataLoaded) {
            return
        }

        if (dateRange !== "1d" && streaming.current != null) {
            streaming.current.close()
            console.log("Closed stream for pairId: ", pairId.current)
            setPreviousClose(null)
            return
        }

        streaming.current = new InvestingStreamingData();

        streaming.current.on('open', () => {
            streaming.current!.subscribe([pairId.current])
            console.log("Subscribed to pairId: ", pairId.current)
        })

        streaming.current.on('data', (data: PidInfo) => {
            console.log(data)
            setLastPrice(data.last)
            setPreviousClose(data.last_close)
            setPctChange(data.pc / data.last_close * 100)
            setAskPrice(data.ask)
            setBidPrice(data.bid)
            setValueChange(data.pc)

            const date = new Date(Math.floor(data.timestamp))

            // 这里拿到的时间是精度到秒到，但是需要显示的精度是分钟
            date.setSeconds(0)

            const formattedTime = date.toLocaleDateString("en-US", {
                minute: "2-digit",
                hour: "numeric"
            })

            const lastData = {
                time: formattedTime,
                price: data.last
            }

            setChartData(prevData => {
                const newData = []
                let newDataAppended = false

                for (const prev of prevData) {
                    if (prev.time === lastData.time) {
                        newData.push(lastData)
                        newDataAppended = true
                    } else {
                        newData.push(prev)
                    }
                }

                if (!newDataAppended) {
                    newData.push(lastData)

                    if (newData.length > 1) {
                        // 移除第一个点
                        newData.shift()
                    }
                }

                return newData
            })
        })

        return () => {
            streaming.current?.close()
            console.log("Closed stream for pairId: ", pairId)
        }

    }, [dateRange, historyDataLoaded])

    useEffect(() => {
        setDataLoading(true)

        if (dateRange !== "1d") {
            setBidPrice(null)
            setAskPrice(null)
        }

        const updateData = () => {

            setIntervalDataLoading(true)

            const data1 = fetchInvestingChartDataChanges(pairId.current)

            let prices = [] as { time: string; price: number }[]

            const data2 = dateRange === "1d" ? fetchTodayTradingData(pairId.current)
                : fetchInvestingChartData(pairId.current, symbolUrl.current, dateRange)

            Promise.all([data1, data2])
                .then(([data1, data2]) => {
                    const change = data1[`pct_${dateRange}`];

                    if (change >= 0) {
                        INVESTING_CHART_CONFIG.price.color = "var(--color-profit)"
                    } else {
                        INVESTING_CHART_CONFIG.price.color = "var(--color-loss)"
                    }

                    setPctChange(change)

                    prices = loadChartData(dateRange, data2)

                    if (prices && prices.length > 0) {
                        setLastPrice(prices[prices.length - 1].price)
                    }

                    setChartData(prices)
                    setDataLoading(false)
                    setIntervalDataLoading(false)
                    setHistoryDataLoaded(true)
                }).catch((ex) => {
                console.error(ex)
                setDataLoading(false)
                setIntervalDataLoading(false)
                toast.error("Failed to fetch data")
            })
        }

        updateData()

        return () => {
            setHistoryDataLoaded(false)
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
            label: "ALL",
            value: "all_time",
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
                        <div className={"flex justify-between w-full"}>
                            <div className={"flex flex-col gap-1"}>
                                <div className={"flex font-medium items-center gap-3"}>
                                    <div className={"font-mono"}>
                                        {lastPrice && <AnimatedNumber value={lastPrice} flash={true}/>}
                                    </div>
                                </div>
                                <div className={"text-muted-foreground text-xs flex space-x-2"}>
                                    <span>{getDateRangeLabel(dateRange)}</span>
                                    {
                                        pctChange != null && valueChange != null && (
                                            <div className={`text-xs shrink-0 min-w-[5ch] flex items-center text-[${INVESTING_CHART_CONFIG.price.color}] font-mono`}>
                                                {pctChange >= 0 ?
                                                    <TrendingUp className="h-3 w-3 mr-1"/> :
                                                    <TrendingDown className={"h-3 w-3 mr-1"}/>}
                                                <span>
                                                    <AnimatedNumber value={pctChange}/>%
                                                </span>
                                                <span className={"ml-2"}>
                                                    {valueChange > 0 ? "+" : ""}
                                                    <AnimatedNumber value={valueChange}/>
                                                </span>
                                            </div>
                                        )
                                    }
                                </div>
                            </div>

                            <div className={"self-end flex flex-col font-mono"}>
                                {askPrice && askPrice !== 0 ? (
                                    <span className={"text-muted-foreground text-xs w-22"}>
                                        Ask: <AnimatedNumber value={askPrice}/>
                                    </span>
                                ) : (<span/>)}

                                {bidPrice && bidPrice !== 0 ? (
                                    <span className={"text-muted-foreground text-xs w-22"}>
                                         Bid: <AnimatedNumber value={bidPrice}/>
                                    </span>
                                ) : <span/>}
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
                className="space-x-2 my-2"
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
                <ChartContainer config={INVESTING_CHART_CONFIG} className={"w-full"}>
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
                        <YAxis domain={['auto', 'auto']} hide={true}/>
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
                            dataKey="price"
                            type="monotone"
                            stroke="var(--color-price)"
                            fill="url(#xau-usd-price-fill-color)"
                            strokeWidth={2}
                            dot={false}
                            animationDuration={300}
                            animationEasing="ease-out"
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