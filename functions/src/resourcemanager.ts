import { fetchJson } from "./fetchJson";
import { SecurityContext } from "./securityContext";

const cloudresourcemanager = 'cloudresourcemanager.googleapis.com';

export type IamPolicy = {
    version: number
    etag: string
    bindings: {
        role: string
        members: string[]
    }[]
}


async function fetchIamPolicy(context: SecurityContext) {
    const { projectId, accessToken } = context;
    return await fetchJson<IamPolicy>(
        cloudresourcemanager,
        `/v1/projects/${projectId}:getIamPolicy`,
        accessToken, 'POST'
    )
}

export async function isProjectOwner(email: string, context: SecurityContext) {
    const iamPolicy = await fetchIamPolicy(context);
    const policy = iamPolicy.bindings.find(binding =>
        binding.role === "roles/owner" &&
        binding.members.includes(`user:${email}`)
    )
    return policy !== undefined;
}
