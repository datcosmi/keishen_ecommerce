"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShoppingCartIcon,
  UserIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

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
    <nav className="sticky top-0 w-full bg-white z-50 transition-all duration-300 shadow-md">
      {/* Top section: Logo */}
      <div className={`flex justify-center py-4`}>
        <Link href="/">
          <span className="text-3xl font-bold tracking-widest text-black">
            KEISHEN
          </span>
        </Link>
      </div>

      {/* Bottom section: Categories, Search Bar, and Icons */}
      <div className="border-t border-gray-200 py-2 px-8 flex items-center justify-between">
        {/* Navigation Links (Left-Aligned) */}
        <div className="flex space-x-6">
          {[
            { name: "JOYERIA", href: "/joyeria" },
            { name: "CAMISAS", href: "/camisas" },
            { name: "PANTALONES", href: "/pantalones" },
            { name: "GORRAS", href: "/gorras" },
            { name: "OTROS", href: "/otros" },
          ].map((item) => (
            <Link key={item.name} href={item.href}>
              <span
                className={`text-sm font-medium transition-colors hover:text-yellow-500 ${
                  pathname === item.href ? "text-yellow-500" : "text-black"
                }`}
              >
                {item.name}
              </span>
            </Link>
          ))}
        </div>

        {/* Search Bar and Icons (Right-Aligned) */}
        <div className="flex items-center space-x-6">
          {/* Search Bar */}
          <div className="relative w-56">
            <input
              type="text"
              placeholder="Search"
              className="w-full py-1 px-4 border border-gray-300 rounded-full text-sm focus:outline-none"
            />
            <MagnifyingGlassIcon className="absolute right-3 top-2 h-4 w-4 text-gray-500" />
          </div>

          {/* User & Cart Icons */}
          <Link href="/login">
            <UserIcon className="h-6 w-6 text-black cursor-pointer" />
          </Link>
          <Link href="/cart">
            <div className="relative">
              <ShoppingCartIcon className="h-6 w-6 text-black cursor-pointer" />
              <span className="absolute -top-3 -right-3 bg-yellow-300 text-black text-xs px-2 py-1 rounded-full">
                0
              </span>
            </div>
          </Link>
        </div>
      </div>
    </nav>
  );
}
