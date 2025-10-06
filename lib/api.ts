import useSWR from "swr";
import {HoldingDTO} from "@/lib/types";

const fetcher = (url: string | URL | Request) => fetch(url).then((r) => r.json())

export function useHoldings() {
    return useSWR<HoldingDTO[]>("/api/account/holdings", fetcher)
}