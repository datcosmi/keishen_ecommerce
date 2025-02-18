"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShoppingBagIcon,
  UserCircleIcon,
  MagnifyingGlassIcon,
  ShoppingCartIcon,
  UserIcon,
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

  const { ref: heroRef, inView: heroInView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const { ref: productsRef, inView: productsInView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <div className="min-h-screen bg-black">
      {/* Top Navbar */}
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
          {[
            { name: "Inicio", href: "/" },
            { name: "Categorías", href: "/categorias" },
            { name: "Todos los productos", href: "/productos" },
            { name: "Contacto", href: "/contacto" },
          ].map((item) => (
            <Link key={item.name} href={item.href}>
              <span
                className={`text-sm font-medium transition-colors hover:text-yellow-300 ${
                  pathname === item.href ? "text-yellow-300" : "text-gray-300"
                }`}
              >
                {item.name}
              </span>
            </Link>
          ))}
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

      {/* Hero Section */}
      <section ref={heroRef} className="relative pt-24 px-8">
        {/* Background text */}
        <div className="absolute bottom-[-35%] left-0 w-full flex justify-center z-0">
          {" "}
          {/* Changed back to z-0 */}
          <span className="text-[20rem] font-extrabold text-center tracking-tighter opacity-50 font-bold text-transparent bg-clip-text bg-gradient-to-t from-[#808080] to-black">
            KEISHEN
          </span>
        </div>

        <div
          className={`max-w-6xl mx-auto transition-all duration-700 ${
            heroInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="w-1/2 pt-16">
              <h1 className="text-6xl font-bold text-white leading-tight">
                TRANSFORMA TU
                <br />
                <span className="text-yellow-300">ESTILO</span> CON MODA
                <br />
                QUE HABLA <span className="text-yellow-300">POR TI</span>
              </h1>
              <p className="mt-6 text-gray-400 max-w-xl">
                Eleva tu estilo adoptando las últimas tendencias y prestando
                atención a cada detalle para reflejar tu personalidad única.
              </p>

              <button className="mt-8 bg-yellow-300 text-black px-8 py-3 rounded-full font-medium flex items-center space-x-2 hover:bg-yellow-400 transition-colors">
                <span>Ver todo</span>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 12h14M12 5l7 7-7 7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
            <div className="w-1/2 relative">
              <div className="relative w-full min-h-[600px]">
                <Image
                  src="/watch.png"
                  alt="Fashion Model"
                  layout="fill"
                  objectFit="contain"
                  className="rounded-3xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brands Section */}
      <div className="mt-16 py-8 bg-yellow-300 relative z-20">
        {" "}
        {/* Increased z-index to z-20 */}
        <div className="max-w-6xl mx-auto px-8">
          <div className="flex justify-between items-center">
            {["JOYERIA", "CAMISAS", "PANTALONES", "GORRAS", "OTROS"].map(
              (brand) => (
                <span key={brand} className="text-black font-bold text-xl">
                  {brand}
                </span>
              )
            )}
          </div>
        </div>
      </div>

      {/* Products Section */}
      <section ref={productsRef} className="py-16 px-8 bg-white">
        <div
          className={`max-w-6xl mx-auto transition-all duration-700 ${
            productsInView
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          <h2 className="text-3xl font-bold text-black mb-8">
            VISTE CON ESTILO
          </h2>
          <div className="grid grid-cols-3 gap-8">
            {[
              { name: "MEN'S CASUAL BLAZE", price: "$185" },
              { name: "CARGO MENS WIDE JEANS", price: "$275" },
              { name: "MEN LEATHER JACKET", price: "$375" },
            ].map((product) => (
              <div key={product.name} className="group cursor-pointer">
                <div className="bg-gray-100 rounded-xl aspect-square mb-4 overflow-hidden">
                  <div className="w-full h-full bg-gray-200" />
                </div>
                <h3 className="text-sm font-medium text-black">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-500">{product.price}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
