import { FirebaseApp } from "firebase/app";
import { getFunctions, httpsCallable, connectFunctionsEmulator } from "firebase/functions";
import { DataProvider, defaultDataProvider} from "react-admin";

interface AuthActionsParams {
    action: 'disable' | 'delete' | 'enable' | 'listUsers' | 'assignGroups',
    uids?: string[],
    groups?: string[],
    filter?: {},
}

export function createDataProvider(firebaseApp: FirebaseApp): DataProvider {

    const firebaseFunctions = getFunctions(firebaseApp);
    window.location.hostname === 'localhost' && connectFunctionsEmulator(firebaseFunctions, 'localhost', 5001);
    const authActions = httpsCallable<AuthActionsParams, any>(firebaseFunctions, 'authActions');

    return {
        ...defaultDataProvider,
        async getList(resource, params) {
            const { data } = await authActions({ action: `list${resource}` as any, filter: params.filter })
            return { data, total: data.length }
        },
        async updateMany(resource, params) {
            const uids = params.ids as string[]
            const { action } = params.data;
            if (action === 'enable' || action === 'disable') {
                await authActions({ action, uids });
            } else {
                await authActions({ action: 'assignGroups', uids, groups: params.data });
            }
            return { data: uids };
        }, 
        async deleteMany(resource, params) {
            await authActions({ action: 'delete', uids: params.ids as string[] });
            return { data: params.ids };
        },
    }

}