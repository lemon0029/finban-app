import {RedirectToSignIn, SignedIn} from "@daveyplate/better-auth-ui";
import {SidebarInset, SidebarProvider} from "@/components/ui/sidebar";
import {AppSidebar} from "@/components/app-sidebar";
import {SiteHeader} from "@/components/site-header";
import GoldPrice from "@/app/trending/gold-price";
import NDXIndex from "@/app/trending/ndx-index";
import React from "react";

export default function Trending() {
    return (
        <>
            <RedirectToSignIn/>
            <SignedIn>
                <SidebarProvider
                    style={
                        {
                            "--sidebar-width": "calc(var(--spacing) * 72)",
                            "--header-height": "calc(var(--spacing) * 12)",
                        } as React.CSSProperties
                    }
                >
                    <AppSidebar variant="inset"/>
                    <SidebarInset>
                        <SiteHeader/>
                        <div className="@container/main flex flex-1 flex-col gap-2 p-4 md:p-6">
                            <div className={"grid grid-cols-1 lg:grid-cols-2 gap-3"}>
                                <GoldPrice />
                                <NDXIndex />
                            </div>
                        </div>
                    </SidebarInset>
                </SidebarProvider>
            </SignedIn>
        </>
    )
}
