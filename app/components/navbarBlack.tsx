"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShoppingCartIcon,
  UserIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

export default function NavbarBlack() {
  const pathname = usePathname();
  const [isShrunk, setIsShrunk] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsShrunk(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`flex items-center px-8 sticky top-0 w-full z-50 transition-all duration-300 ${
        isShrunk ? "py-4 bg-black" : "py-6 bg-transparent"
      }`}
    >
      {/* Logo */}
      <div className="w-1/3 flex justify-start">
        <Link href="/">
          <span className="text-2xl font-bold text-white tracking-widest">
            KEISHEN
          </span>
        </Link>
      </div>

      {/* Links de navegación */}
      <div className="w-1/3 flex justify-center space-x-8">
        {["Inicio", "Categorías", "Todos los productos", "Contacto"].map(
          (name, index) => {
            const href =
              index === 0
                ? "/"
                : index === 2
                ? "products"
                : `/${name.toLowerCase().replace(" ", "")}`;
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

      {/* Barra de búsqueda e íconos */}
      <div className="w-1/3 flex justify-end items-center space-x-6">
        <div className="relative transition-all duration-300">
          <input
            type="text"
            placeholder="Buscar"
            className={`py-1 px-4 border border-gray-300 rounded-full text-sm focus:outline-none transition-all duration-300 ${
              isFocused
                ? "w-80 bg-white text-black shadow-lg"
                : "w-64 bg-black text-white"
            }`}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
          <MagnifyingGlassIcon
            className={`absolute right-3 top-2 h-4 w-4 transition-all duration-300 ${
              isFocused ? "text-gray-500" : "text-gray-300"
            }`}
          />
        </div>
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
