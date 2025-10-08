"use client"

import {Input} from "@/components/ui/input";
import React, {useEffect, useRef, useState} from "react";
import {CheckIcon, PlusIcon, Search, TrendingDownIcon, TrendingUpIcon, XIcon} from "lucide-react";
import {Button} from "@/components/ui/button";
import {fetchInvestingChartDataByInterval, fetchInvestingChartDataChanges, investingSearch} from "@/lib/api";
import {toast} from "sonner";
import {
    Item,
    ItemActions,
    ItemContent,
    ItemDescription,
    ItemGroup,
    ItemSeparator,
    ItemTitle
} from "@/components/ui/item";
import {Drawer, DrawerContent, DrawerFooter, DrawerHeader} from "@/components/ui/drawer";
import {DialogDescription, DialogTitle} from "@/components/ui/dialog";
import {Badge} from "@/components/ui/badge";
import {Separator} from "@/components/ui/separator";
import {ResponsiveContainer} from "recharts";
import InvestingChart from "@/app/trending/investing-chart";
import {Skeleton} from "@/components/ui/skeleton";
import {ScrollArea} from "@/components/ui/scroll-area";
import {InvestingStreamingData, PidInfo} from "@/lib/investing-api/streaming-data";
import AnimatedNumber from "@/components/animated-number";

