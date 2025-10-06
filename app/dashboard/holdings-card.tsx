"use client"

import HoldingProducts from "@/app/holdings/holding-products";
import {Badge} from "@/components/ui/badge";
import {ChevronsUpDown, PiggyBankIcon} from "lucide-react";
import {toast} from "sonner";
import {Skeleton} from "@/components/ui/skeleton";
import {Empty, EmptyDescription, EmptyTitle} from "@/components/ui/empty";
import React, {useState} from "react";
import {useHoldings} from "@/lib/api";
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from "@/components/ui/collapsible";
import {Button} from "@/components/ui/button";

export function HoldingsCard() {
    const {data, error, isLoading} = useHoldings()
    const [isOpen, setIsOpen] = useState(true)

    if (error) {
        toast.error("Failed fetch holdings data")
        return (
            <>
                <div className={"bg-background mt-3"}>
                    <Badge variant={"secondary"} className={"mb-3"}><PiggyBankIcon/> My Holdings</Badge>
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
                    <Badge variant={"secondary"} className={"mb-3"}><PiggyBankIcon/> My Holdings</Badge>
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
            <Collapsible
                open={isOpen}
                onOpenChange={setIsOpen}
                className="flex w-full flex-col gap-2 mt-3"
            >
                <div className="flex justify-between items-center gap-2">
                    <Badge variant={"secondary"} className={"h-6"}>
                        <PiggyBankIcon/> My Holdings ({data!.length})
                    </Badge>
                    <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                            <ChevronsUpDown/>
                            <span className="sr-only">Toggle</span>
                        </Button>
                    </CollapsibleTrigger>
                </div>
                <CollapsibleContent className="flex flex-col gap-2">
                    {
                        data!.length === 0 ? (
                            <Empty>
                                <EmptyTitle>No data</EmptyTitle>
                                <EmptyDescription>No holdings found.</EmptyDescription>
                            </Empty>
                        ) : <HoldingProducts holdings={data!}/>
                    }
                </CollapsibleContent>
            </Collapsible>
        </>
    )
}