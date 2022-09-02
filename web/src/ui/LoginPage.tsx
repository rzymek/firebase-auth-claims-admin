import { FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import React from "react";
import { Login } from "react-admin";
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import { AuthConfig } from "../AuthConfig";

export function createLoginPage(firebaseApp: FirebaseApp, authConfig: AuthConfig) {
    return (props: any) => {
        return <Login {...props}>
            <StyledFirebaseAuth firebaseAuth={getAuth(firebaseApp)} uiConfig={{
                signInFlow: 'popup',
                signInSuccessUrl: '#/',
                signInOptions: authConfig.signInProviders,
            }} />
        </Login>
    };
}