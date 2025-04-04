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
  Tags,
  Layers2,
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

const Sidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { name: "Inicio", icon: Home, href: "/panel/dashboard" },
    { name: "Productos", icon: Archive, href: "/panel/products" },
    { name: "Categorias", icon: Layers2, href: "/panel/categories" },
    { name: "Descuentos", icon: Tags, href: "/panel/discounts" },
    { name: "Pedidos", icon: CreditCard, href: "/panel/pedidos" },
    { name: "Ventas", icon: BarChart2, href: "/panel/ventas" },
    { name: "Administradores", icon: User, href: "/panel/administradores" },
    { name: "Vendedores", icon: Users, href: "/panel/vendedores" },
    { name: "Configuración", icon: Settings, href: "/panel/settings" },
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
        "h-screen bg-white hidden md:flex flex-col border-r border-gray-200 transition-all duration-300 ease-in-out sticky top-0"
      )}
    >
      {/* Toggle button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className="absolute -right-4 top-16 h-8 w-8 rounded-full border border-gray-200 bg-white shadow-md z-10"
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>

      {/* Contenedor principal */}
      <div className="flex flex-col h-full">
        {/* Logo section */}
        <div
          className={cn(
            "flex justify-center items-center transition-all mt-4",
            collapsed ? "py-4" : "p-4"
          )}
        >
          <Link href="/panel/dashboard" className="flex justify-center">
            {collapsed ? (
              <span className="text-2xl font-bold text-black">K</span>
            ) : (
              <div className="flex flex-col justify-center items-center gap-2">
                <Image
                  src={"/logo-collapsed.png"}
                  alt="Logo"
                  width={70}
                  height={70}
                  priority
                  className="object-cover p-2 transition-transform duration-300 hover:scale-105 shadow-md rounded-xl"
                  sizes="(max-width: 768px) 100vw, 50vw"
                ></Image>
                <span className="text-2xl font-bold tracking-wide text-black text-gray-700">
                  KEISHEN
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation section */}
        <div className="flex-1 flex flex-col mt-4">
          <ScrollArea className="py-4">
            <nav className={cn(collapsed ? "px-1" : "px-2")}>
              <TooltipProvider delayDuration={300}>
                {menuItems.map((item) => (
                  <Tooltip key={item.name}>
                    <TooltipTrigger asChild>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center mb-1 rounded-lg text-sm font-medium transition-colors",
                          collapsed ? "justify-center px-2 py-2" : "px-3 py-2",
                          isActiveRoute(item.href)
                            ? "bg-black text-white shadow-xl"
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
        </div>

        <Separator />

        {/* Logout section */}
        <div className={cn(collapsed ? "p-2" : "p-4")}>
          <Button
            variant="ghost"
            className={cn(
              "text-gray-500 hover:bg-yellow-50 hover:text-yellow-600",
              collapsed
                ? "w-full justify-center px-2 py-2"
                : "w-full justify-start"
            )}
            onClick={handleLogout}
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
