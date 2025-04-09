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
  interface Session {
    user: CustomUser;
  }
}
