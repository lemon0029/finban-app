import {RedirectToSignIn, SignedIn} from "@daveyplate/better-auth-ui";
import DashboardPage from "@/app/dashboard/page";

export default function Home() {
    return (
        <>
            <RedirectToSignIn/>
            <SignedIn>
                <DashboardPage />
            </SignedIn>
        </>
    );
}
