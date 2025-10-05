"use client"

import HoldingProducts from "@/app/holdings/holding-products";
import {useEffect, useState} from "react";
import {fetchHoldings} from "@/app/holdings/my-holdings";
import {HoldingDTO} from "@/lib/types";
import {Badge} from "@/components/ui/badge";
import {PiggyBankIcon} from "lucide-react";

export function HoldingsCard() {
    const [holdings, setHoldings] = useState([] as HoldingDTO[])

    useEffect(() => {
        fetchHoldings()
            .then(data => {
                setHoldings(data)
                console.log(data)
            })
    }, [])

    return (
        <>
            <div className={"bg-background mt-3"}>
                <Badge variant={"secondary"} className={"mb-2"}><PiggyBankIcon/> My Holdings ({holdings.length})</Badge>
                <HoldingProducts holdings={holdings}/>
            </div>
        </>
    )
}