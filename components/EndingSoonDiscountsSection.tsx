"use client";
import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { ChevronRight, Clock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "./ui/card";
import {
  DiscountedProduct,
  Product,
  ProductDiscount,
} from "@/types/indexTypes";
import { Badge } from "./ui/badge";

interface EndingSoonDiscountsSectionProps {
  allProductsData?: Product[];
  productDiscountsData?: ProductDiscount[];
}

const EndingSoonDiscountsSection: React.FC<EndingSoonDiscountsSectionProps> = ({
  allProductsData,
  productDiscountsData,
}) => {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [endingSoonDiscounts, setEndingSoonDiscounts] = useState<
    DiscountedProduct[]
  >([]);
  const [productDiscounts, setProductDiscounts] = useState<ProductDiscount[]>(
    []
  );
  const [discountedProducts, setDiscountedProducts] = useState<
    DiscountedProduct[]
  >([]);

  useEffect(() => {
    if (allProductsData && allProductsData.length > 0) {
      setAllProducts(allProductsData);
    }
    if (productDiscountsData && productDiscountsData.length > 0) {
      setProductDiscounts(productDiscountsData);
    }
  }, [allProductsData, productDiscountsData]);

  // Process discounted products when both products and discounts are loaded
  useEffect(() => {
    if (allProducts.length > 0 && productDiscounts.length > 0) {
      console.log("Processing discounts with:", {
        products: allProducts.length,
        discounts: productDiscounts.length,
      });

      const now = new Date();

      // Filter active discounts by date
      const activeDiscounts = productDiscounts.filter((discount) => {
        try {
          const startDate = new Date(discount.startDate);
          const endDate = new Date(discount.endDate);
          return (
            !isNaN(startDate.getTime()) &&
            !isNaN(endDate.getTime()) &&
            now >= startDate &&
            now <= endDate
          );
        } catch (error) {
          console.error("Error parsing dates for discount:", discount);
          return false;
        }
      });

      console.log("Active discounts:", activeDiscounts.length);

      // Create an array of discounted products by finding matching product IDs
      const productsWithDiscounts: DiscountedProduct[] = [];

      activeDiscounts.forEach((discount) => {
        const product = allProducts.find((p) => p.id === discount.productId);
        if (product && product.inStock !== false) {
          productsWithDiscounts.push({
            ...product,
            discountPercentage: discount.discountPercentage,
            originalPrice: product.price,
            price: product.price * (1 - discount.discountPercentage / 100),
            endDate: discount.endDate,
          });
        }
      });

      console.log("Products with discounts:", productsWithDiscounts.length);
      setDiscountedProducts(productsWithDiscounts);

      // Process discounts ending soon
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
      console.log("Date range for ending soon:", { now, sevenDaysFromNow });

      const endingSoon = productsWithDiscounts
        .filter((product) => {
          try {
            const endDate = new Date(product.endDate || "");
            const isValid = !isNaN(endDate.getTime());
            const isEndingSoon = endDate > now && endDate < sevenDaysFromNow;

            console.log(`Product ${product.id} end date:`, {
              endDateString: product.endDate,
              endDate,
              isValid,
              isEndingSoon,
            });

            return isValid && isEndingSoon;
          } catch (error) {
            console.error("Error checking end date for product:", product);
            return false;
          }
        })
        .sort((a, b) => {
          const dateA = new Date(a.endDate || "");
          const dateB = new Date(b.endDate || "");
          return dateA.getTime() - dateB.getTime();
        });

      console.log("Ending soon discounts found:", endingSoon.length);
      setEndingSoonDiscounts(endingSoon.slice(0, 4));
    }
  }, [allProducts, productDiscounts]);

  const formatPrice = (price: number) => {
    return `$${price.toLocaleString("es-MX")}`;
  };

  // Format remaining time from now to endDate
  const formatRemainingTime = (endDate: string) => {
    try {
      const end = new Date(endDate);
      if (isNaN(end.getTime())) {
        console.error("Invalid end date:", endDate);
        return "Pronto";
      }

      const now = new Date();
      const diffTime = Math.abs(end.getTime() - now.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor(
        (diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );

      if (diffDays > 0) {
        return `${diffDays}d ${diffHours}h`;
      } else {
        return `${diffHours}h`;
      }
    } catch (error) {
      console.error("Error formatting remaining time:", error);
      return "Pronto";
    }
  };

  // For debugging
  useEffect(() => {
    console.log("EndingSoonDiscounts state:", endingSoonDiscounts.length);
  }, [endingSoonDiscounts]);

  return (
    <section className="py-16 px-8 bg-red-50 relative z-30">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <Badge variant="outline" className="bg-red-100 text-red-600 mb-3">
              <Clock className="h-4 w-4 mr-2" /> ¡Últimas horas!
            </Badge>
            <h2 className="text-3xl font-bold text-black">
              OFERTAS A PUNTO DE FINALIZAR
            </h2>
          </div>
          <Button variant="outline" className="rounded-full" asChild>
            <Link href="/ofertas" className="flex items-center gap-2">
              <span>Ver todas las ofertas</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {endingSoonDiscounts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {endingSoonDiscounts.map((product) => (
              <Link
                key={product.id}
                href={`/productos/${product.id}`}
                className="block"
              >
                <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg relative h-full border-red-200">
                  <CardContent className="p-0">
                    <div className="absolute top-4 right-4 z-10">
                      <Badge className="bg-red-600 text-white">
                        {product.discountPercentage}% OFF
                      </Badge>
                    </div>
                    <div className="absolute top-4 left-4 z-10">
                      <Badge className="bg-black text-white flex items-center gap-1">
                        <Clock className="h-3 w-3" />{" "}
                        {product.endDate
                          ? formatRemainingTime(product.endDate)
                          : "Pronto"}
                      </Badge>
                    </div>
                    <div className="relative aspect-square bg-white">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover p-4 transition-transform duration-300 hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                    <div className="p-4">
                      <p className="text-sm text-gray-600 mb-1">
                        {product.brand}
                      </p>
                      <h3 className="text-lg font-semibold mb-2">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-red-600">
                          {formatPrice(product.price)}
                        </span>
                        <span className="text-sm text-gray-500 line-through">
                          {formatPrice(product.originalPrice)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm">
            <h3 className="text-xl font-medium mb-2">
              No hay ofertas por finalizar pronto
            </h3>
            <p className="text-gray-500 mb-4">
              Por el momento no tenemos ofertas a punto de terminar. ¡Revisa
              nuestras ofertas regulares!
            </p>
            <p className="text-xs text-gray-400">
              (Productos totales: {allProducts.length}, Descuentos activos:{" "}
              {productDiscounts.length}, Productos con descuento:{" "}
              {discountedProducts.length})
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default EndingSoonDiscountsSection;
