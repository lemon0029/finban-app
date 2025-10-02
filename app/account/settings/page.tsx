import {PasskeysCard} from "@daveyplate/better-auth-ui"
import {accountViewPaths} from "@daveyplate/better-auth-ui/server"
import {SidebarInset, SidebarProvider} from "@/components/ui/sidebar";
import {AppSidebar} from "@/components/app-sidebar";
import {SiteHeader} from "@/components/site-header";

export const dynamicParams = false

export function generateStaticParams() {
    return Object.values(accountViewPaths).map((path) => ({path}))
}

export default async function AccountSettingsPage() {
    return (
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
                    <PasskeysCard/>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}