"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ShoppingCartIcon,
  UserIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "./ui/button";
import { useSession } from "next-auth/react";

interface Category {
  id_cat: number;
  name: string;
}

interface CartItems {
  cart_id: number;
  total_items: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

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

  // Mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Search functionality
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Authentication
  const { isAuthenticated, user, logout } = useAuth();
  const { data: session } = useSession();
  const token = session?.accessToken;

  const handleLogout = async () => {
    await logout();
    router.push("/");
    setMobileMenuOpen(false);
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
      const response = await fetch(`${API_BASE_URL}/api/categories`);
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
        `${API_BASE_URL}/api/cart/user/${user?.id_user}/count`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch cart items");
      }
      const data = await response.json();
      setCartItems(data);
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
          `${API_BASE_URL}/api/products/search?q=${encodeURIComponent(term)}`
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

  // Close the mobile menu when navigating to a new page
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Add body scroll lock when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <nav
        className={`flex items-center justify-between px-4 md:px-8 sticky top-0 w-full z-50 transition-all duration-300 ${
          isShrunk
            ? "py-2 md:py-4 bg-black/95 backdrop-blur-md shadow-lg"
            : "py-3 md:py-6 bg-black"
        }`}
      >
        {/* Mobile menu button - only visible on small screens */}
        <div className="lg:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-white focus:outline-none"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
        </div>

        {/* Logo */}
        <div className="flex items-center space-x-3">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src={"/logo-collapsed.png"}
              alt="Logo"
              width={38}
              height={38}
              priority
              className="object-cover transition-transform duration-300 hover:scale-105"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <span className="text-xl md:text-2xl font-bold text-white tracking-widest">
              KEISHEN
            </span>
          </Link>
        </div>

        {/* Links de navegación - hidden on mobile */}
        <div className="hidden lg:flex justify-center space-x-8">
          <Link href="/">
            <span
              className={`text-sm font-medium transition-colors hover:text-yellow-300 ${
                pathname === "/"
                  ? "text-yellow-300 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-yellow-300"
                  : "text-gray-300"
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
                    pathname === "/productos" ||
                    pathname.startsWith("/productos/")
                      ? "text-yellow-300 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-yellow-300"
                      : "text-gray-300"
                  }`}
                >
                  Nuestros productos
                </span>
              </Link>
            </div>

            {/* Products dropdown - visible on hover */}
            {showProductsMenu && categories.length > 0 && (
              <div
                className="absolute top-6 -left-4 mt-2 w-56 bg-black border border-gray-800 rounded-md shadow-xl py-2 z-50"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                {categories.map((category) => (
                  <Link
                    key={category.id_cat}
                    href={`/productos?category=${category.id_cat}`}
                  >
                    <div className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-yellow-300 transition duration-150">
                      {category.name}
                    </div>
                  </Link>
                ))}
                <div className="border-t border-gray-800 mt-1 pt-1">
                  <Link href="/productos">
                    <div className="block px-4 py-2 text-sm text-yellow-300 hover:bg-gray-800 font-medium">
                      Ver todos los productos
                    </div>
                  </Link>
                </div>
              </div>
            )}
          </div>

          <Link href="/sobre-nosotros">
            <span
              className={`text-sm font-medium transition-colors hover:text-yellow-300 ${
                pathname === "/sobre-nosotros"
                  ? "text-yellow-300 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-yellow-300"
                  : "text-gray-300"
              }`}
            >
              Nosotros
            </span>
          </Link>
        </div>

