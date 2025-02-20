"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
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
    <div className="min-h-screen bg-white flex flex-col">
      <NavbarWhite />
      <div className="flex flex-row h-screen">
        {/* Imagen */}
        <div className="w-1/2 h-full fixed top-0 left-0 bg-gray-100 flex items-center justify-center">
          <button className="absolute left-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-md">
            <ChevronLeftIcon className="h-6 w-6 text-gray-600" />
          </button>
          <button className="absolute right-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-md">
            <ChevronRightIcon className="h-6 w-6 text-gray-600" />
          </button>
          <Image
            src={product.image}
            alt={product.name}
            width={500}
            height={500}
            className="p-8"
          />
        </div>

        {/* Detalles del producto */}
        <div className="w-1/2 ml-auto min-h-screen p-8 relative">
          <Link
            href="/products"
            className="inline-flex items-center text-yellow-400 hover:text-yellow-500 mb-6"
          >
            <ChevronLeftIcon className="h-5 w-5 mr-1" />
            Ver todos los productos
          </Link>

          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>

          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <StarIcon
                  key={i}
                  className={`h-5 w-5 ${
                    i < product.rating ? "text-yellow-400" : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-gray-500">
              {product.rating.toFixed(1)} ({product.reviews} calificaciones)
            </span>
          </div>

          <div className="mb-6">
            <p className="mb-2 text-gray-700">Marca: {product.brand}</p>
            <p className="text-gray-600">{product.description}</p>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-3">Talla</h3>
              <div className="flex gap-3">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    className="w-14 h-10 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-3">Color</h3>
              <div className="flex gap-3">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    className="w-8 h-8 rounded-full border border-gray-200"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-3">Correa</h3>
              <div className="flex gap-3">
                {product.straps.map((strap) => (
                  <button
                    key={strap}
                    className="px-6 py-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    {strap}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Precio y botones */}
          <div className="fixed bottom-8 right-8 w-[calc(50%-4rem)] bg-white p-6 rounded-xl shadow-md">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-white rounded-lg border border-gray-300">
                  <button
                    className="px-4 py-2 text-gray-600"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </button>
                  <span className="px-4 font-medium">{quantity}</span>
                  <button
                    className="px-4 py-2 text-gray-600"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </button>
                </div>
                <span className="text-xl font-bold">
                  ${product.price.toLocaleString()}.00
                </span>
              </div>
              <button className="bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 font-medium">
                Añadir al carrito
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
