"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShoppingBagIcon,
  UserCircleIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { useInView } from "react-intersection-observer";

export default function LandingPage() {
  const pathname = usePathname();
  const [searchFocus, setSearchFocus] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [isShrunk, setIsShrunk] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      setIsShrunk(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const { ref: bannerRef, inView: bannerInView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const { ref: productsRef, inView: productsInView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top Navbar */}
      <nav
        className={`flex items-center justify-between px-6 fixed w-full z-50 transition-all duration-300 ${
          isShrunk ? "py-4 bg-black" : "py-6 bg-transparent"
        }`}
      >
        {/* Left: Navigation Links */}
        <div className="flex space-x-8">
          {[
            { name: "Inicio", href: "/" },
            { name: "Productos", href: "/productos" },
            { name: "Contacto", href: "/contacto" },
          ].map((item) => (
            <Link key={item.name} href={item.href}>
              <span
                className={`text-lg transition-colors hover:text-yellow-300 ${
                  pathname === item.href ||
                  (pathname === "/" && item.name === "Inicio")
                    ? "text-yellow-300"
                    : "text-gray-300"
                }`}
              >
                {item.name}
              </span>
            </Link>
          ))}
        </div>

        {/* Center: Logo */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <Image
            src="/logo.png"
            alt="Keishen Logo"
            width={isShrunk ? 150 : 200}
            height={isShrunk ? 75 : 100}
          />
        </div>

        {/* Right: Search Bar & Icons */}
        <div className="flex items-center space-x-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar"
              className="w-56 bg-black border-2 border-gray-400 rounded-full px-4 py-2 transition-all duration-300 focus:w-[30vw] focus:bg-white focus:text-black"
              onFocus={() => setSearchFocus(true)}
              onBlur={() => setSearchFocus(false)}
            />
            <MagnifyingGlassIcon className="w-5 h-5 absolute right-4 top-2 text-gray-400" />
          </div>
          {[
            { icon: ShoppingBagIcon, name: "carrito", href: "/carrito" },
            { icon: UserCircleIcon, name: "login", href: "/login" },
          ].map(({ icon: Icon, name, href }) => (
            <Link key={name} href={href} passHref>
              <div className="relative flex items-center cursor-pointer">
                {/* Animated Label */}
                <span
                  className={`absolute right-10 bg-gray-800 text-white text-sm px-3 py-1 rounded-lg transition-all duration-300 opacity-0 transform translate-x-2`}
                ></span>

                {/* Icon */}
                <Icon className="w-6 h-6 text-gray-300 hover:text-yellow-500 transition-all duration-300" />
              </div>
            </Link>
          ))}
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative flex items-center h-[95vh] bg-black text-white pt-24 overflow-hidden">
        <div className="absolute w-full bottom-0 z-0 overflow-hidden">
          <h1
            className="text-[23vw] font-extrabold text-center tracking-tighter opacity-60"
            style={{
              background: "linear-gradient(to top, #808080, #000000)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Keishen
          </h1>
        </div>

        <div className="relative flex w-full h-full z-10">
          {/* Watch Image */}
          <div
            className="absolute left-10 top-0 transform transition-transform duration-300"
            style={{
              transform: `translateY(${scrollY * 0.05}px) rotate(-6deg)`,
            }}
          >
            <Image
              src="/watch.png"
              alt="Luxury Watch"
              width={350}
              height={350}
            />
          </div>

          {/* Banner Text */}
          <div
            ref={bannerRef}
            className={`absolute left-[30%] top-[10%] transition-all duration-500 w-[65vw] ${
              bannerInView
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-2"
            }`}
            style={{ transform: `translateY(${scrollY * 0.03}px)` }}
          >
            <h1 className="text-5xl font-serif font-bold leading-snug bg-gradient-to-r from-gray-500 to-gray-300 bg-clip-text text-transparent opacity-100">
              Una experiencia única para hombres, con productos de alta calidad
              en joyería, ropa y accesorios.
            </h1>
          </div>
        </div>
      </header>

      {/* Products Section */}
      <section
        ref={productsRef}
        className={`relative bg-white text-gray-900 py-16 px-12 mt-[-200px] z-10 rounded-t-3xl shadow-lg transition-all duration-500 ${
          productsInView
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-2"
        }`}
      >
        <h2 className="text-2xl font-bold">Productos destacados</h2>
        <div className="grid grid-cols-4 gap-6 mt-6">
          {[100000, 200000, 300000, 400000].map((price, idx) => (
            <div
              key={idx}
              className="bg-gray-200 rounded-lg p-4 shadow-lg h-64 flex flex-col justify-end transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
            >
              <p className="text-lg font-bold">
                ${price.toLocaleString("es-ES")}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-gray-300 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2023 Keishen. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
