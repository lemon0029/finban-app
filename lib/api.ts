import useSWR from "swr";
import {HoldingDTO} from "@/lib/types";

const fetcher = (url: string | URL | Request) => fetch(url).then((r) => r.json())

export async function fetchProducts() {
    const res = await fetch(`/api/products`, {credentials: "include"})
    return await res.json()
}

export async function searchProducts(keyword: string) {
    const res = await fetch(`/api/products/search?keyword=${encodeURIComponent(keyword)}`, {credentials: "include"})
    return await res.json()
}

export async function fetchHoldings() {
    const response = await fetch(`/api/account/holdings`, {credentials: "include"})
    return await response.json();
}

export function useHoldings() {
    return useSWR<HoldingDTO[]>("/api/account/holdings", fetcher)
}

export async function fetchGoldPrice(dateRange: string) {
    if (dateRange === "0") {
        const response = await fetch("/external/igoldaccount/golddetail/time-price", {method: "POST"});
        return await response.json();
    }

    const response = await fetch("/external/igoldaccount/golddetail/history-price", {
        method: "POST",
        body: JSON.stringify({month: dateRange}),
        headers: {'Content-Type': 'application/json'}
    });
    return await response.json();
}

export async function fetchCSI300IndexData(dateRange: string) {
    if (dateRange == "1d") {
        const response = await fetch("/external/appstock/app/minute/query?_var=min_data_sh000300&code=sh000300", {credentials: "omit"});
        return await response.text();
    } else if (dateRange === "1w") {
        const response = await fetch("/external/appstock/app/day/query?_var=fdays_data_sh000300&code=sh000300", {credentials: "omit"});
        return await response.text();
    } else {
        let day: number = 30
        if (dateRange === "1m") {
            day = 30
        } else if (dateRange === "3m") {
            day = 90
        } else if (dateRange === "6m") {
            day = 180
        } else if (dateRange === "1y") {
            day = 320
        } else if (dateRange === "3y") {
            day = 1000
        } else if (dateRange === "5y") {
            day = 1600
        }

        const response = await fetch(`/external/ifzqgtimg/appstock/app/newfqkline/get?_var=kline_dayqfq&param=sh000300,day,,,${day},qfq`, {credentials: "omit"});
        return await response.text();
    }
}

export async function fetchNDXData(dateRange: string) {
    if (dateRange == "1d") {
        const response = await fetch("/external/api/quote/NDX/chart?assetclass=index");
        return await response.json();
    }

    const today = new Date();
    let fromDate: string;
    if (dateRange === "1w") {
        const pastDate = new Date();
        pastDate.setDate(today.getDate() - 7); // 7天前，考虑到周末
        fromDate = pastDate.toISOString().split('T')[0];
    } else if (dateRange === "1m") {
        const pastDate = new Date();
        pastDate.setMonth(today.getMonth() - 1);
        fromDate = pastDate.toISOString().split('T')[0];
    } else if (dateRange === "6m") {
        const pastDate = new Date();
        pastDate.setMonth(today.getMonth() - 6);
        fromDate = pastDate.toISOString().split('T')[0];
    } else if (dateRange === "ytd") {
        const pastDate = new Date(today.getFullYear(), 0, 1);
        fromDate = pastDate.toISOString().split('T')[0];
    } else if (dateRange === "1y") {
        const pastDate = new Date();
        pastDate.setFullYear(today.getFullYear() - 1);
        fromDate = pastDate.toISOString().split('T')[0];
    } else if (dateRange === "5y") {
        const pastDate = new Date();
        pastDate.setFullYear(today.getFullYear() - 5);
        fromDate = pastDate.toISOString().split('T')[0];
    } else { // 10y
        const pastDate = new Date();
        pastDate.setFullYear(today.getFullYear() - 10);
        fromDate = pastDate.toISOString().split('T')[0];
    }

    const endDate = today.toISOString().split('T')[0];

    const response = await fetch(`/external/api/quote/NDX/chart?assetclass=index&fromdate=${fromDate}&todate=${endDate}`, {
        next: {revalidate: 3600}
    });
    return await response.json();
}


export async function fetchXAUUSDData(period: string) {
    const baseUrl = "https://api.investing.com/api/financialdata/68/historical/chart"

    if (period === "1d") {
        const today = new Date();
        const to = Math.floor(today.getTime() / 1000);
        const from = Math.floor(today.getTime() / 1000 - 86400);

        const response = await fetch(`/api/investing-proxy/chart/xau-usd?from=${from}&to=${to}`);
        return await response.json();
    } else if (period === "1w") {
        const response = await fetch(`${baseUrl}?interval=PT30M&period=P1W&pointscount=160`);
        return await response.json();
    } else if (period === "1m") {
        const response = await fetch(`${baseUrl}?interval=PT5H&period=P1M&pointscount=160`);
        return await response.json();
    } else if (period === "3m") {
        const response = await fetch(`${baseUrl}?interval=P1D&period=P3M&pointscount=160`);
        return await response.json();
    } else if (period === "6m") {
        const response = await fetch(`${baseUrl}?interval=P1D&period=P6M&pointscount=160`);
        return await response.json();
    } else if (period === "1y") {
        const response = await fetch(`${baseUrl}?interval=P1W&period=P1Y&pointscount=160`);
        return await response.json();
    } else if (period === "5y") {
        const response = await fetch(`${baseUrl}?interval=P1M&period=P5Y&pointscount=160`);
        return await response.json();
    } else if (period === "max") {
        const response = await fetch(`${baseUrl}?interval=P1M&period=MAX&pointscount=160`);
        return await response.json();
    }
}