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
            }
        ]
    },
};

export default nextConfig;
