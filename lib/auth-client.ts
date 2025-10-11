import {createAuthClient} from "better-auth/react"
import {deviceAuthorizationClient, lastLoginMethodClient, passkeyClient} from "better-auth/client/plugins";

export const authClient = createAuthClient({
    basePath: "/api/auth",
    plugins: [
        passkeyClient(),
        deviceAuthorizationClient(),
        lastLoginMethodClient(),
    ]
})