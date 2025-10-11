import {InvestingPlatformConfig} from "@/lib/types";
import useSWR from "swr";

export function useInvestingPlatformConfig() {
    const fetcher = (url: string | URL | Request) => fetch(url).then(res => res.json());
    const {data, isLoading, error} = useSWR<InvestingPlatformConfig>("/api/investing-proxy/platform-config", fetcher, {
        revalidateOnFocus: false,
    })

    return {
        investingPlatformConfig: data,
        isLoading,
        error
    }
}