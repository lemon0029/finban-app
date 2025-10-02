"use client"

import {type Icon} from "@tabler/icons-react"
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import * as react from "react";
import {LucideProps} from "lucide-react";
import Link from "next/link";

export function NavMain({items}: {
    items: {
        title: string
        url: string
        icon?: Icon | react.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & react.RefAttributes<SVGSVGElement>>
    }[]
}) {
    return (
        <SidebarGroup>
            <SidebarGroupContent className="flex flex-col gap-2">
                <SidebarMenu>
                    {items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <Link href={item.url}>
                                <SidebarMenuButton tooltip={item.title}>
                                    {item.icon && <item.icon/>}
                                    <span>{item.title}</span>
                                </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    )
}
