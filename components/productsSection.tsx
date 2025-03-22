"use client";
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Badge, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "./ui/card";
import {
  Product,
  ProductDiscount,
  CategoryDiscount,
} from "@/app/types/indexTypes";

interface ProductsSectionProps {
  allProducts?: Product[];
  newestProducts?: Product[];
}

const ProductsSection: React.FC<ProductsSectionProps> = ({
  allProducts,
  newestProducts,
}) => {
  const [displayProducts, setDisplayProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const productsPerPage = 3;
  const [productDiscounts, setProductDiscounts] = useState<ProductDiscount[]>(
    []
  );
  const [categoryDiscounts, setCategoryDiscounts] = useState<
    CategoryDiscount[]
  >([]);

  const totalPages = Math.ceil(displayProducts.length / productsPerPage);

  useEffect(() => {
    if (allProducts && allProducts.length > 0) {
      setDisplayProducts(allProducts);
    } else if (newestProducts && newestProducts.length > 0) {
      setDisplayProducts(newestProducts);
    }
  }, [allProducts, newestProducts]);

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  // Calcular productos a mostrar en la página actual
  const currentProducts = displayProducts.slice(
    currentPage * productsPerPage,
    (currentPage + 1) * productsPerPage
  );

  const formatPrice = (price: number) => {
    return `$${price.toLocaleString("es-MX")}`;
  };

  return (
    <section className="py-16 px-8 bg-white relative z-30">
      <div className="max-w-6xl mx-auto relative">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-black">VISTE CON ESTILO</h2>
          <p className="text-gray-500">
            Mostrando {displayProducts.length} productos en existencia
          </p>
        </div>

        {displayProducts.length > 0 ? (
          <div>
            <Button
              onClick={prevPage}
              disabled={currentPage === 0}
              variant="outline"
              size="icon"
              className="absolute left-[-60px] top-1/2 -translate-y-1/2 bg-white/80 rounded-full shadow-lg disabled:opacity-0"
            >
              <ChevronLeft className="h-6 w-6 text-gray-500" />
            </Button>

            {/* Carrusel de productos */}
            <div className="overflow-hidden w-full relative">
              <motion.div
                className="flex"
                animate={{ x: `-${currentPage * 100}%` }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                <div className="flex w-full">
                  {currentProducts.map((product) => {
                    // Calculate if product has an active discount
                    const productDiscount = productDiscounts.find(
                      (d) =>
                        d.productId === product.id &&
                        new Date() >= new Date(d.startDate) &&
                        new Date() <= new Date(d.endDate)
                    );

                    const categoryDiscount = categoryDiscounts.find(
                      (d) =>
                        d.categoryId === product.categoryId &&
                        new Date() >= new Date(d.startDate) &&
                        new Date() <= new Date(d.endDate)
                    );

                    // Apply discount if exists
                    let displayPrice = product.price;
                    let originalPrice = null;
                    let discountPercentage = 0;

                    if (productDiscount) {
                      originalPrice = product.price;
                      displayPrice =
                        product.price *
                        (1 - productDiscount.discountPercentage / 100);
                      discountPercentage = productDiscount.discountPercentage;
                    } else if (categoryDiscount) {
                      originalPrice = product.price;
                      displayPrice =
                        product.price *
                        (1 - categoryDiscount.discountPercentage / 100);
                      discountPercentage = categoryDiscount.discountPercentage;
                    }

                    return (
                      <div
                        key={product.id}
                        className="w-1/3 px-4"
                        style={{ flex: "0 0 33.333%" }}
                      >
                        <Link
                          href={`/productos/${product.id}`}
                          className="block h-full"
                        >
                          <Card className="overflow-hidden h-full transition-all duration-300 hover:shadow-md">
                            <CardContent className="p-0">
                              <div className="relative aspect-square bg-gray-100">
                                <Image
                                  src={product.image}
                                  alt={product.name}
                                  fill
                                  className="object-cover p-6 transition-transform duration-300 group-hover:scale-105"
                                />
                                {discountPercentage > 0 && (
                                  <div className="absolute top-4 right-4 z-10">
                                    <Badge className="bg-red-600 text-white">
                                      {discountPercentage}% OFF
                                    </Badge>
                                  </div>
                                )}
                              </div>
                              <div className="p-3">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <p className="text-sm text-gray-600 mb-1">
                                      {product.brand}
                                    </p>
                                    <h3 className="text-base font-semibold">
                                      {product.name}
                                    </h3>
                                  </div>
                                  <div className="text-right">
                                    {originalPrice ? (
                                      <>
                                        <span className="text-base font-bold text-red-600 block">
                                          {formatPrice(displayPrice)}
                                        </span>
                                        <span className="text-sm text-gray-500 line-through">
                                          {formatPrice(originalPrice)}
                                        </span>
                                      </>
                                    ) : (
                                      <span className="text-base font-bold">
                                        {formatPrice(displayPrice)}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                {product.colors && (
                                  <div className="mt-2 flex items-center justify-between">
                                    <p className="text-xs text-gray-500">
                                      {product.colors.length}{" "}
                                      {product.colors.length === 1
                                        ? "color"
                                        : "colores"}
                                    </p>
                                    <div className="flex gap-1">
                                      {product.colors
                                        .slice(0, 3)
                                        .map((color, index) => (
                                          <div
                                            key={index}
                                            className="h-3 w-3 rounded-full border border-gray-300"
                                            style={{ backgroundColor: color }}
                                          />
                                        ))}
                                      {product.colors.length > 3 && (
                                        <div className="text-xs text-gray-500">
                                          +{product.colors.length - 3}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </div>

            <Button
              onClick={nextPage}
              disabled={currentPage === totalPages - 1}
              variant="outline"
              size="icon"
              className="absolute right-[-60px] top-1/2 -translate-y-1/2 bg-white/80 rounded-full shadow-lg disabled:opacity-0"
            >
              <ChevronRight className="h-6 w-6 text-gray-500" />
            </Button>
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">
              No hay productos en existencia
            </h3>
            <p className="text-gray-500">
              Intenta consultar más tarde o contacta con nosotros para más
              información.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductsSection;