export default function Watchlist() {
    const [searchTerm, setSearchTerm] = useState("")
    const [isSearching, setIsSearching] = useState(false)
    const [searchItems, setSearchItems] = useState([])
    const [openDialog, setOpenDialog] = useState(false)
    const [selectedItem, setSelectedItem] = useState()

    const [watchlist, setWatchlist] = useState([])
    const [lastValues, setLastValues] = useState({})
    const [historyDataLoaded, setHistoryDataLoaded] = useState(false)

    const streaming = useRef<InvestingStreamingData>(null)

    const handleSearch = () => {
        if (searchTerm) {
            setIsSearching(true)

            investingSearch(searchTerm)
                .then(data => {
                    setSearchItems(data["quotes"])
                    setIsSearching(false)
                })
                .catch(ex => {
                    console.error(ex)
                    toast.error("Failed to invoke search action")
                    setIsSearching(false)
                })
        }
    }

    const getItems = () => {
        if (searchTerm !== "") {
            return searchItems
        }

        return watchlist
    }

    useEffect(() => {
        const wp: Promise<void>[] = []

        watchlist.forEach((item) => {
            const data1 = fetchInvestingChartDataChanges(item["id"])
            const data2 = fetchInvestingChartDataByInterval(item["id"], "PT1M", 60)

            const p = Promise.all([data1, data2])
                .then(([data1, data2]) => {
                    setLastValues(prevObject => {
                        return {
                            ...prevObject,
                            [item["id"]]: {
                                pctChange: data1["pct_1d"],
                                last: data2["data"][data2["data"].length - 1][4]
                            }
                        }
                    })

                    setHistoryDataLoaded(true)
                })
                .catch(ex => {
                    console.error(ex)
                    toast.error("Failed to update watchlist")
                })

            wp.push(p)
        })

        Promise.all(wp).then(() => {
            console.log("Watchlist updated")
        })
    }, [watchlist])

    useEffect(() => {

        if (!historyDataLoaded) {
            return
        }

        if (streaming.current != null) {
            streaming.current.close()
            streaming.current = null
            console.log("Closed stream")
        }

        if (openDialog) {
            return
        }

        if (watchlist.length === 0) {
            return
        }

        streaming.current = new InvestingStreamingData()

        streaming.current.on('open', () => {
            const pairIds = watchlist.map(item => item["id"]);
            streaming.current!.subscribe(pairIds)
            console.log("Subscribed to pairIds: ", pairIds)
        })

        streaming.current.on('data', (data: PidInfo) => {
            console.log(data)

            setLastValues(prevObject => {
                return {
                    ...prevObject,
                    [data.pid]: {
                        last: data.last,
                        pctChange: (data.pc / data.last_close * 100)
                    }
                }
            })
        })
    }, [watchlist, openDialog, historyDataLoaded]);

    return (
        <div className="flex items-center gap-2 flex-wrap">
            <div className={"relative flex-1"}>
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                <Input
                    name="externalSearch"
                    placeholder="Search for stocks, ETFs & more"
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value)
                        handleSearch()
                    }}
                    className="pl-10"
                />
                {searchTerm && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                        onClick={() => setSearchTerm("")}
                    >
                        <XIcon className="h-4 w-4"/>
                        <span className="sr-only">Clear</span>
                    </Button>
                )}
            </div>

            {isSearching ? (
                <div className={"flex flex-col w-full gap-3 mt-3"}>
                    <Skeleton className={"h-[80px]"}/>
                    <Skeleton className={"h-[80px]"}/>
                    <Skeleton className={"w-2/3 h-[80px]"}/>
                </div>
            ) : (
                <div className={"flex flex-col w-full gap-3"}>
                    <ScrollArea>
                        <ItemGroup>
                            {
                                getItems().map((item, index) => (
                                    <React.Fragment key={item["id"]}>
                                        <Item className={"px-0"}
                                              onClick={() => {
                                                  setSelectedItem(item)
                                                  setOpenDialog(true)
                                              }}
                                        >
                                            <ItemContent>
                                                <ItemTitle className={"font-bold"}>
                                                    {item["symbol"]}
                                                    {item["type"] && <Badge className={"text-[8px]"}
                                                                            variant={"secondary"}>{item["type"]}</Badge>}
                                                </ItemTitle>
                                                <ItemDescription className={"overflow-ellipsis line-clamp-1"}>
                                                    {item["description"]}
                                                </ItemDescription>
                                            </ItemContent>
                                            {
                                                searchTerm === "" && (
                                                    <ItemContent>
                                                        {lastValues[item["id"]] && lastValues[item["id"]]["last"] && (
                                                            <ItemTitle className={"flex justify-end w-full"}>
                                                                {<AnimatedNumber value={lastValues[item["id"]]["last"]}
                                                                                 flash={true}/>}
                                                            </ItemTitle>
                                                        )}
                                                        {
                                                            lastValues[item["id"]] && lastValues[item["id"]]["pctChange"] && (
                                                                <Badge variant={"secondary"}
                                                                       className={`${lastValues[item["id"]]["pctChange"] > 0 ? "bg-[var(--color-profit)]/10 text-[var(--color-profit)]" : "bg-[var(--color-loss)]/10 text-[var(--color-loss)]"}`}
                                                                >
                                                                    {
                                                                        lastValues[item["id"]]["pctChange"] > 0 ? (
                                                                            <TrendingUpIcon className={"h-4 w-4"}/>
                                                                        ) : (
                                                                            <TrendingDownIcon className={"h-4 w-4"}/>
                                                                        )
                                                                    }
                                                                    <span>
                                                                        {<AnimatedNumber
                                                                            value={lastValues[item["id"]]["pctChange"]}/>}%
                                                                    </span>
                                                                </Badge>
                                                            )
                                                        }
                                                    </ItemContent>
                                                )
                                            }
                                            {
                                                searchTerm !== "" && (
                                                    <ItemActions>
                                                        <Button variant="ghost"
                                                                size="icon"
                                                                className="rounded-full"
                                                                onClick={(e) => {
                                                                    e.stopPropagation()

                                                                    if (watchlist.some(it => it["id"] === item["id"])) {
                                                                        return
                                                                    }

                                                                    setWatchlist([...watchlist, item])
                                                                }}
                                                        >
                                                            {
                                                                watchlist.some(it => it["id"] === item["id"]) ? (
                                                                    <CheckIcon className="h-4 w-4"/>
                                                                ) : (
                                                                    <PlusIcon className="h-4 w-4"/>
                                                                )
                                                            }
                                                        </Button>
                                                    </ItemActions>
                                                )
                                            }
                                        </Item>
                                        {index !== searchItems.length - 1 && <ItemSeparator/>}
                                    </React.Fragment>
                                ))
                            }
                        </ItemGroup>
                    </ScrollArea>
                </div>
            )}

            <Drawer open={openDialog} onOpenChange={setOpenDialog}>
                <DrawerContent className={"!rounded-t-2xl"}>
                    <DrawerHeader className={"pb-1"}>
                        <DialogTitle className={"mb-1 text-left flex flex-wrap w-full"}>
                            <div className={"mr-2 text-xl flex items-end"}>
                                {selectedItem && selectedItem["symbol"]}
                            </div>
                            <div className={"text-sm text-muted-foreground flex items-center"}>
                                {selectedItem && selectedItem["description"]}
                            </div>
                        </DialogTitle>

                        {
                            selectedItem && selectedItem["type"] && (
                                <DialogDescription className={"text-left"}>
                                    {selectedItem["type"]} / {selectedItem["flag"]}
                                </DialogDescription>
                            )
                        }

                        <Separator className={"my-1"}/>
                    </DrawerHeader>

                    {selectedItem && (
                        <ResponsiveContainer className={"px-4"}>
                            <InvestingChart data={selectedItem}/>
                        </ResponsiveContainer>
                    )}

                    <DrawerFooter>
                        <Button variant={"outline"}>
                            {selectedItem && watchlist.some(it => it["id"] === selectedItem["id"]) ? (
                                <span>Remove from watchlist</span>
                            ) : (
                                <span>Add to watchlist</span>
                            )}
                        </Button>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </div>
    )
}