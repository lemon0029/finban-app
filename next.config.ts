import type {NextConfig} from "next";

const nextConfig: NextConfig = {
    /* config options here */
    env: {
        API_BASE_URL: 'http://192.168.1.4:8080/api',
    },
    async rewrites() {
        return [
            {
                source: '/igoldaccount/golddetail/history-price',
                destination: 'https://mobile.cmbchina.com/igoldaccount/golddetail/history-price',
            },
            {
                source: '/api/quote/NDX/chart',
                destination: 'https://api.nasdaq.com/api/quote/NDX/chart'
            }
        ]
    },
};

export default nextConfig;
