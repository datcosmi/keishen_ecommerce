"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShoppingCartIcon,
  UserIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

interface Category {
  id: number;
  name: string;
}

export default function NavbarBlack() {
  const pathname = usePathname();
  const [isShrunk, setIsShrunk] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [showProductsMenu, setShowProductsMenu] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // Type the ref correctly for NodeJS.Timeout
  const dropdownRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsShrunk(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Fetch categories from the API
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/categories");
        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Create a buffer zone between the menu item and dropdown
  const handleMouseLeave = () => {
    const timer = setTimeout(() => {
      setShowProductsMenu(false);
    }, 300); // Delay before hiding the menu

    // Store the timer ID in a ref so we can clear it if needed
    dropdownRef.current = timer;
  };

  // Cancel the timeout if the user moves the mouse back into the menu
  const handleMouseEnter = () => {
    if (dropdownRef.current) {
      clearTimeout(dropdownRef.current);
    }
    setShowProductsMenu(true);
  };

  return (
    <nav
      className={`flex items-center px-8 sticky top-0 w-full z-50 transition-all duration-300 ${
        isShrunk ? "py-4 bg-black" : "py-6 bg-black"
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
        <Link href="/">
          <span
            className={`text-sm font-medium transition-colors hover:text-yellow-300 ${
              pathname === "/" ? "text-yellow-300" : "text-gray-300"
            }`}
          >
            Inicio
          </span>
        </Link>

        {/* Nuestros productos with dropdown */}
        <div className="relative">
          <div
            className="flex items-center cursor-pointer"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <Link href="/productos">
              <span
                className={`text-sm font-medium transition-colors hover:text-yellow-300 ${
                  pathname === "/productos"
                    ? "text-yellow-300"
                    : "text-gray-300"
                }`}
              >
                Nuestros productos
              </span>
            </Link>
          </div>

          {/* Dropdown menu with a larger design and title */}
          {showProductsMenu && (
            <div
              className="absolute top-6 left-1/2 transform -translate-x-1/2 mt-2 w-64 bg-black border border-gray-700 rounded-md shadow-lg py-2 z-50"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              {/* Title for the dropdown */}
              <div className="px-4 py-2 border-b border-gray-700">
                <h3 className="text-yellow-300 font-medium text-sm uppercase tracking-wider">
                  Categorías
                </h3>
              </div>

              {isLoading ? (
                <div className="px-4 py-3 text-sm text-gray-300">
                  Cargando...
                </div>
              ) : (
                <div className="py-2">
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/categoria/${category.name}`}
                    >
                      <div className="block px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 hover:text-yellow-300 transition-colors">
                        {category.name}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <Link href="/contacto">
          <span
            className={`text-sm font-medium transition-colors hover:text-yellow-300 ${
              pathname === "/contacto" ? "text-yellow-300" : "text-gray-300"
            }`}
          >
            Contacto
          </span>
        </Link>
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
        <Link href="/carrito">
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
