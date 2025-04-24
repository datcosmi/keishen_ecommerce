export interface User {
  id_user: number;
  name: string;
  surname: string | null;
  email: string;
  pass: string;
  phone: string | null;
  role: string;
  provider: string | null;
}

// For creating new users where id_user isn't available yet
export interface NewUser extends Omit<User, "id_user"> {
  id_user?: number;
}
