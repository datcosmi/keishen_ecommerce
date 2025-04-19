"use client";

import { useProtectedRoute } from "@/hooks/useAuth";
import Sidebar from "@/components/sidebar";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Define role-based path protection
  const rolePathMap: Record<string, string[]> = {
    "/panel/dashboard": ["admin_tienda", "superadmin"],
    "/panel/categories": ["admin_tienda", "superadmin"],
    "/panel/discounts": ["admin_tienda", "superadmin"],
    "/panel/products": ["admin_tienda", "vendedor", "superadmin"],
    "/panel/pedidos": ["admin_tienda", "vendedor", "superadmin"],
    "/panel/ventas": ["admin_tienda", "vendedor", "superadmin"],
    "/panel/users": ["superadmin"],
  };

  // Find the current path in the map
  const currentPath = Object.keys(rolePathMap).find(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  // Get the required roles for the current path
  const requiredRoles = currentPath
    ? rolePathMap[currentPath]
    : ["admin_tienda", "vendedor", "cliente", "superadmin"];

  // Use the hook with the required roles
  const { isAuthenticated, isLoading, user } = useProtectedRoute(requiredRoles);

  useEffect(() => {
    // After first render, set initial load to false
    if (!isLoading) {
      const timer = setTimeout(() => {
        setIsInitialLoad(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (isLoading || isInitialLoad) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-12 w-12 text-black animate-spin" />
          <div className="text-lg font-medium text-gray-700">Cargando...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // The useProtectedRoute hook will handle redirection
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#f4f4f8] to-[#faf8ff] ">
      <Sidebar />
      <div className="flex-1 transition-all duration-300 ease-in-out">
        {/* Main content area */}
        <main className="p-6">
          {/* Page content wrapper */}
          {children}
        </main>
      </div>
    </div>
  );
}
