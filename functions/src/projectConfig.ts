import { fetchProjectConfig, fetchProjectIdpConfigs } from "./identitytoolkit";
import { SecurityContext, securityContext } from "./securityContext";

const getLastSegment = (value: string, separator: string) => value.substring(value.lastIndexOf(separator) + 1);

async function enabledSocialLogins(context: SecurityContext) {
    const configs = await fetchProjectIdpConfigs(context);
    return configs.defaultSupportedIdpConfigs
        .filter(it => it.enabled)
        .map((it) => getLastSegment(it.name, '/'));
}

export async function getProjectConfig() {
    const context = await securityContext();
    const { client: { apiKey }, signIn: { email } } = await fetchProjectConfig(context);
    const signInProviders = await enabledSocialLogins(context);
    if (email?.enabled) {
        signInProviders.push('password')
    }
    return {
        apiKey,
        signInProviders
    }
}