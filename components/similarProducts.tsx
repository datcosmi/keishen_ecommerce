"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Eye,
  Award,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface ProductDetail {
  detail_id: number;
  detail_name: string;
  detail_desc: string;
  stock: number;
}

interface ProductImage {
  image_id: number;
  image_url: string;
}

interface Discount {
  id_discount: number;
  percent_discount: number;
  start_date_discount: string;
  end_date_discount: string;
}

interface SimilarProduct {
  id_product: number;
  product_name: string;
  description: string;
  price: number;
  category_id: number;
  category: string;
  stock: number;
  is_deleted: boolean;
  product_details: ProductDetail[];
  product_images: ProductImage[];
  discount_product: Discount[];
  discount_category: Discount[];
}

interface SimilarProductsProps {
  cartProductIds: number[];
  limit?: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const IMAGES_BASE_URL =
  process.env.NEXT_PUBLIC_IMAGES_URL || "https://keishen.com.mx";

export default function SimilarProducts({
  cartProductIds,
  limit = 10,
}: SimilarProductsProps) {
  const [similarProducts, setSimilarProducts] = useState<SimilarProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const productsPerPage = 4; // Show 4 similar products at once

  const totalPages = Math.ceil(
    (similarProducts?.length || 0) / productsPerPage
  );

  useEffect(() => {
    fetchSimilarProducts();
  }, [cartProductIds]);

  const fetchSimilarProducts = async () => {
    if (!cartProductIds || cartProductIds.length === 0) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/similar-products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cartProductIds,
          limit,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al cargar productos similares");
      }

      const data = await response.json();
      setSimilarProducts(data);
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching similar products:", err);
      setError("No se pudieron cargar productos similares");
      setIsLoading(false);
    }
  };

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
  const getDiscountPercentage = (product: SimilarProduct): number => {
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
    product: SimilarProduct
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
    return [...new Set(colorDetails.map((color) => color.detail_desc))];
  };

  // Get unique sizes from product details
  const getProductSizes = (details: ProductDetail[] | undefined): string[] => {
    if (!details) return [];

    const sizeDetails = details.filter(
      (detail) => detail.detail_name === "Tamaño"
    );
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

  const renderProductCard = (product: SimilarProduct) => {
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
            } relative border-2 border-gray-200`}
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
                      className="rounded-full bg-white hover:bg-yellow-300 text-black flex items-center gap-2"
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

  if (isLoading) {
    return (
      <section className="py-6 px-6 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Productos similares</h2>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 aspect-square rounded-lg"></div>
              <div className="mt-2 bg-gray-200 h-4 rounded w-3/4"></div>
              <div className="mt-1 bg-gray-200 h-4 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error || similarProducts.length === 0) {
    return null; // Don't show anything if no similar products or error
  }

  return (
    <section className="py-8 px-6 bg-gray-50 rounded-lg mt-12">
      <div className="max-w-7xl mx-auto relative">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-black flex items-center">
              También te puede interesar
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Basado en tus productos del carrito
            </p>
          </div>

          <Link href="/productos">
            <Button
              variant="outline"
              className="border-black text-black hover:bg-yellow-300 hover:text-black hover:border-yellow-300"
            >
              Ver más
            </Button>
          </Link>
        </div>

        <div className="relative">
          <Button
            onClick={prevPage}
            disabled={currentPage === 0}
            variant="outline"
            size="icon"
            className="absolute left-[-20px] top-1/2 -translate-y-1/2 bg-white/80 rounded-full shadow-lg disabled:opacity-0 z-10"
          >
            <ChevronLeft className="h-5 w-5 text-gray-500" />
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
                  const pageProducts = similarProducts.slice(
                    pageIndex * productsPerPage,
                    (pageIndex + 1) * productsPerPage
                  );

                  return (
                    <div
                      key={`page-${pageIndex}`}
                      className="flex flex-nowrap min-w-full"
                    >
                      {pageProducts.map((product) => (
                        <div
                          key={`product-${product.id_product}`}
                          className="w-1/4 px-3 flex-shrink-0"
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
            className="absolute right-[-20px] top-1/2 -translate-y-1/2 bg-white/80 rounded-full shadow-lg disabled:opacity-0 z-10"
          >
            <ChevronRight className="h-5 w-5 text-gray-500" />
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
      </div>
    </section>
  );
}
