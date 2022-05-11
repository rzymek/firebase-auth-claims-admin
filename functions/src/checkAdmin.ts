import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import { HttpsError } from "firebase-functions/v1/https";
import { ADMIN_GROUP_NAME } from "./00config";
import { isProjectOwner } from "./resourcemanager";
import { securityContext } from "./securityContext";

async function isAdmin(token: DecodedIdToken | undefined): Promise<boolean> {
    if (!token) {
        return false;
    }
    const groups: string[] = token['groups'] ?? [];
    const hasAdminClaim = groups.includes(ADMIN_GROUP_NAME);
    if (hasAdminClaim) {
        return true;
    } else {
        return await tokenBelongsToProjectOwner(token);
    }
}

export async function tokenBelongsToProjectOwner(token: DecodedIdToken | undefined): Promise<boolean> {
    if (!token || !token.email_verified || !token.email) {
        return false;
    }
    return await isProjectOwner(token.email, await securityContext());
}

export async function checkAdmin(token: DecodedIdToken | undefined): Promise<void> {
    if (!await isAdmin(token)) {
        throw new HttpsError("unauthenticated", `Missing "${ADMIN_GROUP_NAME}" claim and not project owner`);
    }
}

