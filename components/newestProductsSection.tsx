"use client";
import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "./ui/card";
import { Product } from "@/types/indexTypes";
import { Badge } from "./ui/badge";

interface NewestProductsSectionProps {
  allProductsData?: Product[];
  newestProductsData?: Product[];
}

const NewestProductsSection: React.FC<NewestProductsSectionProps> = ({
  allProductsData,
  newestProductsData,
}) => {
  const [newestProducts, setNewestProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (newestProductsData && newestProductsData.length > 0) {
      setNewestProducts(newestProductsData);
    }
  }, [allProductsData, newestProductsData]);

  const formatPrice = (price: number) => {
    return `$${price.toLocaleString("es-MX")}`;
  };

  return (
    <section className="py-16 px-8 bg-white relative z-30">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <Badge variant="outline" className="bg-blue-100 text-blue-600 mb-3">
              Recién llegados
            </Badge>
            <h2 className="text-3xl font-bold text-black">NUEVOS PRODUCTOS</h2>
          </div>
          <Button variant="outline" className="rounded-full" asChild>
            <Link href="/nuevos" className="flex items-center gap-2">
              <span>Ver todos los nuevos</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {newestProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {newestProducts.slice(0, 8).map((product) => (
              <Link
                key={product.id}
                href={`/productos/${product.id}`}
                className="block"
              >
                <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg h-full">
                  <CardContent className="p-0">
                    <div className="relative aspect-square bg-gray-50">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover p-4 transition-transform duration-300 hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />

                      <div className="absolute top-4 left-4 z-10">
                        <Badge className="bg-blue-600 text-white">Nuevo</Badge>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-sm text-gray-600 mb-1">
                        {product.brand}
                      </p>
                      <h3 className="text-lg font-semibold mb-2">
                        {product.name}
                      </h3>
                      <span className="text-lg font-bold">
                        {formatPrice(product.price)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm">
            <h3 className="text-xl font-medium mb-2">
              No hay productos nuevos disponibles
            </h3>
            <p className="text-gray-500 mb-4">
              Vuelve pronto para descubrir nuestras novedades.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default NewestProductsSection;
