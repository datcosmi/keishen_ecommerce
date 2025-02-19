"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCartIcon, UserIcon } from "@heroicons/react/24/outline";

export default function NavbarBlack() {
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
      className={`flex items-center justify-between px-8 fixed w-full z-50 transition-all duration-300 ${
        isShrunk ? "py-3 bg-black" : "py-4 bg-transparent"
      }`}
    >
      {/* Left: Brand */}
      <Link href="/">
        <span className="text-2xl font-bold text-white">KEISHEN</span>
      </Link>

      {/* Center: Navigation Links */}
      <div className="flex space-x-8">
        {["Inicio", "Categorías", "Todos los productos", "Contacto"].map(
          (name, index) => {
            const href =
              index === 0 ? "/" : `/${name.toLowerCase().replace(" ", "")}`;
            return (
              <Link key={name} href={href}>
                <span
                  className={`text-sm font-medium transition-colors hover:text-yellow-300 ${
                    pathname === href ? "text-yellow-300" : "text-gray-300"
                  }`}
                >
                  {name}
                </span>
              </Link>
            );
          }
        )}
      </div>

      {/* Right: Cart & Account */}
      <div className="flex items-center space-x-6">
        <Link href="/cart">
          <div className="relative">
            <ShoppingCartIcon className="h-6 w-6 text-white" />
            <span className="absolute -top-3 -right-3 bg-yellow-300 text-black text-xs px-2 py-1 rounded-full">
              0
            </span>
          </div>
        </Link>
        <Link href="/login">
          <UserIcon className="h-6 w-6 text-white" />
        </Link>
      </div>
    </nav>
  );
}
