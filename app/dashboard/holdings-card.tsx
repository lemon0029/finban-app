"use client"

import HoldingProducts from "@/app/holdings/holding-products";
import {Badge} from "@/components/ui/badge";
import {PiggyBankIcon} from "lucide-react";
import {toast} from "sonner";
import {Skeleton} from "@/components/ui/skeleton";
import {Empty, EmptyDescription, EmptyTitle} from "@/components/ui/empty";
import React from "react";
import {useHoldings} from "@/lib/api";

export function HoldingsCard() {
    const {data, error, isLoading} = useHoldings()

    if (error) {
        toast.error("Failed fetch holdings data")
        return (
            <>
                <div className={"bg-background mt-3"}>
                    <Badge variant={"secondary"} className={"mb-2"}><PiggyBankIcon/> My Holdings</Badge>
                    <Empty>
                        <EmptyTitle>No data</EmptyTitle>
                        <EmptyDescription>No holdings found.</EmptyDescription>
                    </Empty>
                </div>
            </>
        )
    }

    if (isLoading) {
        return (
            <>
                <div className={"bg-background mt-3"}>
                    <Badge variant={"secondary"} className={"mb-2"}><PiggyBankIcon/> My Holdings</Badge>
                    <div>
                        <p className="text-muted-foreground ml-1 mb-3">Loading...</p>
                        <div className="flex flex-col gap-2">
                            <Skeleton className="h-20 w-full"/>
                            <Skeleton className="h-20 w-full"/>
                            <Skeleton className="h-20 w-2/3"/>
                        </div>
                    </div>
                </div>
            </>
        )
    }

    return (
        <>
            <div className={"bg-background mt-3"}>
                <Badge variant={"secondary"} className={"mb-2"}><PiggyBankIcon/> My Holdings ({data!.length})</Badge>
                {
                    data!.length === 0 ? (
                        <Empty>
                            <EmptyTitle>No data</EmptyTitle>
                            <EmptyDescription>No holdings found.</EmptyDescription>
                        </Empty>
                    ) : <HoldingProducts holdings={data!}/>
                }
            </div>
        </>
    )
}