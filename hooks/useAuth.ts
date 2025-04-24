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
    await signOut({ redirect: false });
  };

  const login = async (
    provider: string = "google",
    callbackUrl: string = "/"
  ) => {
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

  return {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout,
    hasRole,
    session,
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
