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
            day: "2-digit"
        })
    }

    if (dateRange === "5d") {
        return "the past 5 days"
    } else if (dateRange === "1m") {
        return "the past month"
    } else if (dateRange === "ytd") {
        return "the year to date"
    } else if (dateRange === "5y") {
        return "the past 5 years"
    } else if (dateRange === "1y") {
        return "the past year"
    } else if (dateRange === "6m") {
        return "the past 6 months"
    } else if (dateRange == "10y") {
        return "the past 10 years"
    } else if (dateRange === "3m") {
        return "the past 3 months"
    } else if (dateRange === "3y") {
        return "the past 3 years"
    } else if (dateRange == "1w") {
        return "the past week"
    } else if (dateRange == "max") {
        return "the entire history"
    }

    return "unknown period"
}