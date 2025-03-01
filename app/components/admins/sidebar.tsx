"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  Archive,
  CreditCard,
  BarChart2,
  User,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
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

const Sidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { name: "Inicio", icon: Home, href: "/dashboard" },
    { name: "Productos", icon: Archive, href: "/products" },
    { name: "Pedidos", icon: CreditCard, href: "/pedidos" },
    { name: "Ventas", icon: BarChart2, href: "/ventas" },
    { name: "Administradores", icon: User, href: "/administradores" },
    { name: "Vendedores", icon: Users, href: "/vendedores" },
    { name: "Configuración", icon: Settings, href: "/settings" },
  ];

  // Función mejorada que comprueba si la ruta actual es o comienza con la ruta del enlace
  const isActiveRoute = (href: string): boolean => {
    // Comprueba si la ruta coincide exactamente
    if (pathname === href) return true;

    // Comprueba si la ruta actual comienza con href y está seguida por / o final de cadena
    if (pathname.startsWith(href + "/")) return true;

    return false;
  };

  const handleLogout = () => {
    router.push("/");
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <aside
      className={cn(
        "h-screen bg-white hidden md:flex flex-col border-r border-gray-200 transition-all duration-300 ease-in-out relative",
        collapsed ? "w-16" : "w-56"
      )}
    >
      {/* Toggle button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className="absolute -right-4 top-6 h-8 w-8 rounded-full border border-gray-200 bg-white shadow-md z-10"
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>

      <div className="flex flex-col h-full">
        {/* Logo section */}
        <div
          className={cn(
            "flex justify-center items-center transition-all",
            collapsed ? "py-4" : "p-4"
          )}
        >
          <Link href="/dashboard" className="flex justify-center">
            {collapsed ? (
              <span className="text-2xl font-bold text-black">K</span>
            ) : (
              <span className="text-2xl font-bold tracking-widest text-black">
                KEISHEN
              </span>
            )}
          </Link>
        </div>

        <Separator />

        {/* Navigation section */}
        <ScrollArea className="flex-1">
          <nav className={cn("py-4", collapsed ? "px-1" : "px-2")}>
            <TooltipProvider delayDuration={300}>
              {menuItems.map((item) => (
                <Tooltip key={item.name}>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center mb-1 rounded-md text-sm font-medium transition-colors",
                        collapsed ? "justify-center px-2 py-2" : "px-3 py-2",
                        isActiveRoute(item.href)
                          ? "bg-black text-white"
                          : "text-gray-500 hover:bg-yellow-50 hover:text-yellow-600"
                      )}
                    >
                      <item.icon
                        className={cn("w-5 h-5", collapsed ? "" : "mr-3")}
                      />
                      {!collapsed && <span>{item.name}</span>}
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">{item.name}</TooltipContent>
                </Tooltip>
              ))}
            </TooltipProvider>
          </nav>
        </ScrollArea>

        {/* Logout section */}
        <Separator />
        <div className={cn(collapsed ? "p-2" : "p-4")}>
          <Button
            variant="ghost"
            className={cn(
              "text-gray-500 hover:bg-yellow-50 hover:text-yellow-600",
              collapsed
                ? "w-full justify-center px-2 py-2"
                : "w-full justify-start"
            )}
            onClick={() => handleLogout()}
            title={collapsed ? "Cerrar sesión" : undefined}
          >
            <LogOut className={cn("w-5 h-5", collapsed ? "" : "mr-3")} />
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
