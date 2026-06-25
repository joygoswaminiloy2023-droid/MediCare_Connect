import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL,
 
  onError: (error) => {
    console.error("Auth error:", error);
  },
});


export const { signIn, signUp, useSession, signOut, getSession } = authClient;