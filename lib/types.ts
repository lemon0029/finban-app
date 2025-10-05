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