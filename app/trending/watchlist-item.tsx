import {Item, ItemActions, ItemContent, ItemDescription, ItemTitle} from "@/components/ui/item";
import {Badge} from "@/components/ui/badge";
import AnimatedNumber from "@/components/animated-number";
import {CheckIcon, PlusIcon, TrendingDownIcon, TrendingUpIcon} from "lucide-react";
import {Button} from "@/components/ui/button";
import React from "react";
import {WatchlistItemDTO} from "@/lib/types";

// WatchlistItemProps
export interface WatchlistItemProps {
    item: WatchlistItemDTO
    isSearchResultItem: boolean
    isInWatchlist: boolean
    lastValue: { last: number; pctChange: number }
    addToWatchlist: (item: WatchlistItemDTO) => void
    removeFromWatchlist: (item: WatchlistItemDTO) => void
    onClick: (item: never) => void
}

export function WatchlistItem({
                                  item,
                                  isSearchResultItem,
                                  isInWatchlist,
                                  lastValue,
                                  addToWatchlist,
                                  removeFromWatchlist,
                                  onClick,
                              }: WatchlistItemProps) {
    return (
        <Item className={"px-0"} onClick={onClick}>
            <ItemContent>
                <ItemTitle className={"font-bold"}>
                    {item.symbol}
                    {item.type && <Badge className={"text-[8px]"}
                                         variant={"secondary"}>{item.type}</Badge>}
                </ItemTitle>
                <ItemDescription className={"overflow-ellipsis line-clamp-1"}>
                    {item.description}
                </ItemDescription>
            </ItemContent>

            {
                !isSearchResultItem && (
                    <ItemContent>
                        {
                            lastValue && lastValue.last && (
                                <ItemTitle className={"flex justify-end w-full"}>
                                    {<AnimatedNumber value={lastValue.last}
                                                     bgFlashEnabled={true}/>}
                                </ItemTitle>
                            )
                        }
                        {
                            lastValue && lastValue.pctChange && (
                                <Badge variant={"secondary"}
                                       className={`${lastValue.pctChange > 0 ? "bg-[var(--color-profit)]/10 text-[var(--color-profit)]" : "bg-[var(--color-loss)]/10 text-[var(--color-loss)]"}`}
                                >
                                    {
                                        lastValue.pctChange > 0 ? (
                                            <TrendingUpIcon className={"h-4 w-4"}/>
                                        ) : (
                                            <TrendingDownIcon className={"h-4 w-4"}/>
                                        )
                                    }
                                    <span>
                                        {<AnimatedNumber value={lastValue.pctChange}/>}%
                                    </span>
                                </Badge>
                            )
                        }
                    </ItemContent>
                )
            }

            {
                isSearchResultItem && (
                    <ItemActions>
                        <Button variant="ghost"
                                size="icon"
                                className="rounded-full"
                                onClick={(e) => {
                                    e.stopPropagation()

                                    if (isInWatchlist) {
                                        removeFromWatchlist(item)
                                    } else {
                                        addToWatchlist(item)
                                    }
                                }}
                        >
                            {
                                isInWatchlist ? (
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
    )
}