"use client"

import {Separator} from "@/components/ui/separator"
import {SidebarTrigger} from "@/components/ui/sidebar"
import {useTheme} from "next-themes";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {Button} from "@/components/ui/button";
import {Moon, Sun} from "lucide-react";
import * as React from "react";
import {usePathname} from "next/navigation";

function ThemeModeToggle() {
    const {setTheme} = useTheme()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button className="size-8 rounded-full" variant="ghost">
                    <Sun
                        className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90"/>
                    <Moon
                        className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0"/>
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                    Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                    Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                    System
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export function SiteHeader() {
    const pathname = usePathname()

    const pageName = () => {
        if (pathname == "/" || pathname == "/dashboard") {
            return "Dashboard"
        }

        if (pathname == "/products") {
            return "Product Repository"
        }

        if (pathname == "/transactions") {
            return "Transactions"
        }

        if (pathname == "/earnings") {
            return "Gain History"
        }

        if (pathname == "/account/settings") {
            return "Account Settings"
        }

        if (pathname == "/holdings") {
            return "My Holdings"
        }

        if (pathname == "/calculator") {
            return "Calculator"
        }

        if (pathname == "/trending") {
            return "Trending View"
        }

        return "Page"
    };

    return (
        <header
            className="sticky top-0 z-50 bg-[var(--color-background)] flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
            <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
                <SidebarTrigger className="-ml-1"/>
                <Separator
                    orientation="vertical"
                    className="mx-2 data-[orientation=vertical]:h-4"
                />
                <h1 className="text-base font-medium">
                    {pageName()}
                </h1>
                <div className="ml-auto flex items-center gap-2">
                    <ThemeModeToggle/>
                </div>
            </div>
        </header>
    )
}
