"use client"

import {BarChart3, Calendar, Code, TrendingDown, TrendingUp} from "lucide-react";
import {ProductDTO} from "@/lib/types";
import {Item, ItemContent, ItemFooter, ItemTitle} from "@/components/ui/item";
import React from "react";

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
        <Item variant="outline" key={product.code} className={"gap-2 p-3"}>
            <ItemContent>
                <ItemTitle>{product.name}</ItemTitle>
                <ItemFooter className="flex items-center text-xs mt-2">
                    <div className="flex gap-10">
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
                </ItemFooter>
            </ItemContent>
            <ItemContent className={"self-start"}>
                <div className="flex justify-end items-center text-xs text-muted-foreground">
                    <Code className="h-3 w-3 mr-1"/> {product.code}
                </div>
            </ItemContent>
        </Item>
    )
}