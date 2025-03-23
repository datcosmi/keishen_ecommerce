"use client";
import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "./ui/card";
import { Category } from "@/types/categoryTypes";
import { DisplayProduct } from "@/types/productTypes";
import { Badge } from "./ui/badge";

interface CategoriesShowcaseSectionProps {
  allProducts?: DisplayProduct[];
  categoriesData: Category[];
}

const CategoriesShowcaseSection: React.FC<CategoriesShowcaseSectionProps> = ({
  allProducts,
  categoriesData,
}) => {
  const [displayProducts, setDisplayProducts] = useState<DisplayProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    if (allProducts && allProducts.length > 0) {
      setDisplayProducts(allProducts);
    }
    if (categoriesData && categoriesData.length > 0) {
      setCategories(categoriesData);
    }
  }, [allProducts, categoriesData]);

  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      // Set the first category as selected by default when categories load
      setSelectedCategory(categories[0]?.id_cat.toString() || "");
    }
  }, [categories, selectedCategory]);

  const formatPrice = (price: number) => {
    return `$${price.toLocaleString("es-MX")}`;
  };

  // Calculate the current discount (if any) for a product
  const calculateDiscount = (product: DisplayProduct) => {
    const now = new Date();

    // First check product-specific discounts
    if (product.discountPercentage && product.endDate) {
      const endDate = new Date(product.endDate);
      if (now <= endDate) {
        return {
          hasDiscount: true,
          percentage: product.discountPercentage,
          originalPrice: product.originalPrice,
          discountedPrice: product.price,
        };
      }
    }

    return {
      hasDiscount: false,
      percentage: 0,
      originalPrice: null,
      discountedPrice: product.price,
    };
  };

  return (
    <section className="py-16 px-8 bg-gray-100 relative z-30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-black mb-4">
            CATEGORÍAS DE MODA
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Descubre nuestras colecciones y encuentra tu estilo único entre
            nuestras diferentes categorías.
          </p>
        </div>

        {/* Category Layout - Left image, Right categories */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left Side - Category Image */}
            <div className="md:w-1/2 lg:w-2/5">
              {selectedCategory &&
                categories
                  .filter((cat) => cat.id_cat.toString() === selectedCategory)
                  .map((category) => (
                    <div
                      key={category.id_cat}
                      className="bg-gray-100 rounded-lg overflow-hidden h-full"
                    >
                      <div className="relative aspect-[3/4] rounded-lg overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-50"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-9xl text-gray-300">
                            {category.name === "Camisas" && "👕"}
                            {category.name === "Pantalones" && "👖"}
                            {category.name === "Gorras" && "🧢"}
                            {category.name === "Joyeria" && "💍"}
                            {category.name === "Otros" && "🛍️"}
                          </div>
                        </div>
                        <div className="absolute bottom-0 left-0 p-6">
                          <h3 className="text-3xl font-bold text-white mb-2">
                            {category.name.toUpperCase()}
                          </h3>
                          <p className="text-gray-200 mb-4">
                            Descubre nuestra colección de{" "}
                            {category.name.toLowerCase()} diseñados con los
                            mejores materiales y última tendencia.
                          </p>
                          <Button
                            className="bg-yellow-300 text-black hover:bg-yellow-400 rounded-full"
                            size="lg"
                            asChild
                          >
                            <Link
                              href={`/categoria/${category.id_cat}`}
                              className="flex items-center gap-2"
                            >
                              <span>Explorar {category.name}</span>
                              <ChevronRight className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
            </div>

            {/* Right Side - Category Buttons */}
            <div className="md:w-1/2 lg:w-3/5">
              <div className="flex flex-col gap-4 h-full justify-center">
                {categories.map((category) => (
                  <button
                    key={category.id_cat}
                    onClick={() =>
                      setSelectedCategory(category.id_cat.toString())
                    }
                    className={`relative overflow-hidden rounded-lg transition-all duration-300 text-left ${
                      selectedCategory === category.id_cat.toString()
                        ? "bg-yellow-300 text-black"
                        : "bg-black text-white hover:bg-gray-800"
                    }`}
                  >
                    <div className="px-6 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-10 h-10 rounded-full ${
                            selectedCategory === category.id_cat.toString()
                              ? "bg-black text-yellow-300"
                              : "bg-yellow-300 text-black"
                          } flex items-center justify-center transition-colors duration-300`}
                        >
                          {category.name === "Camisas" && (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
                            </svg>
                          )}
                          {category.name === "Pantalones" && (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M5.5 5H19a2 2 0 0 1 1.6 3.2L8.7 22H6l-4-7.5" />
                              <path d="M5.5 5C4.6 5 4 5.8 4 6.5V11h2" />
                            </svg>
                          )}
                          {category.name === "Gorras" && (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <circle cx="12" cy="9" r="7" />
                              <path d="M19 19.5c.4.6.8 1.2 1 2" />
                              <path d="M5 19.5a17.9 17.9 0 0 1 1 2" />
                              <path d="M12 19c0 1.1.9 3 3 4" />
                              <path d="M12 19c0 1.1-.9 3-3 4" />
                            </svg>
                          )}
                          {category.name === "Joyeria" && (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" />
                              <path d="M6 12h12" />
                              <path d="M12 18V6" />
                            </svg>
                          )}
                          {category.name === "Otros" && (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <circle cx="12" cy="12" r="10" />
                              <path d="M12 16v-4" />
                              <path d="M12 8h.01" />
                            </svg>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold">
                          {category.name.toUpperCase()}
                        </h3>
                      </div>

                      {selectedCategory === category.id_cat.toString() && (
                        <ChevronRight className="h-5 w-5" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Products Section Below */}
        {selectedCategory && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            {categories
              .filter((cat) => cat.id_cat.toString() === selectedCategory)
              .map((category) => (
                <div key={category.id_cat}>
                  {/* Featured Products Header */}
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-xl font-semibold">
                      Productos destacados
                    </h4>
                    <Button
                      variant="ghost"
                      className="text-gray-600 hover:text-black"
                      asChild
                    >
                      <Link
                        href={`/categoria/${category.id_cat}`}
                        className="flex items-center gap-1"
                      >
                        <span>Ver todos</span>
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>

                  {/* Products Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {displayProducts
                      .filter((product) => product.category === category.name)
                      .slice(0, 4)
                      .map((product) => {
                        const {
                          hasDiscount,
                          percentage,
                          originalPrice,
                          discountedPrice,
                        } = calculateDiscount(product);

                        return (
                          <Link
                            key={product.id}
                            href={`/productos/${product.id}`}
                            className="block"
                          >
                            <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg group">
                              <CardContent className="p-0">
                                <div className="relative aspect-square bg-gray-50">
                                  <Image
                                    src={
                                      product.images.length > 0
                                        ? product.images[0]
                                        : "/images/placeholder.png"
                                    }
                                    alt={product.name}
                                    fill
                                    priority
                                    className="object-cover p-4 transition-transform duration-300 hover:scale-105"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                  />

                                  {hasDiscount && (
                                    <div className="absolute top-3 right-3 z-10">
                                      <Badge className="bg-red-600 text-white">
                                        {percentage}% OFF
                                      </Badge>
                                    </div>
                                  )}
                                </div>
                                <div className="p-3">
                                  <h3 className="text-base font-semibold mb-1 line-clamp-1">
                                    {product.name}
                                  </h3>
                                  <div className="flex justify-between items-center">
                                    <div>
                                      {hasDiscount && originalPrice ? (
                                        <>
                                          <span className="text-base font-bold text-red-600 block">
                                            {formatPrice(discountedPrice)}
                                          </span>
                                          <span className="text-xs text-gray-500 line-through">
                                            {formatPrice(originalPrice)}
                                          </span>
                                        </>
                                      ) : (
                                        <span className="text-base font-bold">
                                          {formatPrice(product.price)}
                                        </span>
                                      )}
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="rounded-full p-0 w-8 h-8"
                                    >
                                      <ChevronRight className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </Link>
                        );
                      })}
                  </div>

                  {displayProducts.filter(
                    (product) => product.category === category.name
                  ).length === 0 && (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                      <h3 className="text-lg font-medium mb-2">
                        No hay productos disponibles
                      </h3>
                      <p className="text-gray-500">
                        No hemos encontrado productos en esta categoría. Por
                        favor, intenta más tarde.
                      </p>
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default CategoriesShowcaseSection;
