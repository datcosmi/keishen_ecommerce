// para next-auth
import "next-auth";

export interface CustomUser {
  id_user: number;
  name: string;
  surname: string;
  email: string;
  pass: string;
  phone: string;
  role: string;
}

declare module "next-auth" {
  interface User {
    id_user?: number;
    role?: string;
  }

  interface Session {
    user: {
      id_user?: number;
      role?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
    token?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id_user?: number;
    role?: string;
    accessToken?: string;
  }
}
