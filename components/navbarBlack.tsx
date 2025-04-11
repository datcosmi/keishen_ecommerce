"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ShoppingCartIcon,
  UserIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "./ui/button";

interface Category {
  id_cat: number;
  name: string;
}

interface CartItems {
  cart_id: number;
  total_items: number;
}

const API_BASE_URL = "http://localhost:3001/api";

export default function NavbarBlack() {
  const pathname = usePathname();
  const router = useRouter();
  const [isShrunk, setIsShrunk] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [showProductsMenu, setShowProductsMenu] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cartItems, setCartItems] = useState<CartItems>({
    cart_id: 0,
    total_items: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const dropdownRef = useRef<NodeJS.Timeout | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Search functionality
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Authentication
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsShrunk(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch categories from the API
  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/categories`);
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

  const fetchCartItems = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/cart/user/${user?.id_user}/count`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch cart items");
      }
      const data = await response.json();
      setCartItems(data);
      console.log("Cart items:", data);
    } catch (error) {
      console.error("Error fetching cart items:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (user?.id_user) {
      fetchCartItems();
    }
  }, [user]);

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

  // Search functionality
  const handleSearch = async (term: string) => {
    setSearchTerm(term);

    if (term.length >= 2) {
      try {
        const response = await fetch(
          `http://localhost:3001/api/products/search?q=${encodeURIComponent(
            term
          )}`
        );
        if (!response.ok) throw new Error("Search failed");
        const data = await response.json();
        setSearchResults(data);
        setShowResults(true);
      } catch (error) {
        console.error("Error searching products:", error);
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.length >= 2) {
        handleSearch(searchTerm);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchTerm.trim()) {
      router.push(`/productos?search=${encodeURIComponent(searchTerm)}`);
      setShowResults(false);
    }
  };

  const userMenuRef = useRef<NodeJS.Timeout | null>(null);

  const handleUserMouseLeave = () => {
    const timer = setTimeout(() => {
      setShowUserMenu(false);
    }, 300); // Delay before hiding the menu

    userMenuRef.current = timer;
  };

  const handleUserMouseEnter = () => {
    if (userMenuRef.current) {
      clearTimeout(userMenuRef.current);
    }
    setShowUserMenu(true);
  };

  return (
    <nav
      className={`flex items-center px-8 sticky top-0 w-full z-50 transition-all duration-300 ${
        isShrunk ? "py-4 bg-black" : "py-6 bg-black"
      }`}
    >
      {/* Logo */}
      <div className="w-1/3 flex items-center space-x-3">
        <Link href="/" className="flex items-center space-x-2">
          <Image
            src={"/logo-collapsed.png"}
            alt="Logo"
            width={40}
            height={40}
            priority
            className="object-cover transition-transform duration-300 hover:scale-105 mr-2"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
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
        <div className="relative transition-all duration-300" ref={searchRef}>
          <input
            type="text"
            placeholder="Buscar"
            className={`py-1 px-4 border border-gray-300 rounded-full text-sm focus:outline-none transition-all duration-300 ${
              isFocused
                ? "w-80 bg-white text-black shadow-lg"
                : "w-64 bg-black text-white"
            }`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              setIsFocused(true);
              if (searchResults.length > 0) setShowResults(true);
            }}
            onBlur={() => setIsFocused(false)}
          />
          <MagnifyingGlassIcon
            className={`absolute right-3 top-2 h-4 w-4 transition-all duration-300 ${
              isFocused ? "text-gray-500" : "text-gray-300"
            }`}
          />

          {/* Search results dropdown */}
          {showResults && searchResults.length > 0 && (
            <div className="absolute top-full left-0 w-full mt-1 bg-black border border-gray-700 rounded-md shadow-lg z-50 max-h-80 overflow-y-auto">
              {searchResults.map((product) => (
                <div
                  key={product.id_product}
                  className="p-2 hover:bg-gray-800 cursor-pointer border-b border-gray-700 flex items-center"
                  onClick={() => {
                    router.push(`/productos/${product.id_product}`);
                    setShowResults(false);
                    setSearchTerm("");
                  }}
                >
                  <div className="w-12 h-12 relative mr-2 bg-gray-800 rounded">
                    {product.image_url ? (
                      <Image
                        src={`http://localhost:3001${product.image_url}`}
                        alt={product.product_name}
                        fill
                        className="object-cover rounded p-1"
                        sizes="48px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        <ShoppingCartIcon className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {product.product_name}
                    </p>
                    <p className="text-xs text-gray-400">{product.category}</p>
                  </div>
                </div>
              ))}
              <div
                className="p-2 text-center text-sm font-medium text-yellow-300 hover:bg-gray-800 cursor-pointer"
                onClick={() => {
                  router.push(
                    `/productos?search=${encodeURIComponent(searchTerm)}`
                  );
                  setShowResults(false);
                }}
              >
                Ver todos los resultados
              </div>
            </div>
          )}

          {showResults &&
            searchTerm.length >= 2 &&
            searchResults.length === 0 && (
              <div className="absolute top-full left-0 w-full mt-1 bg-black border border-gray-700 rounded-md shadow-lg z-50 p-3 text-center">
                <p className="text-sm text-gray-300">
                  No se encontraron productos
                </p>
              </div>
            )}
        </div>

        {user?.role === "cliente" && (
          <Link href="/carrito">
            <div className="relative">
              <ShoppingCartIcon className="h-6 w-6 text-white" />
              {isAuthenticated && (
                <span className="absolute -top-3 -right-3 bg-yellow-400 text-black text-xs px-2 py-1 rounded-full">
                  {cartItems.total_items || 0}
                </span>
              )}
            </div>
          </Link>
        )}

        {!isAuthenticated && (
          <div className="flex gap-3">
            <Link href="/login">
              <Button
                variant="default"
                className="bg-yellow-400 hover:bg-yellow-500"
              >
                <span className="text-black">Iniciar sesión</span>
              </Button>
            </Link>

            <Link href="/register">
              <Button
                variant="default"
                className="bg-black hover:bg-white hover:text-black"
              >
                <span>Registrarse</span>
              </Button>
            </Link>
          </div>
        )}

        {isAuthenticated && (
          <div className="relative">
            <div
              className="cursor-pointer"
              onMouseEnter={handleUserMouseEnter}
              onMouseLeave={handleUserMouseLeave}
            >
              <UserIcon className="h-6 w-6 text-white" />
            </div>

            {showUserMenu && (
              <div
                className="absolute top-8 right-0 mt-1 w-48 bg-black border border-gray-700 rounded-md shadow-lg py-2 z-50"
                onMouseEnter={handleUserMouseEnter}
                onMouseLeave={handleUserMouseLeave}
              >
                <div className="px-4 py-2 border-b border-gray-700">
                  <p className="text-yellow-300 font-medium text-sm">
                    {user?.name} {user?.surname}
                  </p>
                  <p className="text-gray-400 text-xs truncate">
                    {user?.email}
                  </p>
                </div>

                <div className="py-1">
                  <Link href="/profile">
                    <div className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-yellow-300">
                      Mi Perfil
                    </div>
                  </Link>

                  {user?.role === "cliente" && (
                    <Link href="/pedidos">
                      <div className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-yellow-300">
                        Mis Pedidos
                      </div>
                    </Link>
                  )}

                  {(user?.role === "admin_tienda" ||
                    user?.role === "superadmin") && (
                    <Link href="/panel/dashboard">
                      <div className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-yellow-300">
                        Panel de Administración
                      </div>
                    </Link>
                  )}

                  {user?.role === "vendedor" && (
                    <Link href="/panel/pedidos">
                      <div className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-yellow-300">
                        Panel de Vendedor
                      </div>
                    </Link>
                  )}

                  <div
                    className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-yellow-300 cursor-pointer"
                    onClick={handleLogout}
                  >
                    Cerrar Sesión
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