        {/* Right section: Search, Cart, User */}
        <div className="flex items-center space-x-3 md:space-x-6">
          {/* Search - collapsible on mobile */}
          <div
            className={`relative transition-all duration-300 ${isFocused ? "flex-grow" : ""}`}
            ref={searchRef}
          >
            <div
              className={`relative ${isFocused ? "w-full" : "hidden md:block"}`}
            >
              <input
                type="text"
                placeholder="Buscar"
                className={`py-1.5 pl-8 pr-4 border border-gray-700 rounded-full text-sm focus:outline-none transition-all duration-300 ${
                  isFocused
                    ? "w-full md:w-80 bg-white text-black shadow-lg ring-2 ring-yellow-300"
                    : "w-64 bg-gray-900 text-white"
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
                className={`absolute left-3 top-2 h-4 w-4 transition-all duration-300 ${
                  isFocused ? "text-gray-500" : "text-gray-300"
                }`}
              />
            </div>

            {/* Search icon for mobile */}
            <button
              className={`md:hidden ${isFocused ? "hidden" : "block"}`}
              onClick={() => setIsFocused(true)}
            >
              <MagnifyingGlassIcon className="h-5 w-5 text-white" />
            </button>

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
                          src={`${API_BASE_URL}${product.image_url}`}
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
                      <p className="text-xs text-gray-400">
                        {product.category}
                      </p>
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

          {/* Cart icon */}
          {user?.role === "cliente" && (
            <Link href="/carrito">
              <div className="relative group">
                <ShoppingCartIcon className="h-6 w-6 text-white group-hover:text-yellow-300 transition-colors" />
                {isAuthenticated && cartItems.total_items > 0 && (
                  <span className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs px-1.5 py-0.5 rounded-full min-w-[20px] h-5 flex items-center justify-center group-hover:bg-yellow-300 transition-colors">
                    {cartItems.total_items || 0}
                  </span>
                )}
              </div>
            </Link>
          )}

          {/* Login/Register buttons - hidden on mobile */}
          {!isAuthenticated && (
            <div className="hidden md:flex gap-3">
              <Link href="/login">
                <Button
                  variant="default"
                  className="bg-yellow-400 hover:bg-yellow-500 text-black font-medium rounded-full px-4 py-2 transition-all duration-300 hover:shadow-lg"
                  size="sm"
                >
                  Iniciar sesión
                </Button>
              </Link>

              <Link href="/register">
                <Button
                  variant="outline"
                  className="bg-trnsparentborder-white text-white hover:bg-white hover:text-black rounded-full px-4 py-2 transition-all duration-300"
                  size="sm"
                >
                  Registrarse
                </Button>
              </Link>
            </div>
          )}

          {/* User menu */}
          {isAuthenticated && (
            <div className="relative">
              <div
                className="cursor-pointer group"
                onMouseEnter={handleUserMouseEnter}
                onMouseLeave={handleUserMouseLeave}
              >
                <UserIcon className="h-6 w-6 text-white group-hover:text-yellow-300 transition-colors" />
              </div>

              {showUserMenu && (
                <div
                  className="absolute top-8 right-0 mt-1 w-56 bg-black border border-gray-700 rounded-md shadow-xl py-2 z-50"
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
                      <div className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-yellow-300 transition duration-150">
                        Mi Perfil
                      </div>
                    </Link>

                    {user?.role === "cliente" && (
                      <Link href="/pedidos">
                        <div className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-yellow-300 transition duration-150">
                          Mis Pedidos
                        </div>
                      </Link>
                    )}

                    {(user?.role === "admin_tienda" ||
                      user?.role === "superadmin") && (
                      <Link href="/panel/dashboard">
                        <div className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-yellow-300 transition duration-150">
                          Panel de Administración
                        </div>
                      </Link>
                    )}

                    {user?.role === "vendedor" && (
                      <Link href="/panel/pedidos">
                        <div className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-yellow-300 transition duration-150">
                          Panel de Vendedor
                        </div>
                      </Link>
                    )}

                    <div
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-yellow-300 transition duration-150 cursor-pointer"
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

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="fixed inset-0 bg-black z-50 lg:hidden overflow-y-auto"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.25 }}
          >
            <div className="flex justify-between items-center p-4 border-b border-gray-800">
              <Link href="/" className="flex items-center space-x-2">
                <Image
                  src={"/logo-collapsed.png"}
                  alt="Logo"
                  width={32}
                  height={32}
                  className="object-cover"
                  sizes="32px"
                />
                <span className="text-xl font-bold text-white tracking-widest">
                  KEISHEN
                </span>
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-white"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <Link href="/" className="block py-3 border-b border-gray-800">
                <span
                  className={`text-lg font-medium ${pathname === "/" ? "text-yellow-300" : "text-gray-300"}`}
                >
                  Inicio
                </span>
              </Link>

              <Link
                href="/productos"
                className="block py-3 border-b border-gray-800"
              >
                <span
                  className={`text-lg font-medium ${pathname === "/productos" || pathname.startsWith("/productos/") ? "text-yellow-300" : "text-gray-300"}`}
                >
                  Nuestros productos
                </span>
              </Link>

              {categories.length > 0 && (
                <div className="pl-4 space-y-2 mb-4">
                  {categories.map((category) => (
                    <Link
                      key={category.id_cat}
                      href={`/productos?category=${category.id_cat}`}
                      className="block py-2 text-gray-400 hover:text-yellow-300"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              )}

              <Link
                href="/sobre-nosotros"
                className="block py-3 border-b border-gray-800"
              >
                <span
                  className={`text-lg font-medium ${pathname === "/sobre-nosotros" ? "text-yellow-300" : "text-gray-300"}`}
                >
                  Nosotros
                </span>
              </Link>

              {user?.role === "cliente" && (
                <Link
                  href="/carrito"
                  className="block py-3 border-b border-gray-800"
                >
                  <div className="flex items-center">
                    <ShoppingCartIcon className="h-5 w-5 mr-2 text-gray-300" />
                    <span className="text-lg font-medium text-gray-300">
                      Carrito
                      {cartItems.total_items > 0 && (
                        <span className="ml-2 bg-yellow-400 text-black text-xs px-2 py-1 rounded-full">
                          {cartItems.total_items}
                        </span>
                      )}
                    </span>
                  </div>
                </Link>
              )}

              {!isAuthenticated ? (
                <div className="pt-4 space-y-3">
                  <Link href="/login" className="block">
                    <Button
                      variant="default"
                      className="bg-yellow-400 hover:bg-yellow-500 text-black font-medium w-full py-5"
                    >
                      Iniciar sesión
                    </Button>
                  </Link>

                  <Link href="/register" className="block">
                    <Button
                      variant="outline"
                      className="bg-transparent border-white text-white hover:bg-white hover:text-black w-full py-5"
                    >
                      Registrarse
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="pt-4 space-y-3">
                  <div className="p-4 border border-gray-800 rounded-lg">
                    <p className="text-yellow-300 font-medium">
                      {user?.name} {user?.surname}
                    </p>
                    <p className="text-gray-400 text-sm truncate">
                      {user?.email}
                    </p>
                  </div>

                  <Link
                    href="/profile"
                    className="block py-3 border-b border-gray-800"
                  >
                    <span className="text-lg font-medium text-gray-300">
                      Mi Perfil
                    </span>
                  </Link>

                  {user?.role === "cliente" && (
                    <Link
                      href="/pedidos"
                      className="block py-3 border-b border-gray-800"
                    >
                      <span className="text-lg font-medium text-gray-300">
                        Mis Pedidos
                      </span>
                    </Link>
                  )}

                  {(user?.role === "admin_tienda" ||
                    user?.role === "superadmin") && (
                    <Link
                      href="/panel/dashboard"
                      className="block py-3 border-b border-gray-800"
                    >
                      <span className="text-lg font-medium text-gray-300">
                        Panel de Administración
                      </span>
                    </Link>
                  )}

                  {user?.role === "vendedor" && (
                    <Link
                      href="/panel/pedidos"
                      className="block py-3 border-b border-gray-800"
                    >
                      <span className="text-lg font-medium text-gray-300">
                        Panel de Vendedor
                      </span>
                    </Link>
                  )}

                  <Button
                    variant="destructive"
                    className="w-full mt-4"
                    onClick={handleLogout}
                  >
                    Cerrar Sesión
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
