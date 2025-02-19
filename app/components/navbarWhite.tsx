"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCartIcon, UserIcon } from "@heroicons/react/24/outline";

export default function NavbarWhite() {
  const pathname = usePathname();
  const [isShrunk, setIsShrunk] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsShrunk(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`flex items-center justify-between px-8 fixed w-full z-50 transition-all duration-300 bg-white ${
        isShrunk ? "py-3" : "py-4"
      }`}
    >
      {/* Center: Navigation Links */}
      <div className="flex space-x-8">
        {[
          { name: "Inicio", href: "/" },
          { name: "Categorías", href: "/categorias" },
          { name: "Todos los productos", href: "/productos" },
          { name: "Contacto", href: "/contacto" },
        ].map((item) => (
          <Link key={item.name} href={item.href}>
            <span
              className={`text-sm font-medium transition-colors hover:text-yellow-500 ${
                pathname === item.href ? "text-yellow-500" : "text-black-300"
              }`}
            >
              {item.name}
            </span>
          </Link>
        ))}
      </div>

      {/* Left: Brand */}
      <Link href="/">
        <span className="text-2xl font-bold text-black">KEISHEN</span>
      </Link>

      {/* Right: Cart & Account */}
      <div className="flex items-center space-x-6">
        <Link href="/cart">
          <div className="relative">
            <ShoppingCartIcon className="h-6 w-6 text-black" />
            <span className="absolute -top-3 -right-3 bg-yellow-300 text-black text-xs px-2 py-1 rounded-full">
              0
            </span>
          </div>
        </Link>
        <Link href="/login">
          <UserIcon className="h-6 w-6 text-black" />
        </Link>
      </div>
    </nav>
  );
}
