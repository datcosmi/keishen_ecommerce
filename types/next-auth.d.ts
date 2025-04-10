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
<<<<<<< HEAD
  interface Session {
    user: CustomUser;
=======
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
>>>>>>> e1c68d61592ea7d57031f056377e7d676f95e2fa
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id_user?: number;
    role?: string;
    accessToken?: string;
  }
}
