"use client"

import {Input} from "@/components/ui/input";
import React, {useEffect, useRef, useState} from "react";
import {Search, XIcon} from "lucide-react";
import {Button} from "@/components/ui/button";
import {fetchInvestingChartDataByInterval, fetchInvestingChartDataChanges} from "@/lib/api";
import {toast} from "sonner";
import {ItemGroup, ItemSeparator} from "@/components/ui/item";
import {Drawer, DrawerContent, DrawerFooter, DrawerHeader} from "@/components/ui/drawer";
import {DialogDescription, DialogTitle} from "@/components/ui/dialog";
import {Separator} from "@/components/ui/separator";
import {ResponsiveContainer} from "recharts";
import InvestingChart from "@/app/trending/investing-chart";
import {Skeleton} from "@/components/ui/skeleton";
import {ScrollArea} from "@/components/ui/scroll-area";
import {InvestingStreamingData, PidInfo} from "@/lib/investing-api/streaming-data";
import {useDebounce} from "use-debounce";
import useSWR from "swr";
import {WatchlistItem} from "@/app/trending/watchlist-item";
import {WatchlistItemDTO} from "@/lib/types";

export default function Watchlist() {
    const [searchTerm, setSearchTerm] = useState("")
    const [debouncedSearchTerm] = useDebounce(searchTerm, 300)
    const [openDialog, setOpenDialog] = useState(false)
    const [selectedItem, setSelectedItem] = useState<WatchlistItemDTO | null>()

    const [watchlist, setWatchlist] = useState<WatchlistItemDTO[]>([])
    const [lastValues, setLastValues] = useState({} as { [id: number]: { last: number, pctChange: number } })
    const [historyDataLoaded, setHistoryDataLoaded] = useState(false)

    const streaming = useRef<InvestingStreamingData>(null)

    const {data, isLoading} = useSWR(
        debouncedSearchTerm ? `https://api.investing.com/api/search/v2/search?q=${debouncedSearchTerm}` : null,
        (url) => fetch(url).then((res) => res.json())
    )

    const getItems = () => {
        if (searchTerm !== "" && data) {
            return data["quotes"] as never[]
        }

        return watchlist
    }

    const loadWatchlist = () => {
        const items = localStorage.getItem("watchlist") || "[]"
        setWatchlist(JSON.parse(items))
    };

    const removeFromWatchlist = (item: WatchlistItemDTO) => {
        const newWatchlist = watchlist.filter(wi => wi["id"] !== item["id"])

        setWatchlist(newWatchlist)
        localStorage.setItem("watchlist", JSON.stringify(newWatchlist))
    }

    const addToWatchlist = (item: WatchlistItemDTO) => {
        const newWatchlist = [...watchlist, item]

        setWatchlist(newWatchlist)
        localStorage.setItem("watchlist", JSON.stringify(newWatchlist))
    }

    useEffect(() => {
        loadWatchlist()
    }, [])

    useEffect(() => {
        const wp: Promise<void>[] = []

        watchlist.forEach((item) => {
            const data1 = fetchInvestingChartDataChanges(item["id"])
            const data2 = fetchInvestingChartDataByInterval(item["id"], "PT1M", 60)

            const p = Promise.all([data1, data2])
                .then(([data1, data2]) => {
                    setLastValues(prevObject => {
                        const lastPoint = data2["data"][data2["data"].length - 1]
                        return {
                            ...prevObject,
                            [item["id"]]: {
                                pctChange: data1["pct_1d"],
                                last: lastPoint ? lastPoint[4] : null
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

        if (streaming.current != null) {
            streaming.current.close()
            streaming.current = null
            console.log("Closed stream")
        }

        if (!historyDataLoaded) {
            return
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
                    onChange={(e) => setSearchTerm(e.target.value)}
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

            {isLoading ? (
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
                                        <WatchlistItem item={item}
                                                       isSearchResultItem={searchTerm !== ""}
                                                       isInWatchlist={watchlist.some(wi => wi["id"] === item["id"])}
                                                       lastValue={lastValues[item.id]}
                                                       addToWatchlist={addToWatchlist}
                                                       removeFromWatchlist={removeFromWatchlist}
                                                       onClick={() => {
                                                           setOpenDialog(true)
                                                           setSelectedItem(item)
                                                       }}
                                        />
                                        {index !== getItems().length - 1 && <ItemSeparator/>}
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
                        <Button variant={"outline"} onClick={() => {

                            if (!selectedItem) {
                                return
                            }

                            if (watchlist.some(it => it["id"] === selectedItem["id"])) {
                                removeFromWatchlist(selectedItem)
                                setOpenDialog(false)
                            } else {
                                addToWatchlist(selectedItem)
                            }
                        }}>
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