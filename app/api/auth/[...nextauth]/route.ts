import NextAuth from "next-auth/next";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { SupabaseAdapter } from "@auth/supabase-adapter";
import { createClient } from "@supabase/supabase-js";

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
        },
      },
    }),
  ],
  adapter: SupabaseAdapter({
    url: process.env.SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }),
  events: {
    async signIn({ user, account }) {
      try {
        const email = user.email;

        if (!email) return;

        const { data: existingUser, error: lookupError } = await supabase
          .from("users")
          .select("id_user")
          .eq("email", email)
          .single();

        if (lookupError && lookupError.code !== "PGRST116") {
          console.error("Error looking up user:", lookupError);
        }

        if (!existingUser) {
          const nameParts = user.name?.split(" ") || [];
          const name = nameParts[0] || "";
          const surname = nameParts.slice(1).join(" ") || "";

          const { error: insertError } = await supabase.from("users").insert([
            {
              name,
              surname,
              email,
              pass: "",
              phone: "",
              role: "cliente",
              provider: account?.provider || "google",
            },
          ]);

          if (insertError) {
            console.error("Error inserting user in public.users:", insertError);
          } else {
            console.log("Usuario insertado correctamente en public.users:", user);
          }
        } else {
          console.log("Usuario ya existe en public.users", user);
        }
      } catch (err) {
        console.error("Error en events.signIn:", err);
      }
    },
  },
  callbacks: {
    async session({ session }) {
      const email = session.user.email;

      const { data: userData, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .single();

      if (error) {
        console.error("Error fetching user data from public.users:", error);
        return session;
      }

      if (userData) {
        session.user = {
          id_user: userData.id_user,
          name: userData.name,
          surname: userData.surname,
          email: userData.email,
          pass: userData.pass,
          phone: userData.phone,
          role: userData.role,
        };
      }

      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
