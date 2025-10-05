"use client"

import {toast} from "sonner";
import React, {useEffect, useState} from "react";
import {HoldingDTO} from "@/lib/types";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import HoldingAmountDistributionChart from "@/app/holdings/amount-distribution";
import IndexGroupDistributionChart from "@/app/holdings/index-group-distribution";
import HoldingProducts from "@/app/holdings/holding-products";

export async function fetchHoldings() {
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
                    <HoldingProducts holdings={holdings}/>
                </TabsContent>
                <TabsContent value="distribution" className={"grid grid-cols-1 lg:grid-cols-2 gap-3"}>
                    <HoldingAmountDistributionChart holdings={holdings}/>
                    <IndexGroupDistributionChart holdings={holdings}/>
                </TabsContent>
            </Tabs>
        </>
    )
}