"use client"

import {Pie, PieChart, Sector} from "recharts"

import {Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle,} from "@/components/ui/card"
import {ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent,} from "@/components/ui/chart"
import {HoldingDTO} from "@/lib/types";
import * as React from "react";
import {useState} from "react";
import {cn} from "@/lib/utils";
import {Separator} from "@/components/ui/separator";
import {PieSectorDataItem} from "recharts/types/polar/Pie";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";


function HoldingAmountDistributionChart({holdings}: { holdings: HoldingDTO[] }) {
    const [activeProductCode, setActiveProductCode] = useState("")

    const chartData = []
    const chartConfig: ChartConfig = {}
    const chartLegendConfig = []

    const colors = [
        "#1abc9c",
        "#2ecc71",
        "#3498db",
        "#9b59b6",
        "#34495e",
        "#16a085",
        "#f1c40f",
        "#e67e22",
        "#c0392b",
        "#95a5a6",
        "#f39c12"
    ]

    let colorIndex = 1
    for (const holding of holdings) {
        chartData.push({
            productCode: holding.productCode,
            costAmount: holding.costAmount,
            fill: `${colors[colorIndex % colors.length]}`
        })
        chartConfig[holding.productCode] = {
            label: holding.productName,
            color: `${colors[colorIndex % colors.length]}`
        }

        chartLegendConfig.push({
            productCode: holding.productCode,
            productName: holding.productName,
            costAmound: holding.costAmount,
            color: `${colors[colorIndex % colors.length]}`
        })

        colorIndex++
    }

    chartData.sort((a, b) => b.costAmount - a.costAmount)
    chartLegendConfig.sort((a, b) => b.costAmound - a.costAmound)

    console.log(chartConfig)
    console.log(chartData)

    return (
        <Card className="flex flex-col gap-3 rounded-sm pb-3">
            <CardHeader className="items-center pb-0 px-4">
                <CardTitle>持有金额占比</CardTitle>
                <CardAction>
                    <Select value={activeProductCode}
                            onValueChange={(value) => {
                                setActiveProductCode(value);
                            }}>
                        <SelectTrigger className="w-[110px]">
                            <SelectValue>{activeProductCode}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>选择产品</SelectLabel>
                                {
                                    chartLegendConfig.map((item) => (
                                        <SelectItem key={item.productCode}
                                                    value={item.productCode}>
                                            {item.productName}
                                        </SelectItem>
                                    ))
                                }
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </CardAction>
            </CardHeader>
            <CardContent className="flex-1 pb-0 px-4">
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square max-h-[300px] w-full"
                >
                    <PieChart
                        margin={{
                            left: 0,
                            right: 0,
                        }}
                    >
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator={"line"}/>}
                        />
                        <Pie data={chartData}
                             dataKey="costAmount"
                             name="productCode"
                             label={true}
                             strokeWidth={1}
                             activeIndex={chartData.findIndex(it => it.productCode === activeProductCode)}
                             activeShape={({outerRadius = 0, ...props}: PieSectorDataItem) => (
                                 <Sector {...props} outerRadius={outerRadius + 6} className={"shadow-2xs"}/>
                             )}
                        >
                        </Pie>
                    </PieChart>
                </ChartContainer>
            </CardContent>
            <div className={"my-1 px-4"}>
                <Separator/>
            </div>
            <CardFooter className={"px-4 pt-0"}>
                <div className={"flex flex-col items-start justify-start gap-1 text-xs"}>
                    {chartLegendConfig
                        .map((item) => {
                            return (
                                <div
                                    key={item['productCode']}
                                    className={cn(
                                        "[&>svg]:text-muted-foreground flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3"
                                    )}
                                >
                                    <div className="h-2 w-2 shrink-0 rounded-[2px]"
                                         style={{
                                             backgroundColor: item.color,
                                         }}
                                    />

                                    {item.productName}
                                </div>
                            )
                        })}
                </div>
            </CardFooter>
        </Card>
    )
}

export default HoldingAmountDistributionChart
