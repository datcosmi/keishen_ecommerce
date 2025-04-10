// /app/panel/layout.tsx
"use client";

import { useProtectedRoute } from "@/hooks/useAuth";
import Sidebar from "@/components/sidebar";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // Define role-based path protection
  const rolePathMap: Record<string, string[]> = {
    "/panel/dashboard": ["admin_tienda", "superadmin"],
    "/panel/categories": ["admin_tienda", "superadmin"],
    "/panel/discounts": ["admin_tienda", "superadmin"],
    "/panel/products": ["admin_tienda", "vendedor", "superadmin"],
    "/panel/pedidos": ["admin_tienda", "vendedor", "superadmin"],
    "/panel/ventas": ["admin_tienda", "vendedor", "superadmin"],
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="text-xl">Cargando...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // The useProtectedRoute hook will handle redirection
  }

  return (
    <div className="flex min-h-screen bg-[#eaeef6]">
      <Sidebar />
      <div className="flex-1 p-4 md:p-6 overflow-y-auto">{children}</div>
    </div>
  );
}
