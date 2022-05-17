import { FirebaseSignInProvider } from "@firebase/util"

export interface AuthConfig {
  apiKey: string
  projectId: string
  signInProviders: FirebaseSignInProvider[]
}