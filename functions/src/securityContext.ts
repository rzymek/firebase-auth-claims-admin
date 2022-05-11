import * as admin from "firebase-admin";

export interface SecurityContext {
    projectId: string;
    accessToken: string;
}

export async function securityContext(): Promise<SecurityContext> {
    const projectId = admin.app().options.projectId!!;
    const access = await admin.app().options.credential?.getAccessToken();
    const accessToken = access?.access_token!!;
    return { projectId, accessToken };
}