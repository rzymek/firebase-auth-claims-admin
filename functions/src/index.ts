import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import { assignGroups, listGroups, listUsers, toggleDisabled } from "./actions";
import { checkAdmin, tokenBelongsToProjectOwner } from "./checkAdmin";
import { getProjectConfig } from "./projectConfig";

admin.initializeApp();

exports.authActions = functions.https.onCall(async (params: {
    action: string,
    uids: string[],
    groups: { [group: string]: boolean },
}, context) => {
    await checkAdmin(context.auth?.token);
    const actions: { [action: string]: () => Promise<unknown> } = {
        async disable() {
            return await toggleDisabled(params.uids, true, context.auth?.uid);
        },
        async enable() {
            return await toggleDisabled(params.uids, false);
        },
        async listUsers() {
            return listUsers();
        },
        async listGroups() {
            return listGroups();
        },
        async assignGroups() {
            return await assignGroups(params.uids, params.groups, context.auth?.uid)
        },
        async delete() {
            const withoutCaller = params.uids.filter(it => it !== context.auth?.uid);
            await admin.auth().deleteUsers(withoutCaller)
        },
        async isProjectOwner() {
            return await tokenBelongsToProjectOwner(context.auth?.token)
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
