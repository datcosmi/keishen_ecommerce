"use client";

import { useState, useEffect } from "react";
import {
  ChevronDownIcon,
  AdjustmentsHorizontalIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import NavbarWhite from "../components/navbarWhite";
import Link from "next/link";
import Footer from "../components/footer";

interface Product {
  id: string;
  name: string;
  brand: string;
  description: string;
  price: number;
  rating: number;
  reviews: number;
  sizes: string[];
  colors: string[];
  straps: string[];
  image: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch("/api/products");
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const [filters, setFilters] = useState({
    showFilters: true,
    categories: {
      relojes: true,
      ropa: false,
      accesorios: false,
      calzado: false,
    },
    memberPromotion: false,
    onSale: false,
  });

  const [showCollectionFilter, setShowCollectionFilter] = useState(true);
  const [showPriceFilter, setShowPriceFilter] = useState(true);

  const formatPrice = (price: number) => {
    return `$${price.toLocaleString("es-MX")}`;
  };

  return (
    <div className="min-h-screen bg-white">
      <NavbarWhite />
      <div>
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-medium">
              Artículos para Hombre ({products.length})
            </h1>

            <div className="flex items-center gap-4">
              <button
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    showFilters: !prev.showFilters,
                  }))
                }
                className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2" />
                {filters.showFilters ? "Ocultar filtros" : "Mostrar filtros"}
              </button>

              <div className="flex items-center border rounded-lg px-4 py-2">
                <span className="text-sm text-gray-600 mr-2">Ordenar por</span>
                <select className="text-sm font-medium bg-transparent">
                  <option>Lo más nuevo</option>
                  <option>Precio: menor a mayor</option>
                  <option>Precio: mayor a menor</option>
                  <option>Más vendidos</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex gap-8">
            {/* Filtros */}
            {filters.showFilters && (
              <div className="w-72 flex-shrink-0">
                <div className="sticky top-[140px] h-[calc(100vh-180px)] overflow-y-auto pr-4">
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Categorías</h3>
                      <ul className="space-y-3">
                        <li>
                          <button className="text-gray-800 hover:text-gray-900 font-medium">
                            Joyería
                          </button>
                        </li>
                        <li>
                          <button className="text-gray-600 hover:text-gray-900">
                            Camisas
                          </button>
                        </li>
                        <li>
                          <button className="text-gray-600 hover:text-gray-900">
                            Pantalones
                          </button>
                        </li>
                        <li>
                          <button className="text-gray-600 hover:text-gray-900">
                            Gorras
                          </button>
                        </li>
                        <li>
                          <button className="text-gray-600 hover:text-gray-900">
                            Otros
                          </button>
                        </li>
                      </ul>
                    </div>

                    <div className="border-t pt-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium">Precio</h3>
                        <button
                          onClick={() => setShowPriceFilter(!showPriceFilter)}
                        >
                          {showPriceFilter ? (
                            <ChevronUpIcon className="h-5 w-5" />
                          ) : (
                            <ChevronDownIcon className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                      {showPriceFilter && (
                        <div className="space-y-3">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              className="form-checkbox h-4 w-4"
                            />
                            <span className="ml-3 text-gray-600">
                              $0 - $2,000
                            </span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              className="form-checkbox h-4 w-4"
                            />
                            <span className="ml-3 text-gray-600">
                              $2,000 - $5,000
                            </span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              className="form-checkbox h-4 w-4"
                            />
                            <span className="ml-3 text-gray-600">$5,000+</span>
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Grid de Productos */}
            <div className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <Link
                    key={product.id}
                    href={`/producto/${product.id}`}
                    className="bg-gray-50 rounded-lg overflow-hidden group"
                  >
                    <div className="relative aspect-square bg-gray-100">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover p-6 group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-bold mt-1">{product.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {product.brand}
                      </p>
                      <p className="text-sm text-gray-500">
                        {product.colors.length}{" "}
                        {product.colors.length === 1 ? "color" : "colores"}
                      </p>
                      <div className="mt-2">
                        <span className="text-lg font-bold">
                          {formatPrice(product.price)}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
