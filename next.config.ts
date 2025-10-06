import type {NextConfig} from "next";

const nextConfig: NextConfig = {
    /* config options here */
    env: {
        API_BASE_URL: 'http://192.168.1.4:8080/api',
    },
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: "http://192.168.1.4:8080/api/:path*",
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
            },
            {
                source: '/47a31e6560ab8dd9ad8b2b0c565c02d5/1759733106/1/1/8/history',
                destination: 'https://tvc4.investing.com/47a31e6560ab8dd9ad8b2b0c565c02d5/1759733106/1/1/8/history?symbol=68&resolution=1&from=1754550211&to=1759734271'
            }
        ]
    },
};

export default nextConfig;
