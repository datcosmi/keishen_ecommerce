//implementacion para el funcionamiento de next-auth

import NextAuth from "next-auth/next";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { SupabaseAdapter } from "@auth/supabase-adapter";
import { createClient } from "@supabase/supabase-js";
import { CustomUser } from "@/types/usersTypes";

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            authorization: {
                params: {
                    scope: "openid profile email",
                }
            }
        }),
    ],
    adapter: SupabaseAdapter({
        url: process.env.SUPABASE_URL!,
        secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
    }),
    events: {
        async signIn({ user, account }){

            try {
                const email = user.email;
                //checar si existe 
                const { data: existingUser } = await supabase
                .from('users')
                .select('id_user')
                .eq('email', email)
                .single();

                if (!existingUser) {
                    const nameParts = user.name?.split(" ") || [];
                    const name = nameParts[0] || "";
                    const surname = nameParts.slice(1).join(" ") || "";

                    const { error: insertError } = await supabase
                    .from('users')
                    .insert([
                        {
                            name,
                            surname,
                            email,
                            pass: "",
                            phone: "",
                            role: "cliente",
                            provider: account?.provider || "google",
                        }
                    ]);

                    if (insertError) {
                        console.error("Error inserting user:", insertError);
                    } else {
                        console.log("User inserted successfully:", user);
                    }
                }
            } catch (err){
                console.error("Error signing in:", err);
            }
        },
    },
    callbacks: {
        async session({ session, user }) {
            const customUser = user as unknown as CustomUser;

            session.user = customUser;
            return session;
          },
    },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
