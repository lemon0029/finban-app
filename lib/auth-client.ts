import {createAuthClient} from "better-auth/react"
import {deviceAuthorizationClient, lastLoginMethodClient, passkeyClient} from "better-auth/client/plugins";

export const authClient = createAuthClient({
    baseURL: "http://localhost:8080/api/auth",
    plugins: [
        passkeyClient(),
        deviceAuthorizationClient(),
        lastLoginMethodClient(),
    ]
})