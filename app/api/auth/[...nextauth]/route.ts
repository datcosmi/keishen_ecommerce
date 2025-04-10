// /app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth/next";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { SupabaseAdapter } from "@auth/supabase-adapter";
import { createClient } from "@supabase/supabase-js";
// import { CustomUser } from "@/types/usersTypes";
import bcrypt from "bcryptjs";

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
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        // Fetch user from Supabase
        const { data: user, error } = await supabase
          .from("users")
          .select("*")
          .eq("email", credentials.email)
          .single();

        if (error || !user) {
          throw new Error("User not found");
        }

        // Verify password (assuming the password is stored hashed)
        // If using plaintext passwords for now, adjust comparison accordingly
        let passwordValid = false;

        if (user.pass === credentials.password) {
          // Direct comparison for plain text passwords (temporary solution)
          passwordValid = true;
        } else if (user.pass && credentials.password) {
          // For bcrypt hashed passwords
          try {
            passwordValid = await bcrypt.compare(
              credentials.password,
              user.pass
            );
          } catch (e) {
            console.error("Error comparing passwords:", e);
          }
        }

        if (!passwordValid) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user.id_user.toString(),
          name: user.name + " " + (user.surname || ""),
          email: user.email,
          role: user.role,
          id_user: user.id_user,
        };
      },
    }),
  ],
  adapter: SupabaseAdapter({
    url: process.env.SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }),
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  events: {
    async signIn({ user, account }) {
      try {
        const email = user.email;
        //checar si existe
        const { data: existingUser } = await supabase
          .from("users")
          .select("id_user")
          .eq("email", email)
          .single();

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
              provider: account?.provider || "credentials",
            },
          ]);

          if (insertError) {
            console.error("Error inserting user:", insertError);
          } else {
            console.log("User inserted successfully:", user);
          }
        }
      } catch (err) {
        console.error("Error signing in:", err);
      }
    },
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // Add user fields to the token
      if (user) {
        token.id_user = user.id_user;
        token.role = user.role;
      }

      // If token already has user info but we need to refresh it
      else if (token?.email) {
        try {
          // Get fresh user data from Supabase
          const { data: userData, error } = await supabase
            .from("users")
            .select("id_user, name, surname, email, role, phone")
            .eq("email", token.email)
            .single();

          if (!error && userData) {
            token.id_user = userData.id_user;
            token.role = userData.role;
            token.name = `${userData.name} ${userData.surname || ""}`.trim();
          }
        } catch (error) {
          console.error("Error refreshing user data:", error);
        }
      }

      if (account?.access_token) {
        token.accessToken = account.access_token;
      }

      return token;
    },
    async session({ session, token }) {
      // Add user data from token to the session
      if (token) {
        session.user.id_user = token.id_user as number;
        session.user.role = token.role as string;
        session.token = token.accessToken || "";
      }

      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };