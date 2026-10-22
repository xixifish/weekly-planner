import { authClient } from "@/lib/auth-client";

// Starts Google sign-in; afterwards Google sends the user back to callbackURL
export async function signInWithGoogle(callbackURL = "/") {
  await authClient.signIn.social({
    provider: "google",
    callbackURL,
  });
}
