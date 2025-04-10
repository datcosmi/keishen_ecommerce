// /hooks/useAuth.ts
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const useAuth = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const isAuthenticated = status === "authenticated";
  const isLoading = status === "loading";
  const user = session?.user;

  const logout = async () => {
    localStorage.removeItem("auth_token");
    await signOut({ redirect: false });
  };

  const login = async (
    provider: string = "google",
    callbackUrl: string = "/"
  ) => {
    localStorage.removeItem("auth_token");
    await signIn(provider, { callbackUrl });
  };

  // Check if user has a specific role or any of the roles in an array
  const hasRole = (roles: string | string[]): boolean => {
    if (!isAuthenticated || !user?.role) return false;

    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }
    return user.role === roles;
  };

  const isTokenValid = (token: string): boolean => {
    try {
      // If you're using JWT tokens, you could decode and check the exp field
      // This is a simplified check - in a real app you'd want to decode the token
      // and check its expiration date
      return !!token && token.length > 10;
    } catch (error) {
      return false;
    }
  };

  // Then update getAuthToken to use it
  const getAuthToken = async (): Promise<string | null> => {
    try {
      const storedToken = localStorage.getItem("auth_token");

      if (storedToken && isTokenValid(storedToken)) {
        return storedToken;
      }

      // Token not found or invalid, get a new one
      localStorage.removeItem("auth_token"); // Clear invalid token
      const response = await fetch("/api/auth/session");
      const session = await response.json();

      if (session?.token) {
        localStorage.setItem("auth_token", session.token);
        return session.token;
      }

      return null;
    } catch (error) {
      console.error("Error getting auth token:", error);
      return null;
    }
  };

  return {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout,
    hasRole,
    session,
    getAuthToken,
  };
};

// Custom hook for protected pages
export const useProtectedRoute = (allowedRoles?: string[]) => {
  const { isAuthenticated, isLoading, hasRole, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If authentication process is completed (not loading anymore)
    if (!isLoading) {
      // If not authenticated, redirect to login
      if (!isAuthenticated) {
        router.push("/login");
      }
      // If roles are specified and user doesn't have any of them
      else if (allowedRoles && !allowedRoles.includes(user?.role as string)) {
        router.push("/unauthorized");
      }
    }
  }, [isAuthenticated, isLoading, router, allowedRoles, user]);

  return { isAuthenticated, isLoading, user };
};
