"use client"

import * as React from "react"
import {IconDashboard, IconDatabase, IconHelp, IconSearch, IconSettings,} from "@tabler/icons-react"
import {NavMain} from "@/components/nav-main"
import {NavSecondary} from "@/components/nav-secondary"
import {NavUser} from "@/components/nav-user"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import {ChartAreaIcon, FileTextIcon, PiggyBankIcon} from "lucide-react";
import Link from "next/link";

const data = {
    user: {
        name: "shadcn",
        email: "m@example.com",
        avatar: "/avatars/shadcn.jpg",
    },
    navMain: [
        {
            title: "Dashboard",
            url: "/dashboard",
            icon: IconDashboard,
        },
        {
            title: "Gain History",
            url: "/earnings",
            icon: ChartAreaIcon,
        },
        {
            title: "Transactions",
            url: "/transactions",
            icon: FileTextIcon,
        },
        {
            title: "Product Repository",
            url: "/products",
            icon: IconDatabase,
        }
    ],
    navSecondary: [
        {
            title: "Settings",
            url: "/settings",
            icon: IconSettings,
        },
        {
            title: "Get Help",
            url: "#",
            icon: IconHelp,
        },
        {
            title: "Search",
            url: "#",
            icon: IconSearch,
        },
    ],
}

export function AppSidebar({...props}: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar collapsible="offcanvas" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            className="data-[slot=sidebar-menu-button]:!p-1.5"
                        >
                            <Link href="/" className="flex items-center gap-2">
                                <PiggyBankIcon className="!size-5"/>
                                <span className="text-base font-semibold">FinBoard</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={data.navMain}/>
                <NavSecondary items={data.navSecondary} className="mt-auto"/>
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={data.user}/>
            </SidebarFooter>
        </Sidebar>
    )
}
