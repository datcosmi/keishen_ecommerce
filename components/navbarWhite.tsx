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

export default function NavbarWhite() {
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
        className={`w-full sticky top-0 z-50 bg-white transition-all duration-300 shadow-md ${
          isShrunk ? " py-2" : "py-3 md:py-4"
        }`}
      >
        <div className=" mx-auto px-4 sm:px-6 lg:px-8">
          {/* Desktop Layout */}
          <div className="hidden lg:flex lg:flex-col">
            {/* Top Row - Logo and Auth */}
            <div className="flex justify-between items-center py-3">
              <Link href="/" className="flex items-center space-x-2">
                <Image
                  src="/logo-collapsed.png"
                  alt="Logo"
                  width={40}
                  height={40}
                  priority
                  className="object-cover transition-transform duration-300 hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <span className="text-2xl font-bold tracking-widest text-gray-800">
                  KEISHEN
                </span>
              </Link>

              {!isAuthenticated ? (
                <div className="flex gap-4">
                  <Link href="/login">
                    <Button
                      variant="default"
                      className="bg-yellow-400 hover:bg-yellow-500 text-black font-medium rounded-full px-5 transition-all duration-300"
                      size="sm"
                    >
                      Iniciar sesión
                    </Button>
                  </Link>

                  <Link href="/register">
                    <Button
                      variant="outline"
                      className="border-gray-400 text-gray-800 hover:bg-gray-800 hover:text-white rounded-full px-5 transition-all duration-300"
                      size="sm"
                    >
                      Registrarse
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  {user?.role === "cliente" && (
                    <Link href="/carrito">
                      <div className="relative group">
                        <ShoppingCartIcon className="h-6 w-6 text-gray-700 group-hover:text-yellow-500 transition-colors" />
                        {cartItems.total_items > 0 && (
                          <span className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs px-1.5 py-0.5 rounded-full min-w-[20px] h-5 flex items-center justify-center group-hover:bg-yellow-500 transition-colors">
                            {cartItems.total_items}
                          </span>
                        )}
                      </div>
                    </Link>
                  )}

                  <div className="relative">
                    <div
                      className="cursor-pointer group"
                      onMouseEnter={handleUserMouseEnter}
                      onMouseLeave={handleUserMouseLeave}
                    >
                      <UserIcon className="h-6 w-6 text-gray-700 group-hover:text-yellow-500 transition-colors" />
                    </div>

                    {showUserMenu && (
                      <div
                        className="absolute top-8 right-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-xl py-2 z-50"
                        onMouseEnter={handleUserMouseEnter}
                        onMouseLeave={handleUserMouseLeave}
                      >
                        <div className="px-4 py-2 border-b border-gray-200">
                          <p className="text-yellow-500 font-medium text-sm">
                            {user?.name} {user?.surname}
                          </p>
                          <p className="text-gray-500 text-xs truncate">
                            {user?.email}
                          </p>
                        </div>

                        <div className="py-1">
                          <Link href="/profile">
                            <div className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-yellow-500 transition duration-150">
                              Mi Perfil
                            </div>
                          </Link>

                          {user?.role === "cliente" && (
                            <Link href="/pedidos">
                              <div className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-yellow-500 transition duration-150">
                                Mis Pedidos
                              </div>
                            </Link>
                          )}

                          {(user?.role === "admin_tienda" ||
                            user?.role === "superadmin") && (
                            <Link href="/panel/dashboard">
                              <div className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-yellow-500 transition duration-150">
                                Panel de Administración
                              </div>
                            </Link>
                          )}

                          {user?.role === "vendedor" && (
                            <Link href="/panel/pedidos">
                              <div className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-yellow-500 transition duration-150">
                                Panel de Vendedor
                              </div>
                            </Link>
                          )}

                          <div
                            className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-yellow-500 transition duration-150 cursor-pointer"
                            onClick={handleLogout}
                          >
                            Cerrar Sesión
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Row - Navigation and Search */}
            <div className="flex justify-between items-center border-t border-gray-200 pt-4">
              <div className="flex space-x-10">
                <Link href="/">
                  <span
                    className={`text-sm font-medium transition-colors hover:text-yellow-500 ${
                      pathname === "/"
                        ? "text-yellow-500 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-yellow-500"
                        : "text-gray-700"
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
                        className={`text-sm font-medium transition-colors hover:text-yellow-500 ${
                          pathname === "/productos" ||
                          pathname.startsWith("/productos/")
                            ? "text-yellow-500 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-yellow-500"
                            : "text-gray-700"
                        }`}
                      >
                        Nuestros productos
                      </span>
                    </Link>
                  </div>

                  {/* Products dropdown - visible on hover */}
                  {showProductsMenu && categories.length > 0 && (
                    <div
                      className="absolute top-6 -left-4 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-xl py-2 z-50"
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                    >
                      {categories.map((category) => (
                        <Link
                          key={category.id_cat}
                          href={`/productos?category=${category.id_cat}`}
                        >
                          <div className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-yellow-500 transition duration-150">
                            {category.name}
                          </div>
                        </Link>
                      ))}
                      <div className="border-t border-gray-200 mt-1 pt-1">
                        <Link href="/productos">
                          <div className="block px-4 py-2 text-sm text-yellow-500 hover:bg-gray-100 font-medium">
                            Ver todos los productos
                          </div>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                <Link href="/sobre-nosotros">
                  <span
                    className={`text-sm font-medium transition-colors hover:text-yellow-500 ${
                      pathname === "/sobre-nosotros"
                        ? "text-yellow-500 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-yellow-500"
                        : "text-gray-700"
                    }`}
                  >
                    Nosotros
                  </span>
                </Link>
              </div>

              {/* Search bar */}
              <div className="relative" ref={searchRef}>
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  className="w-64 md:w-80 py-2 pl-10 pr-4 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => {
                    if (searchResults.length > 0) setShowResults(true);
                  }}
                />
                <MagnifyingGlassIcon className="absolute left-3 top-2 h-5 w-5 text-gray-400" />

                {/* Search results dropdown */}
                {showResults && searchResults.length > 0 && (
                  <div className="absolute top-full right-0 w-80 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                    {searchResults.map((product) => (
                      <div
                        key={product.id_product}
                        className="p-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 flex items-center gap-3"
                        onClick={() => {
                          router.push(`/productos/${product.id_product}`);
                          setShowResults(false);
                          setSearchTerm("");
                        }}
                      >
                        <div className="w-12 h-12 relative bg-gray-100 rounded">
                          {product.image_url ? (
                            <Image
                              src={`${API_BASE_URL}${product.image_url}`}
                              alt={product.product_name}
                              fill
                              className="object-cover rounded p-1"
                              sizes="48px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <ShoppingCartIcon className="h-5 w-5" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {product.product_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {product.category}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div
                      className="p-2 text-center text-sm font-medium text-yellow-500 hover:bg-gray-50 cursor-pointer"
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
                    <div className="absolute top-full right-0 w-64 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-3 text-center">
                      <p className="text-sm text-gray-500">
                        No se encontraron productos
                      </p>
                    </div>
                  )}
              </div>
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="flex lg:hidden justify-between items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-700 focus:outline-none"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>

            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/logo-collapsed.png"
                alt="Logo"
                width={32}
                height={32}
                priority
                className="object-cover"
                sizes="32px"
              />
              <span className="text-xl font-bold tracking-widest text-gray-800">
                KEISHEN
              </span>
            </Link>

            <div className="flex items-center gap-2">
              {/* Search icon for mobile */}
              <button className="p-1" onClick={() => router.push("/productos")}>
                <MagnifyingGlassIcon className="h-6 w-6 text-gray-700" />
              </button>

              {/* Cart for mobile */}
              {isAuthenticated && user?.role === "cliente" && (
                <Link href="/carrito">
                  <div className="relative p-1">
                    <ShoppingCartIcon className="h-6 w-6 text-gray-700" />
                    {cartItems.total_items > 0 && (
                      <span className="absolute -top-1 -right-1 bg-yellow-400 text-black text-xs px-1.5 py-0.5 rounded-full min-w-[18px] h-4 flex items-center justify-center">
                        {cartItems.total_items}
                      </span>
                    )}
                  </div>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="fixed inset-0 bg-white z-50 lg:hidden overflow-y-auto"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.25 }}
          >
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <Link href="/" className="flex items-center space-x-2">
                <Image
                  src="/logo-collapsed.png"
                  alt="Logo"
                  width={32}
                  height={32}
                  className="object-cover"
                  sizes="32px"
                />
                <span className="text-xl font-bold tracking-widest text-gray-800">
                  KEISHEN
                </span>
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-gray-700"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Search bar in mobile menu */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div className="p-4 space-y-4">
              <Link href="/" className="block py-3 border-b border-gray-200">
                <span
                  className={`text-lg font-medium ${pathname === "/" ? "text-yellow-500" : "text-gray-700"}`}
                >
                  Inicio
                </span>
              </Link>

              <Link
                href="/productos"
                className="block py-3 border-b border-gray-200"
              >
                <span
                  className={`text-lg font-medium ${
                    pathname === "/productos" ||
                    pathname.startsWith("/productos/")
                      ? "text-yellow-500"
                      : "text-gray-700"
                  }`}
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
                      className="block py-2 text-gray-600 hover:text-yellow-500"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              )}

              <Link
                href="/sobre-nosotros"
                className="block py-3 border-b border-gray-200"
              >
                <span
                  className={`text-lg font-medium ${
                    pathname === "/sobre-nosotros"
                      ? "text-yellow-500"
                      : "text-gray-700"
                  }`}
                >
                  Nosotros
                </span>
              </Link>

              {user?.role === "cliente" && (
                <Link
                  href="/carrito"
                  className="block py-3 border-b border-gray-200"
                >
                  <div className="flex items-center">
                    <ShoppingCartIcon className="h-5 w-5 mr-2 text-gray-700" />
                    <span className="text-lg font-medium text-gray-700">
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
                      className="bg-transparent border-gray-400 text-gray-700 hover:bg-gray-800 hover:text-white w-full py-5"
                    >
                      Registrarse
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="pt-4 space-y-3">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <p className="text-yellow-500 font-medium">
                      {user?.name} {user?.surname}
                    </p>
                    <p className="text-gray-500 text-sm truncate">
                      {user?.email}
                    </p>
                  </div>

                  <Link
                    href="/profile"
                    className="block py-3 border-b border-gray-200"
                  >
                    <span className="text-lg font-medium text-gray-700">
                      Mi Perfil
                    </span>
                  </Link>

                  {user?.role === "cliente" && (
                    <Link
                      href="/pedidos"
                      className="block py-3 border-b border-gray-200"
                    >
                      <span className="text-lg font-medium text-gray-700">
                        Mis Pedidos
                      </span>
                    </Link>
                  )}

                  {(user?.role === "admin_tienda" ||
                    user?.role === "superadmin") && (
                    <Link
                      href="/panel/dashboard"
                      className="block py-3 border-b border-gray-200"
                    >
                      <span className="text-lg font-medium text-gray-700">
                        Panel de Administración
                      </span>
                    </Link>
                  )}

                  {user?.role === "vendedor" && (
                    <Link
                      href="/panel/pedidos"
                      className="block py-3 border-b border-gray-200"
                    >
                      <span className="text-lg font-medium text-gray-700">
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
