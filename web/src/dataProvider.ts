import { FirebaseApp } from "firebase/app";
import { getFunctions, httpsCallable, connectFunctionsEmulator } from "firebase/functions";
import { DataProvider } from "react-admin";

interface AuthActionsParams {
    action: 'disable' | 'delete' | 'enable' | 'listUsers' | 'assignGroups' | 'getUser',
    uids?: string[],
    groups?: string[],
    filter?: {
        q?: string,
        group?: string,
    },
    uid?: string,
}

export function createDataProvider(firebaseApp: FirebaseApp): DataProvider {

    const firebaseFunctions = getFunctions(firebaseApp);
    window.location.hostname === 'localhost' && connectFunctionsEmulator(firebaseFunctions, 'localhost', 5001);
    const authActions = httpsCallable<AuthActionsParams, any>(firebaseFunctions, 'authActions');

    return {
        async getList(resource, params) {
            const { data } = await authActions({ action: `list${resource}` as any, filter: params.filter })
            return { data, total: data.length }
        },
        async getOne(resource, params) {
            const { data } = await authActions({ action: `getUser`, uid: params.id })
            return { data };
        }, // get a single record by id
        getMany: (resource, params) => {
            return Promise.reject();
        }, // get a list of records based on an array of ids
        getManyReference: (resource, params) => Promise.reject(), // get the records referenced to another record, e.g. comments for a post
        create: (resource, params) => Promise.reject(), // create a record
        update: (resource, params) => Promise.reject(), // update a record based on a patch
        async updateMany(resource, params) {
            const uids = params.ids as string[]
            const { action } = params.data;
            if (action === 'enable' || action === 'disable') {
                await authActions({ action, uids });
            } else {
                await authActions({ action: 'assignGroups', uids, groups: params.data });
            }
            return { data: uids };
        }, // update a list of records based on an array of ids and a common patch
        delete: (resource, params) => Promise.reject(), // delete a record by id
        async deleteMany(resource, params) {
            await authActions({ action: 'delete', uids: params.ids as string[] });
            return { data: params.ids };
        },
    }

}