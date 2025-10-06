"use client"

import {ItemGroup} from "@/components/ui/item";
import React from "react";
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Separator} from "@/components/ui/separator";
import {Badge} from "@/components/ui/badge";
import {HoldingDTO} from "@/lib/types";
import Link from "next/link";

function HoldingProductCard({item}: { item: HoldingDTO }) {
    return (
        <Card key={item.productCode} className={"gap-2 pb-2 pt-3 rounded-md shadow-xs"}>
            <CardHeader className={"px-3 line-clamp-1"}>
                <CardTitle className={"text-sm"}>{item.productName}</CardTitle>
            </CardHeader>
            <CardContent className={"py-1 px-3"}>
                <div className="grid grid-cols-3 w-full">
                    <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground flex items-center">
                            09月30日盈亏
                        </span>
                        <div
                            className="text-sm font-medium text-[var(--color-profit)]">
                            +10.89
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground flex items-center">
                            持有盈亏
                        </span>
                        <div
                            className="text-sm font-medium text-[var(--color-profit)]">
                            +899.23
                        </div>
                    </div>

                    <div className="self-end flex flex-col">
                        <span className="text-xs text-muted-foreground flex items-center">
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
    )
}

export default function HoldingProducts({holdings}: { holdings: HoldingDTO[] }) {
    return (
        <ItemGroup className={"grid grid-cols-1 lg:grid-cols-3 gap-3"}>
            {
                holdings.map(item =>
                    (
                        <React.Fragment key={item.productCode}>
                            <Link href={`/holdings/${item.productCode}`}>
                                <HoldingProductCard item={item}/>
                            </Link>
                        </React.Fragment>
                    )
                )
            }
        </ItemGroup>
    )
}