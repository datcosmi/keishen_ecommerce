"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  MinusIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  ShoppingCartIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { useInView } from "react-intersection-observer";

interface CartItem {
  id: number;
  type: string;
  name: string;
  variant: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartSummary {
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 1,
      type: "Reloj",
      name: "Reloj para hombre",
      variant: "Negro / Acero",
      price: 3500.0,
      quantity: 1,
      image: "/watch.png",
    },
    {
      id: 2,
      type: "Pantalones",
      name: "Pantalones de gabardina",
      variant: "Negro / XL",
      price: 1200.0,
      quantity: 1,
      image: "/pants.png",
    },
  ]);

  const [cartSummary, setCartSummary] = useState<CartSummary>({
    subtotal: 4700.0,
    shipping: 0.0,
    discount: 300.0,
    total: 4400.0,
  });

  const updateQuantity = (id: number, increment: boolean) => {
    setCartItems((items) =>
      items.map((item) => {
        if (item.id === id) {
          const newQuantity = increment
            ? item.quantity + 1
            : Math.max(1, item.quantity - 1);
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

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

  return (
    <div className="min-h-screen bg-white">
      {/* Top Navbar */}
      <nav
        className={`flex items-center justify-between px-8 fixed w-full z-50 transition-all duration-300 bg-black ${
          isShrunk ? "py-3" : "py-4"
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

      <main className="max-w-6xl mx-auto px-8 py-12">
        <h1 className="text-2xl font-medium mb-12 mt-10">Carrito de compras</h1>

        <div className="grid grid-cols-12 gap-16">
          {/* Cart Items */}
          <div className="col-span-7 space-y-8">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-start space-x-6">
                <button className="mt-2">
                  <MinusIcon className="h-4 w-4" />
                </button>

                <div className="w-20 h-20 bg-gray-100 rounded-lg relative">
                  <Image
                    src={item.image}
                    alt={item.name}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-lg"
                  />
                </div>

                <div className="flex-1">
                  <p className="text-sm text-gray-500">{item.type}</p>
                  <h3 className="text-base font-medium">{item.name}</h3>
                  <p className="text-sm text-gray-500">{item.variant}</p>

                  <div className="mt-4 flex items-center">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm">1x</span>
                      <span className="text-base font-medium">
                        $
                        {item.price.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Summary */}
          <div className="col-span-5">
            <div className="space-y-6">
              <h2 className="text-xl font-medium">Total a pagar</h2>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>
                    $
                    {cartSummary.subtotal.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Envío</span>
                  <span>
                    $
                    {cartSummary.shipping.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Descuento</span>
                  <span className="text-gray-600">
                    $
                    {cartSummary.discount.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total estimado</span>
                    <div className="text-right">
                      <span className="text-sm text-gray-500">MXN</span>
                      <span className="ml-2 text-xl font-bold">
                        $
                        {cartSummary.total.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <button className="w-full bg-black text-white py-3 rounded-lg font-medium">
                Pagar
              </button>
            </div>
          </div>
        </div>
        <div className="mt-12">
          <h3 className="text-lg font-medium mb-6">
            También podría interesarte
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="aspect-square bg-gray-100 rounded-lg"
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
