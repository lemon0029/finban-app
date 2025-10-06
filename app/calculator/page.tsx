import {SidebarInset, SidebarProvider} from "@/components/ui/sidebar";
import {AppSidebar} from "@/components/app-sidebar";
import {SiteHeader} from "@/components/site-header";
import {SIPChart} from "@/app/calculator/sip-chart";

export default function Calculator() {
    return (
        <>
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
                        <SIPChart/>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </>
    )
}
