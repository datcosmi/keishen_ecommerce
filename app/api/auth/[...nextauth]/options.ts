import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { SupabaseAdapter } from "@auth/supabase-adapter";
import { createClient } from "@supabase/supabase-js";
import { generateCustomJWT } from "@/lib/jwt";
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

        if (error || !user || !user.pass) {
          throw new Error("Invalid credentials");
        }

        // Only use bcrypt comparison
        try {
          const passwordValid = await bcrypt.compare(
            credentials.password,
            user.pass
          );

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
        } catch (e) {
          console.error("Error verifying password:", e);
          throw new Error("Authentication error");
        }
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
    async jwt({ token, user }) {
      console.log("JWT Callback:", { token, user });

      // Siempre obtener el usuario actualizado desde Supabase
      try {
        const { data: userData, error } = await supabase
          .from("users")
          .select("id_user, name, surname, email, role, phone")
          .eq("email", token.email || user?.email)
          .single();

        if (!error && userData) {
          token.id_user = userData.id_user;
          token.role = userData.role;
          token.name = `${userData.name} ${userData.surname || ""}`.trim();

          // Generar custom JWT para la API
          token.accessToken = await generateCustomJWT(userData);
        } else {
          console.error("No se pudo obtener el usuario de Supabase:", error);
        }
      } catch (e) {
        console.error(
          "Error consultando usuario desde Supabase en callback JWT:",
          e
        );
      }

      return token;
    },

    async session({ session, token }) {
      // Asegura que la sesión tenga los datos correctos
      if (token) {
        session.user.id_user = token.id_user as number;
        session.user.role = token.role as string;
        session.accessToken = token.accessToken || "";
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
