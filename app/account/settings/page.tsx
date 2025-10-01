import {PasskeysCard} from "@daveyplate/better-auth-ui"
import {accountViewPaths} from "@daveyplate/better-auth-ui/server"

export const dynamicParams = false

export function generateStaticParams() {
    return Object.values(accountViewPaths).map((path) => ({path}))
}

export default async function AccountSettingsPage() {
    return (
        <main className="container self-center p-4 md:p-6">
            <div className="flex flex-col gap-6">
                <PasskeysCard/>
            </div>
        </main>
    )
}