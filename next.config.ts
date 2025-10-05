import type {NextConfig} from "next";

const nextConfig: NextConfig = {
    /* config options here */
    env: {
        API_BASE_URL: 'http://localhost:8080/api',
    },
    async rewrites() {
        return [
            // {
            //     source: '/api/:path*',
            //     destination: "http://192.168.1.4:8080/api/:path*",
            // },
            {
                source: '/igoldaccount/golddetail/history-price',
                destination: 'https://mobile.cmbchina.com/igoldaccount/golddetail/history-price',
            },
            {
                source: '/igoldaccount/golddetail/time-price',
                destination: 'https://mobile.cmbchina.com/igoldaccount/golddetail/time-price',
            },
            {
                source: '/api/quote/NDX/chart',
                destination: 'https://api.nasdaq.com/api/quote/NDX/chart'
            },
            {
                source: '/appstock/app/minute/query',
                destination: 'https://web.ifzq.gtimg.cn/appstock/app/minute/query'
            },
            {
                source: '/appstock/app/day/query',
                destination: 'https://web.ifzq.gtimg.cn/appstock/app/day/query'
            },
            {
                source: '/ifzqgtimg/appstock/app/newfqkline/get',
                destination: 'https://proxy.finance.qq.com/ifzqgtimg/appstock/app/newfqkline/get'
            }
        ]
    },
};

export default nextConfig;
