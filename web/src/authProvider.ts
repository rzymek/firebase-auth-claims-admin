import { FirebaseApp } from "firebase/app";
import { Auth, getAuth, signInWithEmailAndPassword, User } from "firebase/auth";
import { getFunctions, httpsCallable } from "firebase/functions";
import { AuthProvider } from "react-admin";

function currentUser(firebaseAuth: Auth) {
    return new Promise<User>((resolve, reject) => {
        if (firebaseAuth.currentUser) {
            return resolve(firebaseAuth.currentUser);
        }
        const unsubscribe = firebaseAuth.onAuthStateChanged(user => {
            unsubscribe();
            if (user) {
                resolve(user);
            } else {
                reject();
            }
        })
    });
}

export function createAuthProvider(firebaseApp: FirebaseApp): AuthProvider {
    const firebaseAuth = getAuth(firebaseApp);
    const authActions = httpsCallable(getFunctions(firebaseApp), 'authActions');
    return {
        async login({ username, password }: any): Promise<any> {
            return await signInWithEmailAndPassword(firebaseAuth, username, password)
        },
        async logout() {
            await firebaseAuth.signOut()
        },
        async checkAuth(params: any): Promise<void> {
            const user = await currentUser(firebaseAuth);
            if (!user) {
                return Promise.reject({ message: false });
            } else {
                const token = await user.getIdTokenResult();
                const groups = token.claims['groups'] as string[] ?? [];
                if (groups.includes('admin')) {
                    return;
                }
            }
            const isProjectOwner = await authActions({ action: 'isProjectOwner' });
            if (!isProjectOwner) {
                return Promise.reject({ message: `No admin nor project owner` })
            }
        },
        async checkError(error: any): Promise<void> {
        },
        async getPermissions(params: any): Promise<any> {
            return [];
        },
        async getIdentity() {
            const user = await currentUser(firebaseAuth);
            return {
                id: user.uid,
                avatar: user.photoURL ?? undefined,
                fullName: user.displayName ?? undefined
            }
        }
    }

}