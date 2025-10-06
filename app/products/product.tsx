"use client"

import {BarChart3, Calendar, Code, TrendingDown, TrendingUp} from "lucide-react";
import {ProductDTO} from "@/lib/types";
import {Item, ItemContent, ItemTitle} from "@/components/ui/item";
import React from "react";
import Link from "next/link";

function Nav({value}: { value: number }) {
    return (
        <div className="flex flex-col">
            <span className="text-xs text-muted-foreground flex items-center">
                <BarChart3 className="h-3 w-3 mr-1"/>净值
            </span>
            <span className="font-semibold group-hover:scale-105 transition-transform">
                {value.toFixed(4)}
            </span>
        </div>
    )
}

function Change({value}: { value: number }) {
    const color = value > 0 ? "text-[var(--color-profit)]" : value < 0 ? "text-[var(--color-loss)]" : "text-muted-foreground";

    const icon = value > 0 ?
        <TrendingUp className={`mr-1 h-3 w-3 ${color}`}/> :
        value < 0 ? <TrendingDown className={`mr-1 h-3 w-3 ${color}`}/> : null;

    return (
        <div className="flex flex-col">
            <span className="text-xs text-muted-foreground flex items-center">{icon}跌涨幅</span>
            <div className="flex items-center">
                <span className={`font-semibold group-hover:scale-105 transition-transform ${color}`}>
                    {value > 0 ? "+" : ""}{value.toFixed(2)}%
                </span>
            </div>
        </div>
    )
}

export function Product(product: ProductDTO) {
    return (
        <Link href={`/products/${product.code}`}>
            <Item variant="outline" key={product.code} className={"gap-1 p-3"}>
                <ItemTitle className={"flex justify-between w-full overflow-hidden"}>
                    <div className={"w-3/4 line-clamp-1"}>
                        {product.name}
                    </div>
                    <div className="w-1/4 flex items-center justify-end text-xs text-muted-foreground">
                        <Code className="h-3 w-3 mr-1"/> {product.code}
                    </div>
                </ItemTitle>
                <ItemContent>
                    <div className="grid grid-cols-3 text-xs mt-2">
                        <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground flex items-center">
                                <Calendar className="h-3 w-3 mr-1"/>日期
                            </span>
                            <div className="font-semibold group-hover:scale-105 transition-transform">
                                {product.latestNav.date}
                            </div>
                        </div>
                        <Nav value={product.latestNav.value}/>
                        <Change value={product.latestNav.pctChange}/>
                    </div>
                </ItemContent>
            </Item>
        </Link>
    )
}