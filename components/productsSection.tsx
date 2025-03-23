"use client";
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "./ui/card";
import { DisplayProduct } from "@/types/productTypes";
import { Badge } from "./ui/badge";

interface ProductsSectionProps {
  allProducts?: DisplayProduct[];
}

const ProductsSection: React.FC<ProductsSectionProps> = ({ allProducts }) => {
  const [displayProducts, setDisplayProducts] = useState<DisplayProduct[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const productsPerPage = 3;

  const totalPages = Math.ceil(
    (displayProducts?.length || 0) / productsPerPage
  );

  useEffect(() => {
    if (allProducts && allProducts.length > 0) {
      setDisplayProducts(allProducts);
    }
  }, [allProducts]);

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

  const formatPrice = (price: number) => {
    return `$${price.toLocaleString("es-MX")}`;
  };

  const renderProductCard = (product: DisplayProduct) => (
    <Link href={`/productos/${product.id}`} className="block h-full">
      <Card className="overflow-hidden h-full transition-all duration-300 hover:shadow-md">
        <CardContent className="p-0">
          <div className="relative aspect-square bg-gray-100">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover p-4 transition-transform duration-300 hover:scale-105"
              sizes="(max-width: 768px) 100vw, 50vw"
            />

            {product.discountPercentage && product.discountPercentage > 0 && (
              <div className="absolute top-4 right-4 z-10">
                <Badge className="bg-red-600 text-white">
                  {product.discountPercentage}% OFF
                </Badge>
              </div>
            )}
          </div>
          <div className="p-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{product.category}</p>
                <h3 className="text-base font-semibold">{product.name}</h3>
              </div>
              <div className="text-right">
                {product.originalPrice ? (
                  <>
                    <span className="text-base font-bold text-red-600 block">
                      {formatPrice(product.price)}
                    </span>
                    <span className="text-sm text-gray-500 line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                  </>
                ) : (
                  <span className="text-base font-bold">
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>
            </div>
            {product.details && product.details.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-gray-500">
                  {product.details.length > 0 &&
                    product.details.find((d) => d.detail_name === "Material")
                      ?.detail_desc}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );

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
          <div className="relative">
            <Button
              onClick={prevPage}
              disabled={currentPage === 0}
              variant="outline"
              size="icon"
              className="absolute left-[-60px] top-1/2 -translate-y-1/2 bg-white/80 rounded-full shadow-lg disabled:opacity-0 z-10"
            >
              <ChevronLeft className="h-6 w-6 text-gray-500" />
            </Button>

            {/* Products carousel */}
            <div className="overflow-hidden">
              <div className="w-full relative">
                <motion.div
                  className="flex flex-nowrap"
                  animate={{ x: `-${currentPage * 100}%` }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                >
                  {/* Divide products into pages */}
                  {Array.from({ length: totalPages }).map((_, pageIndex) => {
                    // Get products for this page
                    const pageProducts = displayProducts.slice(
                      pageIndex * productsPerPage,
                      (pageIndex + 1) * productsPerPage
                    );

                    return (
                      <div
                        key={`page-${pageIndex}`}
                        className="flex flex-nowrap min-w-full"
                      >
                        {pageProducts.map((product, i) => (
                          <div
                            key={`product-${product.id}`}
                            className="w-1/3 px-4 flex-shrink-0"
                          >
                            {renderProductCard(product)}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </motion.div>
              </div>
            </div>

            <Button
              onClick={nextPage}
              disabled={currentPage === totalPages - 1}
              variant="outline"
              size="icon"
              className="absolute right-[-60px] top-1/2 -translate-y-1/2 bg-white/80 rounded-full shadow-lg disabled:opacity-0 z-10"
            >
              <ChevronRight className="h-6 w-6 text-gray-500" />
            </Button>

            {/* Pagination indicators */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6 gap-2">
                {Array.from({ length: totalPages }).map((_, index) => (
                  <button
                    key={`indicator-${index}`}
                    onClick={() => setCurrentPage(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      currentPage === index ? "bg-gray-800 w-4" : "bg-gray-300"
                    }`}
                    aria-label={`Go to page ${index + 1}`}
                  />
                ))}
              </div>
            )}
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
