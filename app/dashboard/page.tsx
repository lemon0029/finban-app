import {EarningsCard} from "@/app/dashboard/earnings-card";
import {SidebarInset, SidebarProvider} from "@/components/ui/sidebar";
import {AppSidebar} from "@/components/app-sidebar";
import {SiteHeader} from "@/components/site-header";
import {RedirectToSignIn, SignedIn} from "@daveyplate/better-auth-ui";
import {HoldingsCard} from "@/app/dashboard/holdings-card";

export default function DashboardPage() {
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
                            <EarningsCard/>
                            <HoldingsCard/>
                        </div>
                    </SidebarInset>
                </SidebarProvider>
            </SignedIn>
        </>

    )
}