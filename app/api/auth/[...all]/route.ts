// This creates Better Auth's server endpoints under `api/auth`, including:
// api/auth/sign-in/social
// api/auth/callback/google
// api/auth/get-session
// api/auth/sign-out

import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";
export const { GET, POST } = toNextJsHandler(auth);

