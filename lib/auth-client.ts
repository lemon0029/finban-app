import {createAuthClient} from "better-auth/react"
import {deviceAuthorizationClient, lastLoginMethodClient, passkeyClient} from "better-auth/client/plugins";

export const authClient = createAuthClient({
    baseURL: `${process.env.API_BASE_URL}/auth`,
    plugins: [
        passkeyClient(),
        deviceAuthorizationClient(),
        lastLoginMethodClient(),
    ]
})