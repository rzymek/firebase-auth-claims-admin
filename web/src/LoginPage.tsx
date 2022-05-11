// LoginPage.js
import { FirebaseApp } from "firebase/app";
import { EmailAuthProvider, getAuth } from "firebase/auth";
import React, { useMemo } from "react";
import { Login } from "react-admin";
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import { AuthConfig } from "./AuthConfig";

export function createLoginPage(firebaseApp: FirebaseApp, authConfig: AuthConfig) {
    return (props: any) => {
        const FirebaseAuthPicker = useMemo(() =>
            <StyledFirebaseAuth firebaseAuth={getAuth(firebaseApp)} uiConfig={{
                signInFlow: 'popup',
                signInSuccessUrl: '#/',
                signInOptions: authConfig.signIn.socialLogins
                    .concat(authConfig.signIn.emailPassword ? [EmailAuthProvider.PROVIDER_ID] : []),
            }} />,
            []
        );
        return <Login {...props}>
            {FirebaseAuthPicker}
        </Login>
    };
}