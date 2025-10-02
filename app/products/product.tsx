"use client"

import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {BarChart3, Calendar, Code, TrendingDown, TrendingUp} from "lucide-react";
import {ProductDTO} from "@/lib/types";

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
        <Card
            className="overflow-hidden rounded-md group hover:shadow-md transition-all duration-300 hover:translate-y-[-2px] py-0 gap-2">
            <CardHeader className="pb-1 pt-3 px-3">
                <CardTitle className="text-base font-bold truncate">{product.name}</CardTitle>
                <CardDescription className="flex items-center text-xs">
                    <Code className="h-3 w-3 mr-1"/>
                    {product.code}
                </CardDescription>
            </CardHeader>
            <CardContent className="px-3 py-0">
                <div className="grid grid-cols-2">
                    <Nav value={product.latestNav.value}/>
                    <Change value={product.latestNav.pctChange}/>
                </div>
            </CardContent>
            <CardFooter className="pt-0 pb-2 px-3 text-xs text-muted-foreground">
                <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1"/>
                    {product.latestNav.date}
                </div>
            </CardFooter>
        </Card>
    )
}