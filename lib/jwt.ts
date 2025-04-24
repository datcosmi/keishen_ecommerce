import jwt from "jsonwebtoken";

export const generateCustomJWT = async (user: any) => {
  const payload = {
    id_user: user.id_user || user.id,
    email: user.email,
    role: user.role,
  };

  const secret = process.env.NEXTAUTH_SECRET!;
  return jwt.sign(payload, secret, { expiresIn: "1h" });
};
