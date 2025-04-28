"use client";
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Award,
  Eye,
  ShoppingBag,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "./ui/card";
import { ProductData, ProductDetail } from "@/types/productTypes";
import { Badge } from "./ui/badge";

interface BestSellersSectionProps {
  bestSellers?: ProductData[];
}

const IMAGES_BASE_URL =
  process.env.NEXT_PUBLIC_IMAGES_URL || "https://keishen.com.mx";

const BestSellersSection: React.FC<BestSellersSectionProps> = ({
  bestSellers,
}) => {
  const [displayProducts, setDisplayProducts] = useState<ProductData[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // Adjust products per page based on screen size
  const getProductsPerPage = () => {
    if (isMobile) return 1; // Show 1 on mobile
    if (isTablet) return 2; // Show 2 on tablet
    return 4; // Show 4 on desktop
  };

  const productsPerPage = getProductsPerPage();

  const totalPages = Math.ceil(
    (displayProducts?.length || 0) / productsPerPage
  );

  // Handle window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
      setIsTablet(window.innerWidth >= 640 && window.innerWidth < 1024);
    };

    // Set initial values
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Clean up
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (bestSellers && bestSellers.length > 0) {
      setDisplayProducts(bestSellers);
    }
  }, [bestSellers]);

  // Reset current page when screen size changes to prevent empty pages
  useEffect(() => {
    setCurrentPage(0);
  }, [isMobile, isTablet]);

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
    // Get unique color values (may have duplicate color descriptions)
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
        // @ts-ignore
        return (sortOrder[a] || 99) - (sortOrder[b] || 99);
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

  const renderBestSellerCard = (product: ProductData, index: number) => {
    const discountPercentage = getDiscountPercentage(product);
    const priceData = getDiscountedPrice(product);
    const imageUrl =
      product.product_images && product.product_images.length > 0
        ? `${IMAGES_BASE_URL}${product.product_images[0].image_url}`
        : "/images/placeholder.png";

    const colors = getProductColors(product.product_details);
    const sizes = getProductSizes(product.product_details);
    const materials = getProductMaterials(product.product_details);

    const isHovered = hoveredProduct === product.id_product;

    // Badge for top best sellers
    const getBestSellerBadge = (index: number) => {
      if (index === 0) return { text: "MÁS VENDIDO", color: "bg-yellow-500" };
      if (index === 1) return { text: "TOP 2", color: "bg-gray-400" };
      if (index === 2) return { text: "TOP 3", color: "bg-amber-700" };
      return { text: "POPULAR", color: "bg-blue-600" };
    };

    const bestSellerBadge = getBestSellerBadge(index);

    return (
      <div
        className="h-full"
        onMouseEnter={() => setHoveredProduct(product.id_product)}
        onMouseLeave={() => setHoveredProduct(null)}
      >
        <motion.div
          className="h-full"
          animate={{
            scale: isHovered && !isMobile ? 1.05 : 1,
            zIndex: isHovered ? 10 : 0,
          }}
          transition={{ duration: 0.3 }}
        >
          <Card
            className={`overflow-hidden h-full transition-all duration-300 ${
              isHovered && !isMobile ? "shadow-xl" : "shadow-sm"
            } relative border-2 ${
              index === 0 ? "border-yellow-400" : "border-gray-200"
            }`}
          >
            <CardContent className="p-0">
              {/* Image container */}
              <div className="relative aspect-square bg-gray-100 overflow-hidden">
                <Image
                  src={imageUrl}
                  alt={product.product_name}
                  fill
                  unoptimized
                  priority
                  className="object-cover transition-transform duration-500 hover:scale-110"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />

                {/* Best seller badge */}
                <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-10">
                  <Badge
                    className={`${bestSellerBadge.color} text-white font-semibold text-xs sm:text-sm py-0.5 sm:py-1 px-2 sm:px-3 flex items-center gap-1`}
                  >
                    <Award className="h-3 w-3" />
                    <span className="hidden xs:inline">
                      {bestSellerBadge.text}
                    </span>
                    <span className="xs:hidden">
                      {index === 0 ? "TOP" : `#${index + 1}`}
                    </span>
                  </Badge>
                </div>

                {/* Discount badge if applicable */}
                {discountPercentage > 0 && (
                  <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10">
                    <Badge className="bg-red-600 text-white font-semibold text-xs sm:text-sm py-0.5 sm:py-1">
                      {discountPercentage}% OFF
                    </Badge>
                  </div>
                )}

                {/* Quick action buttons */}
                <motion.div
                  className="absolute inset-0 bg-black/40 flex items-center justify-center gap-4"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: isMobile ? 0.4 : isHovered ? 1 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <Link href={`/productos/${product.id_product}`}>
                    <Button
                      variant="secondary"
                      size={isMobile ? "sm" : "default"}
                      className="rounded-full bg-white hover:bg-yellow-300 text-black flex items-center gap-2 text-xs sm:text-sm"
                    >
                      <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden xs:inline">Ver detalles</span>
                      <span className="xs:hidden">Ver</span>
                    </Button>
                  </Link>
                </motion.div>
              </div>

              {/* Content */}
              <div className="p-3 sm:p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="text-xs sm:text-sm text-gray-600 mb-0.5 sm:mb-1 font-medium truncate">
                      {product.category}
                    </p>
                    <h3 className="text-sm sm:text-lg font-bold line-clamp-2">
                      {product.product_name}
                    </h3>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {priceData.originalPrice ? (
                      <>
                        <span className="text-sm sm:text-lg font-bold text-red-600 block">
                          {formatPrice(priceData.price)}
                        </span>
                        <span className="text-xs sm:text-sm text-gray-500 line-through">
                          {formatPrice(priceData.originalPrice)}
                        </span>
                      </>
                    ) : (
                      <span className="text-sm sm:text-lg font-bold">
                        {formatPrice(priceData.price)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Description - visible on all cards */}
                <p className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2 line-clamp-2">
                  {truncateDescription(product.description, isMobile ? 50 : 70)}
                </p>

                {/* Mobile-friendly features section */}
                <div
                  className={`mt-2 sm:mt-3 ${isMobile ? "block" : "hidden"}`}
                >
                  <div className="flex flex-wrap gap-2">
                    {/* Colors */}
                    {colors.length > 0 && (
                      <div className="mr-2 sm:mr-4">
                        <p className="text-xs font-semibold mb-0.5">Colores:</p>
                        <div className="flex gap-1">
                          {colors.slice(0, 3).map((color) => (
                            <div
                              key={`color-${product.id_product}-${color}`}
                              className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border border-gray-300"
                              style={{
                                backgroundColor: color.startsWith("#")
                                  ? color
                                  : "#ddd",
                              }}
                              title={color.startsWith("#") ? "" : color}
                            />
                          ))}
                          {colors.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{colors.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Sizes */}
                    {sizes.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold mb-0.5">Tallas:</p>
                        <div className="flex gap-1">
                          {sizes.slice(0, 3).map((size) => (
                            <span
                              key={`size-${product.id_product}-${size}`}
                              className="text-xs border border-gray-300 rounded px-1 py-0.5"
                            >
                              {size}
                            </span>
                          ))}
                          {sizes.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{sizes.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Mobile buy button and stock */}
                  <div className="mt-2 flex items-center justify-between">
                    <span
                      className={`text-xs font-medium ${
                        product.stock > 5 ? "text-green-600" : "text-orange-500"
                      }`}
                    >
                      {product.stock > 5
                        ? "En stock"
                        : `¡Solo ${product.stock}!`}
                    </span>

                    <Link href={`/productos/${product.id_product}`}>
                      <Button
                        size="sm"
                        className="bg-black hover:bg-yellow-500 text-white text-xs h-8"
                      >
                        <ShoppingBag className="h-3 w-3 mr-1" /> Comprar
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Desktop expanded details on hover */}
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{
                    opacity: !isMobile && isHovered ? 1 : 0,
                    height: !isMobile && isHovered ? "auto" : 0,
                  }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden hidden sm:block"
                >
                  <div className="flex flex-wrap gap-3 mt-3">
                    {/* Colors */}
                    {colors.length > 0 && (
                      <div className="mr-4">
                        <p className="text-xs font-semibold mb-1">Colores:</p>
                        <div className="flex gap-1">
                          {colors.map((color) => (
                            <div
                              key={`color-${product.id_product}-${color}`}
                              className="w-4 h-4 rounded-full border border-gray-300"
                              style={{
                                backgroundColor: color.startsWith("#")
                                  ? color
                                  : "#ddd",
                              }}
                              title={color.startsWith("#") ? "" : color}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Sizes */}
                    {sizes.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold mb-1">Tallas:</p>
                        <div className="flex gap-1">
                          {sizes.map((size) => (
                            <span
                              key={`size-${product.id_product}-${size}`}
                              className="text-xs border border-gray-300 rounded px-2 py-1"
                            >
                              {size}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Materials */}
                  {materials.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-semibold mb-1">Material:</p>
                      <p className="text-xs text-gray-600">
                        {materials.join(", ")}
                      </p>
                    </div>
                  )}

                  {/* Stock and buy action */}
                  <div className="mt-3 flex items-center justify-between">
                    <span
                      className={`text-xs font-medium ${
                        product.stock > 5 ? "text-green-600" : "text-orange-500"
                      }`}
                    >
                      {product.stock > 5
                        ? "En stock"
                        : `¡Solo quedan ${product.stock}!`}
                    </span>

                    <Link href={`/productos/${product.id_product}`}>
                      <Button
                        size="sm"
                        className="bg-black hover:bg-yellow-500 text-white text-xs"
                      >
                        <ShoppingBag className="h-3 w-3 mr-1" /> Comprar
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  };

  return (
    <section className="py-8 sm:py-12 md:py-16 px-4 sm:px-6 md:px-8 bg-white relative z-30">
      <div className="max-w-6xl mx-auto relative">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8">
          <div className="mb-4 sm:mb-0">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-black flex items-center">
              <Award className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-yellow-500 mr-2" />
              <span className="inline">NUESTROS MÁS VENDIDOS</span>
            </h2>
            <p className="text-sm md:text-base text-gray-600 mt-1 sm:mt-2">
              Los productos más comprados por nuestros clientes
            </p>
          </div>

          <Link href="/productos">
            <Button
              variant="outline"
              size={isMobile ? "sm" : "default"}
              className="border-black text-black hover:bg-yellow-300 hover:text-black hover:border-yellow-300"
            >
              Ver todos
            </Button>
          </Link>
        </div>

        {displayProducts.length > 0 ? (
          <div className="relative">
            {/* Navigation buttons - Only show on non-mobile */}
            <div className={`${isMobile ? "hidden" : "block"}`}>
              <Button
                onClick={prevPage}
                disabled={currentPage === 0}
                variant="outline"
                size="icon"
                className="absolute left-[-20px] md:left-[-60px] top-1/2 -translate-y-1/2 bg-white/80 rounded-full shadow-lg disabled:opacity-0 z-10 w-8 h-8 sm:w-10 sm:h-10"
              >
                <ChevronLeft className="h-4 w-4 sm:h-6 sm:w-6 text-gray-500" />
              </Button>

              <Button
                onClick={nextPage}
                disabled={currentPage === totalPages - 1}
                variant="outline"
                size="icon"
                className="absolute right-[-20px] md:right-[-60px] top-1/2 -translate-y-1/2 bg-white/80 rounded-full shadow-lg disabled:opacity-0 z-10 w-8 h-8 sm:w-10 sm:h-10"
              >
                <ChevronRight className="h-4 w-4 sm:h-6 sm:w-6 text-gray-500" />
              </Button>
            </div>

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
                            key={`product-${product.id_product}`}
                            className={`${
                              isMobile
                                ? "w-full" // Full width on mobile
                                : isTablet
                                  ? "w-1/2" // Half width on tablet
                                  : "w-1/4" // Quarter width on desktop
                            } px-2 sm:px-3 flex-shrink-0`}
                          >
                            {renderBestSellerCard(
                              product,
                              pageIndex * productsPerPage + i
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </motion.div>
              </div>
            </div>

            {/* Mobile swipe indicator text */}
            {isMobile && totalPages > 1 && (
              <div className="text-center text-xs text-gray-500 mt-4">
                Desliza para ver más productos
              </div>
            )}

            {/* Pagination indicators */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-4 sm:mt-6 gap-1 sm:gap-2">
                {Array.from({ length: totalPages }).map((_, index) => (
                  <button
                    key={`indicator-${index}`}
                    onClick={() => setCurrentPage(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      currentPage === index
                        ? "bg-gray-800 w-3 sm:w-4"
                        : "bg-gray-300"
                    }`}
                    aria-label={`Go to page ${index + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Mobile navigation buttons at bottom */}
            {isMobile && totalPages > 1 && (
              <div className="flex justify-center mt-4 gap-4">
                <Button
                  onClick={prevPage}
                  disabled={currentPage === 0}
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 rounded-full p-0 flex items-center justify-center disabled:opacity-30"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  onClick={nextPage}
                  disabled={currentPage === totalPages - 1}
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 rounded-full p-0 flex items-center justify-center disabled:opacity-30"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 sm:py-12 bg-white rounded-lg shadow-sm">
            <Award className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base sm:text-lg font-medium mb-2">
              No hay productos destacados en este momento
            </h3>
            <p className="text-sm text-gray-500">
              Vuelve pronto para ver nuestros productos más vendidos.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default BestSellersSection;
