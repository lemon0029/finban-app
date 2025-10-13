"use client"

import {Area, AreaChart, CartesianGrid, ReferenceLine, XAxis, YAxis} from "recharts"
import {ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent,} from "@/components/ui/chart"
import React, {useEffect, useRef, useState} from "react";
import {toast} from "sonner";
import {fetchInvestingChartData, fetchInvestingChartDataChanges} from "@/lib/api";
import {Spinner} from "@/components/ui/spinner";
import {TrendingDown, TrendingUp} from "lucide-react";
import {formatTick, formatTooltipLabel, getDateRangeLabel} from "@/lib/utils";
import {ToggleGroup, ToggleGroupItem} from "@/components/ui/toggle-group";
import {Separator} from "@/components/ui/separator";
import AnimatedNumber from "@/components/animated-number";
import {InvestingStreamingData, PidInfo} from "@/lib/investing-api/streaming-data";
import {InvestingChartDataPoint, WatchlistItemDTO} from "@/lib/types";

const INVESTING_CHART_CONFIG = {
    price: {
        label: "Value",
        color: "var(--color-profit)",
    },
} satisfies ChartConfig

function loadChartData(dateRange: string, data: { [x: string]: never[][]; }): InvestingChartDataPoint[] {
    const prices: InvestingChartDataPoint[] = []

    if (dateRange === "1d" && data["c"] && data["t"]) {
        const c = data["c"]
        const t = data["t"]

        for (let i = 0; i < c.length; i++) {
            const time = t[i] as unknown as number
            const closeValue = c[i] as unknown as number

            prices.push({
                time: time * 1000,
                price: closeValue
            })
        }

        return prices
    }

    return data["data"].map((item: never[]) => {
        return {
            time: item[0],
            price: item[4]
        }
    }) as InvestingChartDataPoint[]
}

