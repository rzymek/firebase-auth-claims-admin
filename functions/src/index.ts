import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import { assignGroups, getUser, listGroups, listUsers, toggleDisabled } from "./actions";
import { checkAdmin, tokenBelongsToProjectOwner } from "./checkAdmin";
import { getProjectConfig } from "./projectConfig";

admin.initializeApp();

exports.authActions = functions.https.onCall(async (params: {
    action: string,
    uids: string[],
    uid: string,
    groups: { [group: string]: boolean },
    filter?: {
        group?: string,
        q?: string,
    }
}, context) => {
    await checkAdmin(context.auth?.token);
    const actions: { [action: string]: () => Promise<unknown> } = {
        async disable() {
            return toggleDisabled(params.uids, true, context.auth?.uid);
        },
        async enable() {
            return toggleDisabled(params.uids, false);
        },
        async listUsers() {
            return listUsers({ q: params.filter?.q, group: params.filter?.group });
        },
        async getUser() {
            return getUser(params.uid);
        },
        async listGroups() {
            return listGroups();
        },
        async assignGroups() {
            return assignGroups(params.uids, params.groups, context.auth?.uid)
        },
        async delete() {
            const withoutCaller = params.uids.filter(it => it !== context.auth?.uid);
            await admin.auth().deleteUsers(withoutCaller)
        },
        async isProjectOwner() {
            return tokenBelongsToProjectOwner(context.auth?.token)
        }
    }
    return await actions[params.action]?.();
})

exports.authConfig = functions.https.onRequest(async (req, resp) => {
    try {
        const { projectId } = admin.auth().app.options;
        resp.setHeader('Content-Type', 'application/json')
            .end(JSON.stringify({
                projectId,
                ...await getProjectConfig(),
            }, null, ' '));
    } catch (error: any) {
        console.error(error);
        resp.status(500).end(JSON.stringify({
            message: error.message,
            error
        }, null, ' '));
    }
})
