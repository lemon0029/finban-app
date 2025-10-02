import type {Metadata, Viewport} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import "./globals.css";
import {Providers} from "@/app/providers";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "FinBoard",
    description: "The personal finance dashboard",
};

export const viewport: Viewport = {
    initialScale: 1,
    viewportFit: "cover",
    width: "device-width"
}

export default function RootLayout({children,}: Readonly<{ children: React.ReactNode; }>) {
    return (
        <html lang="en" suppressHydrationWarning>
        <body className={`${geistSans.variable} ${geistMono.variable} flex min-h-svh flex-col antialiased`}>
        <Providers>
            {children}
        </Providers>
        </body>
        </html>
    );
}
