import NextAuth from "next-auth/next";
import { authOptions } from "./options";

// Create and export the handler functions
const handler = NextAuth(authOptions);

export const GET = handler;
export const POST = handler;
