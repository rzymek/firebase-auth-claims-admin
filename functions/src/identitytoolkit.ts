import { fetchJson } from "./fetchJson";
import { SecurityContext } from "./securityContext";

const identitytoolkit = 'identitytoolkit.googleapis.com';

export type ProjectConfig = {
    authorizedDomains: Array<string>
    blockingFunctions: {}
    client: {
        apiKey: string
        firebaseSubdomain: string
        permissions: {}
    }
    mfa: {
        state: string
    }
    monitoring: {
        requestLogging: {}
    }
    multiTenant: {}
    name: string
    notification: {},
    quota: {}
    signIn: {
        anonymous: {
            enabled: boolean
        }
        email: {
            enabled: boolean
            passwordRequired: boolean
        }
    }
    subtype: string
}
export async function fetchProjectConfig(context: SecurityContext) {
    const { projectId, accessToken } = context;
    return await fetchJson<ProjectConfig>(
        identitytoolkit,
        `/admin/v2/projects/${projectId}/config`,
        accessToken
    )
}

export type ProjectIdpConfigs = {
    defaultSupportedIdpConfigs: Array<{
        clientId: string
        clientSecret: string
        enabled: boolean
        name: string
    }>
}

export async function fetchProjectIdpConfigs(context: SecurityContext) {
    const { projectId, accessToken } = context;
    return await fetchJson<ProjectIdpConfigs>(
        identitytoolkit,
        `/admin/v2/projects/${projectId}/defaultSupportedIdpConfigs`,
        accessToken,
    )
}


