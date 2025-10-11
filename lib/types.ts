// 基金产品数据模型
export interface ProductDTO {
    id: string;
    name: string;
    code: string;
    latestNav: ProductNavDTO;
}

// 基金产品净值数据模型
export interface ProductNavDTO {
    productCode: string;
    productName: string;
    value: number;
    pctChange: number;
    date: string;
}

// 黄金价格数据模型
export interface GoldPriceDTO {
    time: string,
    price: string
}

export interface HoldingDTO {
    productCode: string;
    productName: string;
    shares: number;
    costAmount: number;
    startHoldingDate: string;
}

export interface WatchlistItemDTO {
    id: number;
    symbol: string;
    exchange: string;
    flag: string;
    description: string;
    type: string;
    url: string;
}

export interface InvestingPlatformConfig {
    supports_search: boolean,
    supports_group_request: boolean,
    supports_marks: boolean,
    exchanges: ExchangeInfoDTO[],
    symbolsTypes: never[],
    supportedResolutions: string[]
}

export interface ExchangeInfoDTO {
    id: string;
    name: string;
    value: string;
    desc: string;
    opentime: string;
    closetime: string;
    week_end_day: string;
    week_start_day: string;
    timezone: string;
    country: string;
}

export interface InvestingChartDataPoint {
    time: number;
    price: number | null;
}