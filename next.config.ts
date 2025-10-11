import type {NextConfig} from "next";

const nextConfig: NextConfig = {
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: `${process.env.API_BASE_URL || "http://192.168.1.4:8080/api"}/:path*`,
            },
            {
                source: '/external/igoldaccount/golddetail/history-price',
                destination: 'https://mobile.cmbchina.com/igoldaccount/golddetail/history-price',
            },
            {
                source: '/external/igoldaccount/golddetail/time-price',
                destination: 'https://mobile.cmbchina.com/igoldaccount/golddetail/time-price',
            },
            {
                source: '/external/api/quote/NDX/chart',
                destination: 'https://api.nasdaq.com/api/quote/NDX/chart'
            },
            {
                source: '/external/appstock/app/minute/query',
                destination: 'https://web.ifzq.gtimg.cn/appstock/app/minute/query'
            },
            {
                source: '/external/appstock/app/day/query',
                destination: 'https://web.ifzq.gtimg.cn/appstock/app/day/query'
            },
            {
                source: '/external/ifzqgtimg/appstock/app/newfqkline/get',
                destination: 'https://proxy.finance.qq.com/ifzqgtimg/appstock/app/newfqkline/get'
            },
            {
                source: '/external/api/financialdata/68/historical/chart',
                destination: 'https://api.investing.com/api/financialdata/68/historical/chart'
            },
            {
                source: '/external/currencies/xau-usd-chart',
                destination: 'https://www.investing.com/currencies/xau-usd-chart'
            }
        ]
    },
};

export default nextConfig;
