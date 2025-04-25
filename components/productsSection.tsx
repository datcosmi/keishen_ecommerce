"use client";
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Heart,
  Eye,
  Filter,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "./ui/card";
import { ProductData, ProductDetail } from "@/types/productTypes";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface ProductsSectionProps {
  allProducts?: ProductData[];
}

const IMAGES_BASE_URL =
  process.env.NEXT_PUBLIC_IMAGES_URL || "https://keishen.com.mx";

const ProductsSection: React.FC<ProductsSectionProps> = ({ allProducts }) => {
  const [displayProducts, setDisplayProducts] = useState<ProductData[]>([]);
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const productsPerPage = 8;

  // Get all unique categories
  const categories = allProducts
    ? ["all", ...new Set(allProducts.map((product) => product.category))]
    : ["all"];

  // Filter products by category and pagination
  useEffect(() => {
    if (allProducts && allProducts.length > 0) {
      let filtered = [...allProducts];

      // Apply category filter if not "all"
      if (selectedCategory !== "all") {
        filtered = filtered.filter(
          (product) => product.category === selectedCategory
        );
      }

      // Limit to 24 products max to avoid performance issues
      filtered = filtered.slice(0, 24);

      setDisplayProducts(filtered);
      setCurrentPage(1); // Reset to first page when filter changes
    }
  }, [allProducts, selectedCategory]);

  // Pagination
  const totalProducts = displayProducts.length;
  const totalPages = Math.ceil(totalProducts / productsPerPage);
  const currentProducts = displayProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const formatPrice = (price: number) => {
    return `$${price.toLocaleString("es-MX")}`;
  };

  // Helper function to get active discount percentage
  const getDiscountPercentage = (product: ProductData): number => {
    if (!product) return 0;

    const now = new Date();
    let maxDiscount = 0;

    // Check product discounts
    if (product.discount_product && product.discount_product.length > 0) {
      product.discount_product.forEach((discount) => {
        const startDate = new Date(discount.start_date_discount);
        const endDate = new Date(discount.end_date_discount);

        if (
          now >= startDate &&
          now <= endDate &&
          discount.percent_discount > maxDiscount
        ) {
          maxDiscount = discount.percent_discount;
        }
      });
    }

    // Check category discounts
    if (product.discount_category && product.discount_category.length > 0) {
      product.discount_category.forEach((discount) => {
        const startDate = new Date(discount.start_date_discount);
        const endDate = new Date(discount.end_date_discount);

        if (
          now >= startDate &&
          now <= endDate &&
          discount.percent_discount > maxDiscount
        ) {
          maxDiscount = discount.percent_discount;
        }
      });
    }

    return maxDiscount;
  };

  // Helper function to get discounted price
  const getDiscountedPrice = (
    product: ProductData
  ): { price: number; originalPrice?: number } => {
    const discountPercentage = getDiscountPercentage(product);

    if (discountPercentage > 0) {
      return {
        originalPrice: product.price,
        price: product.price * (1 - discountPercentage / 100),
      };
    }

    return { price: product.price };
  };

  // Get unique colors from product details
  const getProductColors = (details: ProductDetail[] | undefined): string[] => {
    if (!details) return [];

    const colorDetails = details.filter(
      (detail) => detail.detail_name === "Color"
    );
    // Get unique color values
    return [...new Set(colorDetails.map((color) => color.detail_desc))];
  };

  // Get unique sizes from product details
  const getProductSizes = (details: ProductDetail[] | undefined): string[] => {
    if (!details) return [];

    const sizeDetails = details.filter(
      (detail) => detail.detail_name === "Talla"
    );
    // Sort sizes in a logical order: S, M, L, XL, etc.
    const sortOrder = { XS: 1, S: 2, M: 3, L: 4, XL: 5, XXL: 6 };

    return [...new Set(sizeDetails.map((size) => size.detail_desc))].sort(
      (a, b) => {
        return (
          (sortOrder[a as keyof typeof sortOrder] || 99) -
          (sortOrder[b as keyof typeof sortOrder] || 99)
        );
      }
    );
  };

  // Get unique materials from product details
  const getProductMaterials = (
    details: ProductDetail[] | undefined
  ): string[] => {
    if (!details) return [];

    const materialDetails = details.filter(
      (detail) => detail.detail_name === "Material"
    );
    return [
      ...new Set(materialDetails.map((material) => material.detail_desc)),
    ];
  };

  // Truncate description with ellipsis
  const truncateDescription = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const renderProductCard = (product: ProductData) => {
    const discountPercentage = getDiscountPercentage(product);
    const priceData = getDiscountedPrice(product);
    const isHovered = hoveredProduct === product.id_product;

    // Get all product images
    const productImages = product.product_images || [];
    const defaultImage = "/images/placeholder.png";

    // Use the first image as main image, or default if none exist
    const mainImageUrl =
      productImages.length > 0
        ? `${IMAGES_BASE_URL}${productImages[0].image_url}`
        : defaultImage;

    // Get product details
    const colors = getProductColors(product.product_details);
    const sizes = getProductSizes(product.product_details);
    const materials = getProductMaterials(product.product_details);

    return (
      <motion.div
        className="group h-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        onMouseEnter={() => setHoveredProduct(product.id_product)}
        onMouseLeave={() => setHoveredProduct(null)}
      >
        <Card className="h-full border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg relative group">
          <div className="relative aspect-square bg-gray-50 overflow-hidden">
            <Image
              src={mainImageUrl}
              alt={product.product_name}
              fill
              unoptimized
              priority
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />

            {/* Sale badge if discount exists */}
            {discountPercentage > 0 && (
              <div className="absolute top-0 left-0 bg-red-500 text-white py-1 px-2 m-2 rounded-md">
                <span className="font-bold text-sm">
                  {discountPercentage}% OFF
                </span>
              </div>
            )}

            {/* Quick action buttons */}
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-3 transform translate-y-full transition-transform duration-300 group-hover:translate-y-0 flex justify-between items-center">
              <Link href={`/productos/${product.id_product}`}>
                <Button
                  variant="secondary"
                  size="sm"
                  className="rounded-full bg-white hover:bg-yellow-300 text-black"
                >
                  <Eye className="w-4 h-4 mr-1" /> Ver Detalles
                </Button>
              </Link>
            </div>
          </div>

          <CardContent className="p-4">
            {/* Category */}
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">
              {product.category}
            </p>

            {/* Product name */}
            <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1">
              {product.product_name}
            </h3>

            {/* Price info */}
            <div className="flex items-center mb-2">
              {priceData.originalPrice ? (
                <>
                  <span className="text-lg font-bold text-red-600 mr-2">
                    {formatPrice(priceData.price)}
                  </span>
                  <span className="text-sm text-gray-500 line-through">
                    {formatPrice(priceData.originalPrice)}
                  </span>
                </>
              ) : (
                <span className="text-lg font-bold text-gray-900">
                  {formatPrice(priceData.price)}
                </span>
              )}
            </div>

            {/* Short description */}
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {truncateDescription(product.description, 100)}
            </p>

            {/* Product details section - expanded on hover */}
            <div
              className={`transition-all duration-300 ${isHovered ? "opacity-100 max-h-60" : "opacity-0 max-h-0"} overflow-hidden`}
            >
              <div className="pt-3 border-t border-gray-200">
                {/* Colors */}
                {colors.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-gray-700 mb-1">
                      Colores:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {colors.map((color, index) => (
                        <div
                          key={`color-${product.id_product}-${index}`}
                          className="w-6 h-6 rounded-full border border-gray-300 shadow-sm"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Sizes */}
                {sizes.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-gray-700 mb-1">
                      Tallas:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {sizes.map((size, index) => (
                        <span
                          key={`size-${product.id_product}-${index}`}
                          className="text-xs border border-gray-300 rounded px-2 py-1 bg-gray-50 hover:bg-gray-100"
                        >
                          {size}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Materials */}
                {materials.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-gray-700 mb-1">
                      Material:
                    </p>
                    <p className="text-xs text-gray-600">
                      {materials.join(", ")}
                    </p>
                  </div>
                )}

                {/* Stock status */}
                <div className="flex items-center mt-2">
                  <div
                    className={`w-2 h-2 rounded-full mr-2 ${product.stock > 5 ? "bg-green-500" : "bg-orange-500"}`}
                  ></div>
                  <span
                    className={`text-xs font-medium ${product.stock > 5 ? "text-green-600" : "text-orange-500"}`}
                  >
                    {product.stock > 5
                      ? "En stock"
                      : `¡Solo quedan ${product.stock}!`}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <section className="py-16 px-4 md:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-black">VISTE CON ESTILO</h2>
            <p className="text-gray-500 mt-2">
              Descubre nuestra colección de moda y accesorios
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* View mode buttons */}
            <div className="flex bg-gray-100 rounded-lg">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-l-lg ${viewMode === "grid" ? "bg-yellow-300" : "bg-gray-100"}`}
                aria-label="Grid view"
              >
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
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                </svg>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-r-lg ${viewMode === "list" ? "bg-yellow-300" : "bg-gray-100"}`}
                aria-label="List view"
              >
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
                  <line x1="8" y1="6" x2="21" y2="6"></line>
                  <line x1="8" y1="12" x2="21" y2="12"></line>
                  <line x1="8" y1="18" x2="21" y2="18"></line>
                  <line x1="3" y1="6" x2="3.01" y2="6"></line>
                  <line x1="3" y1="12" x2="3.01" y2="12"></line>
                  <line x1="3" y1="18" x2="3.01" y2="18"></line>
                </svg>
              </button>
            </div>

            <p className="text-gray-500 text-sm hidden md:block">
              Mostrando {currentProducts.length} de {totalProducts} productos
            </p>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-8 overflow-x-auto">
          <Tabs>
            <TabsList className="bg-gray-100 p-1 rounded-lg flex-wrap">
              {categories.map((category) => (
                <TabsTrigger
                  key={category}
                  value={category}
                  className={`px-4 py-2 text-sm rounded-md transition-colors ${selectedCategory === category ? "bg-yellow-300 text-black" : "text-gray-700"}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category === "all" ? "Todos" : category}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Products grid */}
        {displayProducts.length > 0 ? (
          <>
            <div
              className={`grid ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "grid-cols-1"} gap-6`}
            >
              {currentProducts.map((product) => (
                <div key={`product-${product.id_product}`} className="h-full">
                  {renderProductCard(product)}
                </div>
              ))}
            </div>

            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center items-center gap-2">
                <Button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  variant="outline"
                  size="sm"
                  className="rounded-full border-gray-300"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }).map((_, index) => (
                    <Button
                      key={`page-${index + 1}`}
                      onClick={() => goToPage(index + 1)}
                      variant={
                        currentPage === index + 1 ? "default" : "outline"
                      }
                      size="sm"
                      className={`w-8 h-8 p-0 ${currentPage === index + 1 ? "bg-yellow-300 text-black hover:bg-yellow-400 border-none" : "border-gray-300"}`}
                    >
                      {index + 1}
                    </Button>
                  ))}
                </div>

                <Button
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  size="sm"
                  className="rounded-full border-gray-300"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 bg-gray-50 rounded-lg">
            <div className="flex flex-col items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-400 mb-4"
              >
                <path d="M20.91 8.84 8.56 2.23a1.93 1.93 0 0 0-1.81 0L3.1 4.13a2.12 2.12 0 0 0-.05 3.69l12.22 6.93a2 2 0 0 0 1.94 0L21 12.51a2.12 2.12 0 0 0-.09-3.67Z"></path>
                <path d="m3.09 8.84 12.35-6.61a1.93 1.93 0 0 1 1.81 0l3.65 1.9a2.12 2.12 0 0 1 .1 3.69L8.73 14.75a2 2 0 0 1-1.94 0L3 12.51a2.12 2.12 0 0 1 .09-3.67Z"></path>
                <line x1="12" y1="22" x2="12" y2="13"></line>
                <path d="M20 13.5v3.37a2.06 2.06 0 0 1-1.11 1.83l-6 3.08a1.93 1.93 0 0 1-1.78 0l-6-3.08A2.06 2.06 0 0 1 4 16.87V13.5"></path>
              </svg>
              <h3 className="text-xl font-medium mb-2">
                No hay productos en existencia
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Intenta consultar más tarde o contacta con nosotros para más
                información.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductsSection;
