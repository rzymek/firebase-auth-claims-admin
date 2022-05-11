export interface AuthConfig {
    apiKey: string
    projectId: string
    signIn: {
      anonymous: boolean
      emailLink: boolean
      emailPassword: boolean
      socialLogins: string[]
    }
  }