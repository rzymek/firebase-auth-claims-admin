import * as admin from "firebase-admin";
import { UserRecord } from "firebase-functions/v1/auth";
import { ADMIN_GROUP_NAME } from "./00config";
import { differene as difference, equal, union } from "./sets";

export async function toggleDisabled(uids: string[], disabled: boolean, callerUid?: string) {
    const withoutCaller = uids.filter(it => it !== callerUid);
    await Promise.all(withoutCaller.map(uid =>
        admin.auth().updateUser(uid, { disabled })
    ));
    return uids;
}

export async function listGroups() {
    const users = await admin.auth().listUsers();
    const groups = users.users
        .flatMap(user => user.customClaims?.['groups'] ?? [])
        .concat(ADMIN_GROUP_NAME);
    return Array.from(new Set(groups)).sort().map(id => ({ id }));
};


export async function assignGroups(uids: string[], groups: { [group: string]: boolean }, callerUid?: string) {
    if (!uids || !groups) {
        throw new Error('Expecting uid and groups')
    }
    const usersResponse = await admin.auth().getUsers(uids.map(uid => ({ uid })))
    const users: Record<string, UserRecord> = usersResponse.users.reduce((res, user) => ({
        ...res,
        [user.uid]: user
    }), {})
    const groupEntries = Object.entries(groups);
    const add = new Set(groupEntries.filter(it => it[1]).map(it => it[0]))
    const remove = new Set(groupEntries.filter(it => !it[1]).map(it => it[0]))
    const modified = await Promise.all(uids.map(uid => {
        const existingGroups: Set<string> = new Set(users[uid]?.customClaims?.groups ?? []);
        const newGroups = difference(union(existingGroups, add), remove);
        if (uid === callerUid && existingGroups.has(ADMIN_GROUP_NAME)) {
            newGroups.add(ADMIN_GROUP_NAME);
        }
        if (equal(existingGroups, newGroups)) {
            return Promise.resolve(undefined);
        }
        return admin.auth().setCustomUserClaims(uid, {
            groups: Array.from(difference(union(existingGroups, add), remove))
        }).then(() => uid);
    }));
    return modified.filter(it => it);
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