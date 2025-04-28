"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  Archive,
  BarChart2,
  Users,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Tags,
  Layers2,
  ShoppingBag,
  Monitor,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";

const Sidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout, hasRole } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check for saved preference in localStorage
    const savedCollapsed = localStorage.getItem("sidebarCollapsed") === "true";
    setCollapsed(savedCollapsed);
  }, []);

  // Base menu items
  const baseMenuItems = [
    {
      name: "Inicio",
      icon: Home,
      href: "/panel/dashboard",
      roles: ["admin_tienda", "cliente", "superadmin"],
    },
    {
      name: "Productos",
      icon: Archive,
      href: "/panel/products",
      roles: ["admin_tienda", "superadmin", "vendedor"],
    },
    {
      name: "Categorias",
      icon: Layers2,
      href: "/panel/categories",
      roles: ["admin_tienda", "superadmin"],
    },
    {
      name: "Descuentos",
      icon: Tags,
      href: "/panel/discounts",
      roles: ["admin_tienda", "superadmin"],
    },
    {
      name: "Pedidos",
      icon: ShoppingBag,
      href: "/panel/pedidos",
      roles: ["admin_tienda", "vendedor", "superadmin"],
    },
    {
      name: "Ventas",
      icon: BarChart2,
      href: "/panel/ventas",
      roles: ["admin_tienda", "superadmin"],
    },
    {
      name: "Usuarios",
      icon: Users,
      href: "/panel/users",
      roles: ["superadmin"],
    },
    {
      name: "Contenido de la Página",
      icon: Monitor,
      href: "/panel/page-content",
      roles: ["superadmin"],
    },
  ];

  // Filter menu items based on user role
  const menuItems = baseMenuItems.filter(
    (item) => !user?.role || item.roles.includes(user.role)
  );

  // Mejorada para verificar si la ruta actual coincide o es hijo de la ruta del enlace
  const isActiveRoute = (href: string): boolean => {
    if (pathname === href) return true;
    if (pathname.startsWith(href + "/")) return true;
    return false;
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const toggleSidebar = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    if (mounted) {
      localStorage.setItem("sidebarCollapsed", String(newState));
    }
  };

  function transformUserRole(role: string): string {
    const roleMap: Record<string, string> = {
      admin_tienda: "Administrador",
      vendedor: "Vendedor",
      cliente: "Cliente",
      superadmin: "Super Administrador",
    };

    return roleMap[role] || "Usuario";
  }

  return (
    <aside
      className={cn(
        "h-screen hidden md:flex flex-col border-r transition-all duration-300 ease-in-out sticky top-0 shadow-md overflow-y-auto",
        collapsed ? "w-20" : "w-64",
        "bg-[#f9f9fb] dark:bg-gray-900"
      )}
    >
      {/* Toggle button */}
      <Button
        variant="outline"
        size="icon"
        onClick={toggleSidebar}
        className="absolute -right-3 top-20 h-6 w-6 rounded-full border bg-white shadow-md z-10 p-0 flex items-center justify-center"
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </Button>

      {/* Main container */}
      <div className="flex flex-col h-full">
        {/* Logo section */}
        <div
          className={cn(
            "flex justify-center items-center transition-all pt-6 pb-4",
            collapsed ? "px-2" : "px-4"
          )}
        >
          <Link href="/" className="flex justify-center">
            {collapsed ? (
              <div className="bg-black text-white w-10 h-10 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-lg font-bold">K</span>
              </div>
            ) : (
              <div className="flex flex-col justify-center items-center gap-2">
                <div className="bg-gray-50 p-3 rounded-xl shadow-md transition-transform duration-300 hover:scale-105">
                  <Image
                    src={"/logo-collapsed.png"}
                    alt="Logo"
                    width={60}
                    height={60}
                    priority
                    className="object-cover"
                    sizes="50px"
                  />
                </div>
                <span className="text-xl font-bold tracking-wide text-gray-800">
                  KEISHEN
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* User info */}
        {!collapsed && (
          <div className="px-6 py-3 mx-4 mb-2 bg-gray-100 rounded-lg shadow-sm">
            <p className="text-sm font-semibold text-gray-800 truncate">
              {user?.name || "Usuario"}
            </p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            <div className="flex items-center mt-1">
              <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
              <p className="text-xs text-gray-500 capitalize">
                {transformUserRole(user?.role || "")}
              </p>
            </div>
            <p className="text-xs text-gray-400 mt-1 truncate">
              ID: {user?.id_user || "N/A"}
            </p>
          </div>
        )}

        {/* Navigation section */}
        <div className="flex-1 flex flex-col mt-2 px-3">
          <ScrollArea className="py-2 flex-1">
            <nav className="space-y-1">
              <TooltipProvider delayDuration={300}>
                {menuItems.map((item) => (
                  <Tooltip key={item.name}>
                    <TooltipTrigger asChild>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center rounded-lg text-sm font-medium transition-all duration-200",
                          collapsed ? "justify-center p-3 mx-1" : "p-3 px-4",
                          isActiveRoute(item.href)
                            ? "bg-black text-white shadow-lg"
                            : "text-gray-400 hover:text-[#e7b709]"
                        )}
                      >
                        <item.icon
                          className={cn(
                            "flex-shrink-0",
                            isActiveRoute(item.href) ? "h-5 w-5" : "h-5 w-5",
                            collapsed ? "" : "mr-3"
                          )}
                        />
                        {!collapsed && <span>{item.name}</span>}
                      </Link>
                    </TooltipTrigger>
                    {collapsed && (
                      <TooltipContent
                        side="right"
                        className="bg-gray-800 text-white"
                      >
                        {item.name}
                      </TooltipContent>
                    )}
                  </Tooltip>
                ))}
              </TooltipProvider>
            </nav>
          </ScrollArea>
        </div>

        <Separator className="my-2" />

        {/* Logout section */}
        <div className={cn("p-3 mx-3 mb-4")}>
          <Button
            variant="ghost"
            className={cn(
              "w-full transition-colors duration-200",
              collapsed
                ? "justify-center px-2 py-2"
                : "justify-start px-4 py-2",
              "text-gray-400 hover:bg-red-50 hover:text-red-600 rounded-lg"
            )}
            onClick={handleLogout}
          >
            <LogOut className={cn("h-5 w-5", collapsed ? "" : "mr-3")} />
            {!collapsed && (
              <span className="text-sm font-medium">Cerrar sesión</span>
            )}
          </Button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
