"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";
import NavbarWhite from "@/app/components/navbarWhite";

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

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const router = useRouter();

  useEffect(() => {
    if (id) {
      fetch(`/api/products/${id}`)
        .then((res) => res.json())
        .then((data) => setProduct(data))
        .catch((err) => console.error(err));
    }
  }, [id]);

  if (!product) return <p>Cargando...</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      <NavbarWhite />

      <div className="fixed top-0 w-full bg-white shadow-sm z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <MagnifyingGlassIcon className="h-6 w-6 text-gray-500" />
          <div className="relative">
            <ShoppingBagIcon className="h-6 w-6 text-gray-500" />
            <span className="absolute -top-2 -right-2 bg-yellow-400 text-xs w-5 h-5 flex items-center justify-center rounded-full">
              3
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pt-20">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1 relative bg-gray-100 rounded-lg">
            <ChevronLeftIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-8 w-8 text-gray-400" />
            <ChevronRightIcon className="absolute right-4 top-1/2 -translate-y-1/2 h-8 w-8 text-gray-400" />
            <Image
              src={product.image}
              alt={product.name}
              width={500}
              height={500}
              className="mx-auto p-8"
            />
          </div>

          <div className="flex-1 space-y-6">
            <Link
              href="/"
              className="inline-flex items-center text-yellow-400 hover:text-yellow-500"
            >
              <ChevronLeftIcon className="h-5 w-5 mr-1" />
              Regresar a la tienda
            </Link>

            <div>
              <h1 className="text-2xl font-semibold mb-2">{product.name}</h1>
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  <StarIcon className="h-5 w-5 text-yellow-400" />
                  <StarIcon className="h-5 w-5 text-yellow-400" />
                  <StarIcon className="h-5 w-5 text-yellow-400" />
                  <StarIcon className="h-5 w-5 text-yellow-400" />
                  <StarIcon className="h-5 w-5 text-gray-300" />
                </div>
                <span className="text-gray-500 text-sm">
                  {product.rating} ({product.reviews} calificaciones)
                </span>
              </div>
            </div>

            <div>
              <p className="mb-2">Marca: {product.brand}</p>
              <p className="text-gray-600">{product.description}</p>
            </div>

            <div>
              <h3 className="font-medium mb-3">Talla</h3>
              <div className="flex gap-2">
                {["XL", "L", "M", "S"].map((size) => (
                  <button
                    key={size}
                    className={`w-12 h-12 rounded-full border ${
                      size === "XL"
                        ? "bg-black text-white"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-3">Color</h3>
              <div className="flex gap-3">
                {["#000000", "#FFE600", "#00FF66", "#FF0000"].map((color) => (
                  <button
                    key={color}
                    className={`w-8 h-8 rounded-full border-2 ${
                      color === "#000000"
                        ? "border-yellow-400"
                        : "border-transparent"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-3">Correa</h3>
              <div className="flex gap-2">
                {["Acero inoxidable", "Cuero", "Silicona"].map((strap) => (
                  <button
                    key={strap}
                    className={`px-4 py-2 rounded-full border ${
                      strap === "Cuero"
                        ? "bg-black text-white"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {strap}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-6">
              <h3 className="font-medium mb-3">Descripción detallada</h3>
            </div>

            <div className="fixed bottom-0 left-0 w-full bg-white border-t md:relative md:border-t-0">
              <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    className="w-8 h-8 border rounded-lg flex items-center justify-center"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </button>
                  <span>{quantity}</span>
                  <button
                    className="w-8 h-8 border rounded-lg flex items-center justify-center"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </button>
                  <span className="text-xl font-bold">
                    ${(3500).toLocaleString()}
                  </span>
                </div>
                <button className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800">
                  Añadir al carrito
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
