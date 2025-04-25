"use client";
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Star,
  Eye,
  ShoppingBag,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "./ui/card";
import { ProductData, ProductDetail } from "@/types/productTypes";
import { Badge } from "./ui/badge";

interface TopRatedSectionProps {
  topRatedProducts?: ProductData[];
}

const IMAGES_BASE_URL =
  process.env.NEXT_PUBLIC_IMAGES_URL || "https://keishen.com.mx";

const TopRatedSection: React.FC<TopRatedSectionProps> = ({
  topRatedProducts,
}) => {
  const [displayProducts, setDisplayProducts] = useState<ProductData[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const productsPerPage = 4; // Show 4 top rated products at once
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);

  const totalPages = Math.ceil(
    (displayProducts?.length || 0) / productsPerPage
  );

  useEffect(() => {
    // Fetch top rated products if not provided as props
    if (!topRatedProducts) {
      const fetchTopRatedProducts = async () => {
        try {
          const response = await fetch("/api/products/top-rated");
          if (!response.ok) {
            throw new Error("Failed to fetch top rated products");
          }
          const data = await response.json();
          setDisplayProducts(data);
        } catch (error) {
          console.error("Error fetching top rated products:", error);
          setDisplayProducts([]);
        }
      };

      fetchTopRatedProducts();
    } else if (topRatedProducts.length > 0) {
      setDisplayProducts(topRatedProducts);
    }
  }, [topRatedProducts]);

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

  // Get rating display from rating number
  const getRatingStars = (rating: number) => {
    // If rating is missing, use a default
    const ratingValue = rating || 0;

    // Stars to show (max 5)
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < Math.floor(ratingValue)
                ? "text-yellow-400 fill-yellow-400"
                : i < ratingValue
                  ? "text-yellow-400 fill-yellow-400 opacity-50"
                  : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-1 text-sm font-medium text-gray-700">
          {ratingValue.toFixed(1)}
        </span>
      </div>
    );
  };

  const renderTopRatedCard = (product: ProductData, index: number) => {
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

    // Badge for top rated products
    const getTopRatedBadge = (index: number) => {
      if (index === 0)
        return { text: "MEJOR CALIFICADO", color: "bg-blue-600" };
      if (index === 1) return { text: "TOP 2", color: "bg-blue-500" };
      if (index === 2) return { text: "TOP 3", color: "bg-blue-400" };
      return { text: "RECOMENDADO", color: "bg-blue-300" };
    };

    const topRatedBadge = getTopRatedBadge(index);

    // Assuming product has a rating property or calculate it
    const rating = product.rating || 4.5; // Default to 4.5 if not present

    return (
      <div
        className="h-full"
        onMouseEnter={() => setHoveredProduct(product.id_product)}
        onMouseLeave={() => setHoveredProduct(null)}
      >
        <motion.div
          className="h-full"
          animate={{
            scale: isHovered ? 1.05 : 1,
            zIndex: isHovered ? 10 : 0,
          }}
          transition={{ duration: 0.3 }}
        >
          <Card
            className={`overflow-hidden h-full transition-all duration-300 ${
              isHovered ? "shadow-xl" : "shadow-sm"
            } relative border-2 ${
              index === 0 ? "border-blue-500" : "border-gray-200"
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
                  sizes="(max-width: 768px) 100vw, 50vw"
                />

                {/* Top rated badge */}
                <div className="absolute top-4 left-4 z-10">
                  <Badge
                    className={`${topRatedBadge.color} text-white font-semibold py-1 px-3 flex items-center gap-1`}
                  >
                    <Star className="h-3 w-3 fill-white" />
                    {topRatedBadge.text}
                  </Badge>
                </div>

                {/* Discount badge if applicable */}
                {discountPercentage > 0 && (
                  <div className="absolute top-4 right-4 z-10">
                    <Badge className="bg-red-600 text-white font-semibold py-1">
                      {discountPercentage}% OFF
                    </Badge>
                  </div>
                )}

                {/* Quick action buttons on hover */}
                <motion.div
                  className="absolute inset-0 bg-black/40 flex items-center justify-center gap-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isHovered ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Link href={`/productos/${product.id_product}`}>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="rounded-full bg-white hover:bg-blue-300 text-black flex items-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Ver detalles
                    </Button>
                  </Link>
                </motion.div>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1 font-medium">
                      {product.category}
                    </p>
                    <h3 className="text-lg font-bold">
                      {product.product_name}
                    </h3>
                  </div>
                  <div className="text-right">
                    {priceData.originalPrice ? (
                      <>
                        <span className="text-lg font-bold text-red-600 block">
                          {formatPrice(priceData.price)}
                        </span>
                        <span className="text-sm text-gray-500 line-through">
                          {formatPrice(priceData.originalPrice)}
                        </span>
                      </>
                    ) : (
                      <span className="text-lg font-bold">
                        {formatPrice(priceData.price)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Rating - always visible */}
                <div className="mt-2">{getRatingStars(rating)}</div>

                {/* Description - visible on all cards */}
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                  {truncateDescription(product.description, 70)}
                </p>

                {/* Expanded details on hover */}
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{
                    opacity: isHovered ? 1 : 0,
                    height: isHovered ? "auto" : 0,
                  }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
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
                        className="bg-black hover:bg-blue-500 text-white text-xs"
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
    <section className="py-16 px-8 bg-gray-50 relative z-30">
      <div className="max-w-6xl mx-auto relative">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-black flex items-center">
              <Star className="h-8 w-8 text-blue-500 mr-2 fill-blue-500" />
              MEJOR CALIFICADOS
            </h2>
            <p className="text-gray-600 mt-2">
              Productos con las mejores reseñas de nuestros clientes
            </p>
          </div>

          <Link href="/productos/mejor-calificados">
            <Button
              variant="outline"
              className="border-black text-black hover:bg-blue-300 hover:text-black hover:border-blue-300"
            >
              Ver todos
            </Button>
          </Link>
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
                            key={`product-${product.id_product}`}
                            className="w-1/4 px-3 flex-shrink-0"
                          >
                            {renderTopRatedCard(
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
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <Star className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium mb-2">
              No hay productos calificados disponibles
            </h3>
            <p className="text-gray-500">
              Vuelve pronto para ver nuestros productos mejor valorados.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default TopRatedSection;
