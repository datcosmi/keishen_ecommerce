import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Define which routes require authentication and which roles can access them
const protectedRoutes = [
  {
    path: "/panel/dashboard",
    roles: ["admin_tienda", "superadmin"],
  },
  {
    path: "/panel/products",
    roles: ["admin_tienda", "superadmin"],
  },
  {
    path: "/panel/pedidos",
    roles: ["vendedor", "admin_tienda", "superadmin"],
  },
  {
    path: "/panel/profile",
    roles: ["admin_tienda", "cliente", "vendedor", "superadmin"],
  },
];

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = request.nextUrl;

  // Check if the path is protected
  const matchedRoute = protectedRoutes.find((route) =>
    pathname.startsWith(route.path)
  );

  // If this is a protected route
  if (matchedRoute) {
    // If not logged in, redirect to login
    if (!token) {
      const url = new URL("/login", request.url);
      url.searchParams.set("callbackUrl", encodeURI(request.url));
      return NextResponse.redirect(url);
    }

    // If logged in but doesn't have the right role
    if (token.role && !matchedRoute.roles.includes(token.role as string)) {
      // Redirect to unauthorized page or homepage
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  // If not protected or user has correct permissions, continue
  return NextResponse.next();
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    "/panel/dashboard/:path*",
    "/panel/products/:path*",
    "/panel/pedidos/:path*",
    "/panel/profile/:path*",
  ],
};
