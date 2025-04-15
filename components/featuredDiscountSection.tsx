"use client";
import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { ShoppingBag, Eye, Award } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";
import Image from "next/image";
import { ProductData } from "@/types/productTypes";

interface FeaturedDiscountSectionProps {
  product: ProductData;
}

const FeaturedDiscountSection: React.FC<FeaturedDiscountSectionProps> = ({
  product,
}) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [hoveredProduct, setHoveredProduct] = useState(false);
  const [discountInfo, setDiscountInfo] = useState({
    percent: 0,
    endDate: new Date(),
  });

  useEffect(() => {
    // Calculate discount information - only run once
    const calculateDiscountInfo = () => {
      const now = new Date();
      let highestDiscount = { percent: 0, endDate: new Date() };

      // Check product discounts
      if (product.discount_product && product.discount_product.length > 0) {
        product.discount_product.forEach((discount) => {
          const startDate = new Date(discount.start_date_discount);
          const endDate = new Date(discount.end_date_discount);

          if (
            now >= startDate &&
            now <= endDate &&
            discount.percent_discount > highestDiscount.percent
          ) {
            highestDiscount = {
              percent: discount.percent_discount,
              endDate: endDate,
            };
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
            discount.percent_discount > highestDiscount.percent
          ) {
            highestDiscount = {
              percent: discount.percent_discount,
              endDate: endDate,
            };
          }
        });
      }

      return highestDiscount;
    };

    setDiscountInfo(calculateDiscountInfo());
  }, [product]); // Only recalculate if product changes

  useEffect(() => {
    // Update countdown timer
    const calculateTimeLeft = () => {
      const difference = +discountInfo.endDate - +new Date();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [discountInfo.endDate]); // Depend on the end date, which is stable now

  // Calculate discounted price - memoized to avoid recalculation on every render
  const discountedPrice = useMemo(() => {
    return product.price * (1 - discountInfo.percent / 100);
  }, [product.price, discountInfo.percent]);

  const formatPrice = (price: number) => {
    return `$${price.toLocaleString("es-MX")}`;
  };

  // Get unique colors from product details - memoized
  const colors = useMemo(() => {
    if (!product.product_details) return [];

    const colorDetails = product.product_details.filter(
      (detail) => detail.detail_name === "Color"
    );
    // Get unique color values
    return [...new Set(colorDetails.map((color) => color.detail_desc))];
  }, [product.product_details]);

  // Get unique sizes from product details - memoized
  const sizes = useMemo(() => {
    if (!product.product_details) return [];

    const sizeDetails = product.product_details.filter(
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
  }, [product.product_details]);

  const imageUrl = useMemo(() => {
    return product.product_images && product.product_images.length > 0
      ? `http://localhost:3001${product.product_images[0].image_url}`
      : "/images/placeholder.png";
  }, [product.product_images]);

  return (
    <section className="py-16 px-8 bg-white relative z-30 overflow-hidden">
      <div className="max-w-7xl mx-auto relative">
        <div className="flex flex-col md:flex-row items-center gap-10">
          {/* Left side - Countdown and title */}
          <div className="w-full md:w-1/2 space-y-6">
            <div>
              <h2 className="text-4xl font-bold">
                <span className="text-amber-400">Oferta</span> Destacada
              </h2>
              <p className="text-gray-600 mt-4 text-lg">
                ¡Aprovecha esta increíble oferta por tiempo limitado!
              </p>
            </div>

            {/* Countdown Timer */}
            <div className="flex justify-start space-x-5 mt-8">
              <div className="flex flex-col items-center">
                <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-amber-400 text-2xl font-bold">
                    {timeLeft.days.toString().padStart(2, "0")}
                  </span>
                </div>
                <span className="text-gray-500 text-sm mt-2">Días</span>
              </div>

              <div className="flex flex-col items-center">
                <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-amber-400 text-2xl font-bold">
                    {timeLeft.hours.toString().padStart(2, "0")}
                  </span>
                </div>
                <span className="text-gray-500 text-sm mt-2">Horas</span>
              </div>

              <div className="flex flex-col items-center">
                <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-amber-400 text-2xl font-bold">
                    {timeLeft.minutes.toString().padStart(2, "0")}
                  </span>
                </div>
                <span className="text-gray-500 text-sm mt-2">Minutos</span>
              </div>

              <div className="flex flex-col items-center">
                <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-amber-400 text-2xl font-bold">
                    {timeLeft.seconds.toString().padStart(2, "0")}
                  </span>
                </div>
                <span className="text-gray-500 text-sm mt-2">Segundos</span>
              </div>
            </div>

            {/* Shop Now Button */}
            <div className="mt-8">
              <Link href={`/productos/${product.id_product}`}>
                <Button className="bg-amber-400 hover:bg-amber-500 text-white px-6 py-3 rounded-md font-medium text-lg flex items-center space-x-2">
                  <span>Comprar Ahora</span>
                  <span className="ml-2">→</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Right side - Product Card */}
          <div
            className="w-full md:w-1/2"
            onMouseEnter={() => setHoveredProduct(true)}
            onMouseLeave={() => setHoveredProduct(false)}
          >
            <motion.div
              animate={{
                scale: hoveredProduct ? 1.05 : 1,
                zIndex: hoveredProduct ? 10 : 0,
              }}
              transition={{ duration: 0.3 }}
            >
              <Card
                className={`overflow-hidden transition-all duration-300 ${
                  hoveredProduct ? "shadow-xl" : "shadow-md"
                } relative border-3 border-yellow-400`}
              >
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    {/* Image container - now on the left */}
                    <div className="relative w-full md:w-2/5 aspect-square bg-gray-100 overflow-hidden">
                      <Image
                        src={imageUrl}
                        alt={product.product_name}
                        fill
                        unoptimized
                        priority
                        className="object-cover transition-transform duration-500 hover:scale-110"
                        sizes="(max-width: 768px) 100vw, 24vw"
                      />

                      {/* Deal badge */}
                      <div className="absolute top-4 left-4 z-10">
                        <Badge className="bg-amber-500 text-white font-semibold py-2 px-3 flex items-center gap-2">
                          <Award className="h-4 w-4" />
                          MEJOR OFERTA
                        </Badge>
                      </div>

                      {/* Discount badge */}
                      <div className="absolute bottom-4 left-4 z-10">
                        <Badge className="bg-red-600 text-white font-semibold py-2 px-3 text-base">
                          {discountInfo.percent}% OFF
                        </Badge>
                      </div>

                      {/* Quick action buttons on hover */}
                      <motion.div
                        className="absolute inset-0 bg-black/40 flex items-center justify-center gap-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: hoveredProduct ? 1 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Link href={`/productos/${product.id_product}`}>
                          <Button
                            variant="secondary"
                            size="lg"
                            className="rounded-full bg-white hover:bg-yellow-300 text-black flex items-center gap-2"
                          >
                            <Eye className="h-4 w-4" />
                            Ver detalles
                          </Button>
                        </Link>
                      </motion.div>
                    </div>

                    {/* Content - now on the right */}
                    <div className="w-full md:w-3/5 p-6 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-base text-gray-600 font-medium">
                              {product.category}
                            </p>
                            <h3 className="text-2xl font-bold mt-2">
                              {product.product_name}
                            </h3>
                          </div>
                          <div className="text-right">
                            <span className="text-2xl font-bold text-red-600 block">
                              {formatPrice(discountedPrice)}
                            </span>
                            <span className="text-base text-gray-500 line-through">
                              {formatPrice(product.price)}
                            </span>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-base text-gray-600 mt-3 line-clamp-3">
                          {product.description}
                        </p>

                        {/* Expanded details */}
                        <div className="mt-4">
                          <div className="flex flex-wrap gap-4">
                            {/* Colors */}
                            {colors.length > 0 && (
                              <div className="mr-6">
                                <p className="text-sm font-semibold mb-2">
                                  Colores:
                                </p>
                                <div className="flex gap-2">
                                  {colors.map((color) => (
                                    <div
                                      key={`color-${product.id_product}-${color}`}
                                      className="w-6 h-6 rounded-full border border-gray-300"
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
                                <p className="text-sm font-semibold mb-2">
                                  Tallas:
                                </p>
                                <div className="flex gap-2">
                                  {sizes.map((size) => (
                                    <span
                                      key={`size-${product.id_product}-${size}`}
                                      className="text-sm border border-gray-300 rounded px-3 py-1"
                                    >
                                      {size}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Stock and buy action */}
                      <div className="mt-6 flex items-center justify-between">
                        <span
                          className={`text-sm font-medium ${
                            product.stock > 5
                              ? "text-green-600"
                              : "text-orange-500"
                          }`}
                        >
                          {product.stock > 5
                            ? "En stock"
                            : `¡Solo quedan ${product.stock}!`}
                        </span>

                        <Link href={`/productos/${product.id_product}`}>
                          <Button
                            size="lg"
                            className="bg-black hover:bg-yellow-500 text-white px-5 py-2"
                          >
                            <ShoppingBag className="h-4 w-4 mr-2" /> Comprar
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedDiscountSection;
