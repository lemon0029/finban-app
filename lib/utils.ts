import {type ClassValue, clsx} from "clsx"
import {twMerge} from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function parseYYYYMMDD(str: string) {
    const y = str.slice(0, 4)
    const m = str.slice(4, 6)
    const d = str.slice(6, 8)
    return new Date(`${y}-${m}-${d}`)
}

export function parseYYYYMMDDHHMM(str: string) {
    const year = parseInt(str.slice(0, 4));
    const month = parseInt(str.slice(4, 6)) - 1;
    const day = parseInt(str.slice(6, 8));
    const hour = parseInt(str.slice(8, 10));
    const minute = parseInt(str.slice(10, 12));

    return new Date(year, month, day, hour, minute, 0);
}

export function getDateRangeLabel(dateRange: string) {

    if (dateRange === "1d") {
        return new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric"
        })
    }

    if (dateRange === "5d") {
        return "the past 5 days"
    } else if (dateRange === "1m") {
        return "Past Month"
    } else if (dateRange === "ytd") {
        return "Year to Date"
    } else if (dateRange === "5y") {
        return "Past 5 Years"
    } else if (dateRange === "1y") {
        return "Past Year"
    } else if (dateRange === "6m") {
        return "Past 6 Months"
    } else if (dateRange == "10y") {
        return "Past 10 Years"
    } else if (dateRange === "3m") {
        return "Past 3 Months"
    } else if (dateRange === "3y") {
        return "Past 3 Years"
    } else if (dateRange == "1w") {
        return "Past Week"
    } else if (dateRange == "max") {
        return "the entire history"
    } else if (dateRange == "all_time") {
        return "All Time"
    }

    return "unknown period"
}