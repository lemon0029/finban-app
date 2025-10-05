"use client"

import {toast} from "sonner";
import {ItemGroup} from "@/components/ui/item";
import React, {useEffect, useState} from "react";
import {HoldingDTO} from "@/lib/types";
import {Separator} from "@/components/ui/separator";
import {Badge} from "@/components/ui/badge";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import HoldingAmountDistributionChart from "@/app/holdings/amount-distribution";
import IndexGroupDistributionChart from "@/app/holdings/index-group-distribution";

async function fetchHoldings() {
    const baseUrl = process.env.API_BASE_URL
    const response = await fetch(`${baseUrl}/account/holdings`, {credentials: "include"})
    return await response.json();
}

export default function Holdings() {
    const [holdings, setHoldings] = useState([] as HoldingDTO[])

    useEffect(() => {
        fetchHoldings().then(data => {
            setHoldings(data)
        }).catch((ex) => {
            console.error(ex)
            toast.error("Failed to fetch holdings data")
        })
    }, [])

    return (
        <>
            <Tabs defaultValue="products" className="w-full">
                <TabsList className={"w-full mb-2"}>
                    <TabsTrigger value="products">Products</TabsTrigger>
                    <TabsTrigger value="distribution">Distribution</TabsTrigger>
                </TabsList>
                <TabsContent value="products">
                    <ItemGroup className={"flex w-full flex-col gap-3"}>
                        {
                            holdings.map(item =>
                                (<React.Fragment key={item.productCode}>
                                        <Card key={item.productCode} className={"gap-2 pb-2 pt-3 rounded-md shadow-xs"}>
                                            <CardHeader className={"px-3"}>
                                                <CardTitle className={"text-sm"}>{item.productName}</CardTitle>
                                            </CardHeader>
                                            <CardContent className={"py-1 px-3"}>
                                                <div className="grid grid-cols-3 w-full">
                                                    <div className="flex flex-col">
                                                            <span
                                                                className="text-xs text-muted-foreground flex items-center">
                                                                09月30日盈亏
                                                            </span>
                                                        <div
                                                            className="text-sm font-medium text-[var(--color-profit)]">
                                                            +10.89
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col">
                                                            <span
                                                                className="text-xs text-muted-foreground flex items-center">
                                                                持有盈亏
                                                            </span>
                                                        <div
                                                            className="text-sm font-medium text-[var(--color-profit)]">
                                                            +899.23
                                                        </div>
                                                    </div>

                                                    <div className="self-end flex flex-col">
                                                            <span
                                                                className="text-xs text-muted-foreground flex items-center">
                                                                总金额
                                                            </span>
                                                        <div
                                                            className="text-sm font-medium">
                                                            {item.costAmount.toFixed(2)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                            <div className={"my-1 px-3"}>
                                                <Separator/>
                                            </div>
                                            <CardFooter className={"mb-0 px-3"}>
                                                <Badge variant={"secondary"}
                                                       className={"text-[10px] text-[var(--color-profit)]"}>
                                                    持有收益率 100%
                                                </Badge>
                                            </CardFooter>
                                        </Card>
                                    </React.Fragment>
                                )
                            )
                        }
                    </ItemGroup>
                </TabsContent>
                <TabsContent value="distribution" className={"flex flex-col space-y-2"}>
                    <HoldingAmountDistributionChart holdings={holdings}/>
                    <IndexGroupDistributionChart holdings={holdings}/>
                </TabsContent>
            </Tabs>
        </>
    )
}