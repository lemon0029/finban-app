"use client"

import {CartesianGrid, Line, LineChart, XAxis} from "recharts"

import {Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,} from "@/components/ui/card"
import {ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent,} from "@/components/ui/chart"
import * as React from "react";
import {Button} from "@/components/ui/button";
import {Calendar} from "@/components/ui/calendar";
import {ChevronDownIcon, InfoIcon} from "lucide-react";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Label} from "@/components/ui/label";

export function SIPChart() {
    const today = new Date()
    const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 6, today.getDate())

    const [startDateOpen, setStartDateOpen] = React.useState(false)
    const [startDate, setStartDate] = React.useState<Date | undefined>(sixMonthsAgo)

    const [endDateOpen, setEndDateOpen] = React.useState(false)
    const [endDate, setEndDate] = React.useState<Date | undefined>(today)

    const chartData = [
        {month: "January", desktop: 186, mobile: 80},
        {month: "February", desktop: 305, mobile: 200},
        {month: "March", desktop: 237, mobile: 120},
        {month: "April", desktop: 73, mobile: 190},
        {month: "May", desktop: 209, mobile: 130},
        {month: "June", desktop: 214, mobile: 140},
    ]

    const chartConfig = {
        desktop: {
            label: "Desktop",
            color: "var(--chart-1)",
        },
        mobile: {
            label: "Mobile",
            color: "var(--chart-2)",
        },
    } satisfies ChartConfig

    return (
        <>
            <div className={"flex gap-2 mb-1"}>
                <div>
                    <Label className={"ml-1 text-xs mb-1"}>起始日</Label>
                    <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                id="date"
                                className="w-30 justify-between font-normal"
                            >
                                {startDate ? startDate.toLocaleDateString() : "起始日"}
                                <ChevronDownIcon/>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={startDate}
                                captionLayout="dropdown"
                                onSelect={(date) => {
                                    setStartDate(date)
                                    setStartDateOpen(false)
                                }}
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                <div>
                    <Label className={"ml-1 text-xs mb-1"}>终止日</Label>
                    <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                id="date"
                                className="w-30 justify-between font-normal"
                            >
                                {endDate ? endDate.toLocaleDateString() : "终止日"}
                                <ChevronDownIcon/>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={endDate}
                                captionLayout="dropdown"
                                onSelect={(date) => {
                                    setEndDate(date)
                                    setEndDateOpen(false)
                                }}
                            />
                        </PopoverContent>
                    </Popover>
                </div>
                <div className={"flex flex-col justify-end"}>
                    <Label className={"ml-1 text-xs mb-1 hidden justify-end"}>回测</Label>
                    <Button variant={"outline"} className={"justify-end"}>回测</Button>
                </div>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>定投收益曲线</CardTitle>
                    <CardDescription>{startDate?.toLocaleDateString()} - {endDate?.toLocaleDateString()}</CardDescription>
                    <CardAction>
                        <Button variant={"ghost"}>Empty</Button>
                    </CardAction>
                </CardHeader>
                <CardContent className={"gap-1 text-muted-foreground text-xs flex justify-between flex-wrap"}>
                    <div className={"flex items-center gap-1"}>
                        <div className="h-2 w-2 shrink-0 rounded-[2px]"
                             style={{
                                 backgroundColor: "red",
                             }}
                        />
                        固收理财 - 3.2%
                    </div>
                    <div>固收理财123121231234 - 3.2%</div>
                    <div>固收理财 - 3.2%</div>
                </CardContent>
                <CardContent>
                    <ChartContainer config={chartConfig}>
                        <LineChart
                            accessibilityLayer
                            data={chartData}
                            margin={{
                                left: 12,
                                right: 12,
                            }}
                        >
                            <CartesianGrid vertical={false}/>
                            <XAxis
                                dataKey="month"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                tickFormatter={(value) => value.slice(0, 3)}
                            />
                            <ChartTooltip cursor={false} content={<ChartTooltipContent/>}/>
                            <Line
                                dataKey="desktop"
                                type="monotone"
                                stroke="var(--color-desktop)"
                                strokeWidth={2}
                                dot={false}
                            />
                            <Line
                                dataKey="mobile"
                                type="monotone"
                                stroke="var(--color-mobile)"
                                strokeWidth={2}
                                dot={false}
                            />
                        </LineChart>
                    </ChartContainer>
                </CardContent>
                <CardFooter>
                    <div className="flex w-full items-start gap-2 text-sm">
                        <div className="grid gap-2">
                            <div className="text-muted-foreground flex items-center gap-2 leading-none">
                                <InfoIcon className={"h-3 w-3"}/> 固收理财为以年化 3% 为基准
                            </div>
                        </div>
                    </div>
                </CardFooter>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>固收理财收益</CardTitle>
                </CardHeader>
                <CardContent>
                    <div>定投收益率：500%</div>
                    <div>期末总收益：¥100</div>
                    <div>期末总资产：¥100001</div>
                    <div>投入本金：¥100000</div>
                    <div>期末总资产：¥100001</div>
                    <div>年复合收益率：45%</div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>东方红中证红利低波动指数A</CardTitle>
                </CardHeader>
            </Card>
        </>
    )
}