export default function InvestingChart({data}: { data: WatchlistItemDTO }) {
    const [dateRange, setDateRange] = useState("1d")
    const [activeDateRange, setActiveDateRange] = useState("1d")
    const [dataLoading, setDataLoading] = useState(false)
    const [chartData, setChartData] = useState<InvestingChartDataPoint[]>([])
    const [pctChange, setPctChange] = useState<number | null>()
    const [valueChange, setValueChange] = useState<number | null>()
    const [previousClose, setPreviousClose] = useState<number | null>()
    const [lastPrice, setLastPrice] = useState<number | null>()
    const [intervalDataLoading, setIntervalDataLoading] = useState(false)
    const streaming = useRef<InvestingStreamingData>(null)
    const [historyDataLoaded, setHistoryDataLoaded] = useState(false)
    const [askPrice, setAskPrice] = useState<number | null>()
    const [bidPrice, setBidPrice] = useState<number | null>()

    const pairId = useRef<number>(data.id)
    const symbolUrl = useRef(data.url)
    const historyPreviousClose = useRef<number | null>(null)
    const dateRangeRef = useRef("1d")

    useEffect(() => {
        return () => {
            if (streaming.current != null) {
                streaming.current.close()
                console.log("Closed stream, pid: " + data.id)
            }
        }
    }, [data]);

    useEffect(() => {

        if (!historyDataLoaded) {
            return
        }

        if (streaming.current != null) {
            return;
        }

        streaming.current = new InvestingStreamingData();

        streaming.current.on('open', () => {
            streaming.current!.subscribe([pairId.current])
            console.log("Subscribed to pairId: ", pairId.current)
        })

        streaming.current.on('data', (data: PidInfo) => {
            console.log(data)
            setLastPrice(data.last)

            if (!historyDataLoaded) {
                return
            }

            if (dateRangeRef.current === "1d") {
                setPreviousClose(data.last_close)
                setPctChange(data.pc / data.last_close * 100)
                setValueChange(data.pc)
            } else if (historyPreviousClose.current != null) {
                setPctChange((data.last - historyPreviousClose.current) / historyPreviousClose.current * 100)
                setValueChange(data.last - historyPreviousClose.current)
            }

            setAskPrice(data.ask)
            setBidPrice(data.bid)

            const date = new Date(data.timestamp)

            if (dateRangeRef.current === "1d") {
                // 这里拿到的时间是精度到秒，但是需要显示的精度是五分钟
                date.setMinutes(Math.floor(date.getMinutes() / 5) * 5)
                date.setSeconds(0)
            } else if (dateRangeRef.current === "1w") {
                // 精度为 1 小时
                date.setMinutes(0)
                date.setSeconds(0)
            } else {
                return;
            }

            const lastData = {
                time: date.getTime(),
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

    }, [historyDataLoaded])

    useEffect(() => {
        setDataLoading(true)

        const updateData = () => {

            setIntervalDataLoading(true)

            const data1 = fetchInvestingChartDataChanges(pairId.current)
            const data2 = fetchInvestingChartData(pairId.current, symbolUrl.current, dateRange)

            Promise.all([data1, data2])
                .then(([data1, data2]) => {
                    const change = data1[`pct_${dateRange}`];

                    if (change >= 0) {
                        INVESTING_CHART_CONFIG.price.color = "var(--color-profit)"
                    } else {
                        INVESTING_CHART_CONFIG.price.color = "var(--color-loss)"
                    }

                    const prices = loadChartData(dateRange, data2)

                    if (prices && prices.length > 0) {
                        const lastPoint = prices[prices.length - 1];

                        setLastPrice(lastPoint.price)
                        setValueChange((change / 100) * lastPoint.price!)

                        historyPreviousClose.current = lastPoint.price! / (1 + change / 100)

                        if (dateRange === "1d") {
                            const currentTime = new Date().getTime()

                            if (currentTime >= lastPoint.time && currentTime <= lastPoint.time + 30 * 60 * 1000) {
                                // 需要往后面添加几个数据
                                for (let i = 0; i < 50; i++) {
                                    prices.push({
                                        time: lastPoint.time + (i + 1) * 5 * 60 * 1000,
                                        price: null
                                    })
                                }
                            }
                        }
                    }

                    if (dateRange === "1d") {
                        historyPreviousClose.current = null
                    }

                    dateRangeRef.current = dateRange

                    setPctChange(change)
                    setActiveDateRange(dateRange)
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
                                    {lastPrice && <AnimatedNumber value={lastPrice} bgFlashEnabled={true}/>}
                                </div>
                                <div className={"text-muted-foreground text-xs flex space-x-2"}>
                                    <span>{getDateRangeLabel(dateRange)}</span>
                                    {
                                        pctChange != null && valueChange != null && (
                                            <div className={
                                                `text-xs shrink-0 min-w-[5ch] flex items-center text-[${INVESTING_CHART_CONFIG.price.color}]`
                                            }>
                                                {pctChange >= 0 ?
                                                    <TrendingUp className="h-3 w-3 mr-1"/> :
                                                    <TrendingDown className={"h-3 w-3 mr-1"}/>}
                                                <span>
                                                    <AnimatedNumber value={pctChange}/>%
                                                </span>
                                                <span className={"ml-2"}>
                                                    {valueChange >= 0 ? "+" : ""}
                                                    <AnimatedNumber value={valueChange}/>
                                                </span>
                                            </div>
                                        )
                                    }
                                </div>
                            </div>

                            <div className={"self-end flex flex-col font-mono text-end"}>
                                {askPrice && askPrice !== 0 ? (
                                    <span className={"text-muted-foreground text-xs w-28"}>
                                        Ask: <AnimatedNumber value={askPrice}/>
                                    </span>
                                ) : (<span/>)}

                                {bidPrice && bidPrice !== 0 ? (
                                    <span className={"text-muted-foreground text-xs w-28"}>
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
                <ChartContainer config={INVESTING_CHART_CONFIG} className={"w-full max-h-[300px]"}>
                    <AreaChart
                        accessibilityLayer
                        data={chartData}
                        margin={{
                            left: 2,
                            right: 2,
                        }}
                    >
                        <defs>
                            <linearGradient id="investing-chart-fill-color" x1="0" y1="0" x2="0" y2="1">
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
                            tickFormatter={(value) => formatTick(activeDateRange, value)}
                        />
                        <ChartTooltip
                            labelFormatter={(_, payload) => {
                                return formatTooltipLabel(activeDateRange, payload[0].payload["time"]);
                            }}
                            cursor={false}
                            content={<ChartTooltipContent indicator={"line"}/>}
                        />
                        <Area
                            dataKey="price"
                            type="monotone"
                            stroke="var(--color-price)"
                            fill="url(#investing-chart-fill-color)"
                            strokeWidth={2}
                            dot={false}
                            animationDuration={300}
                            animationEasing="ease-out"
                        />
                        {
                            activeDateRange === "1d" && previousClose && (
                                <ReferenceLine orientation="right" y={previousClose} stroke={"oklch(55.1% 0.027 264.364)"}
                                               strokeDasharray="3 3" label={{
                                    value: `Prev Close: ${previousClose.toFixed(2)}`,
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