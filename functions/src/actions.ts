import * as admin from "firebase-admin";
import { ADMIN_GROUP_NAME } from "./00config";

export async function toggleDisabled(uids: string[], disabled: boolean, callerUid?: string) {
    const withoutCaller = uids.filter(it => it !== callerUid);
    await Promise.all(withoutCaller.map(uid =>
        admin.auth().updateUser(uid, { disabled })
    ));
}

export async function listGroups() {
    const users = await admin.auth().listUsers();
    const groups = users.users
        .flatMap(user => user.customClaims?.['groups'] ?? [])
        .concat(ADMIN_GROUP_NAME);
    return Array.from(new Set(groups));
};


export async function assignGroups(uids: string[], groups: string[], callerUid?: string) {
    if (!uids || !groups) {
        throw new Error('Expecting uid and groups')
    }
    const withoutCaller = uids.filter(it => it !== callerUid);
    await Promise.all(withoutCaller.map(uid =>
        admin.auth().setCustomUserClaims(uid, {
            groups,
        })
    ));
};

export async function listUsers() {
    const list = await admin.auth().listUsers();
    return list.users.map(user => ({
        id: user.uid,
        email: user.email,
        displayName: user.displayName,
        groups: (user.customClaims?.groups ?? []).map((group: string) => ({
            name: group
        })),
        enabled: !user.disabled
    }))
}