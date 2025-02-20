"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { TrashIcon, PlusIcon } from "@heroicons/react/24/outline";
import NavbarWhite from "../components/navbarWhite";

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
      type: "Joyeria",
      name: "Reloj para hombre",
      variant: "Negro / Acero",
      price: 3500.0,
      quantity: 1,
      image: "/images/reloj-hombre.png",
    },
    {
      id: 2,
      type: "Joyeria",
      name: "Pulsera de plata",
      variant: "Negro",
      price: 1200.0,
      quantity: 1,
      image: "/images/pulsera-plata.png",
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

  return (
    <div className="min-h-screen bg-white">
      <NavbarWhite />

      <main className="max-w-7xl mx-auto px-8 py-12">
        <h1 className="text-3xl font-medium text-gray-800 mb-12">
          Carrito de compras
        </h1>

        <div className="grid grid-cols-3 gap-16">
          {/* Productos del carrito */}
          <div className="col-span-2 space-y-8">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex items-start space-x-6 bg-white p-4"
              >
                <button className="text-gray-400 hover:text-gray-600 mt-12">
                  <TrashIcon className="h-5 w-5" />
                </button>

                <div className="w-32 h-32 bg-gray-100 rounded-lg relative flex-shrink-0">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>

                <div className="flex-1 space-y-1">
                  <p className="text-sm text-gray-500">{item.type}</p>
                  <h3 className="text-lg font-medium text-gray-900">
                    {item.name}
                  </h3>
                  <p className="text-sm text-gray-500">{item.variant}</p>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center border rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.id, false)}
                          className="px-3 py-1 text-gray-500 hover:text-gray-700"
                        >
                          -
                        </button>
                        <span className="px-3 py-1">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, true)}
                          className="px-3 py-1 text-gray-500 hover:text-gray-700"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <span className="text-lg font-medium">
                      <span className="text-sm text-gray-500 mr-2">1x</span>$
                      {item.price.toLocaleString("es-MX", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Resumen de la compra */}
          <div className="col-span-1">
            <div className="bg-white p-6 space-y-6">
              <h2 className="text-xl font-medium text-gray-900">
                Total a pagar
              </h2>

              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">
                    $
                    {cartSummary.subtotal.toLocaleString("es-MX", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Envío</span>
                  <span className="font-medium">
                    $
                    {cartSummary.shipping.toLocaleString("es-MX", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Descuento</span>
                  <span className="font-medium text-gray-600">
                    $
                    {cartSummary.discount.toLocaleString("es-MX", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-medium">
                      Total estimado
                    </span>
                    <div className="text-right">
                      <span className="text-sm text-gray-500">MXN</span>
                      <span className="ml-2 text-xl font-bold">
                        $
                        {cartSummary.total.toLocaleString("es-MX", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <button className="w-full bg-black text-white py-4 rounded-xl font-medium hover:bg-gray-900 transition-colors">
                Pagar
              </button>
            </div>
          </div>
        </div>

        <div className="mt-16">
          <h3 className="text-xl font-medium text-gray-800 mb-8">
            También podría interesarte
          </h3>
          <div className="grid grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="aspect-square bg-gray-100 rounded-lg shadow-sm"
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
