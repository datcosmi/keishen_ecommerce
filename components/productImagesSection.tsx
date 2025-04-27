"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { ProductData } from "@/types/productTypes";

interface ProductImagesSectionProps {
  product: ProductData | null;
  activeDiscount: number;
  API_BASE_URL: any;
}

interface ProductImage {
  image_url: string;
}

export default function ProductImagesSection({
  product,
  activeDiscount,
  API_BASE_URL,
}: ProductImagesSectionProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [thumbnailImages, setThumbnailImages] = useState<string[]>([]);

  useEffect(() => {
    // Set thumbnails when product changes
    if (product?.product_images && product.product_images.length > 0) {
      setThumbnailImages(
        product.product_images.map((img: ProductImage) => img.image_url)
      );
    }
  }, [product]);

  const nextImage = () => {
    if (product && product.product_images.length > 0) {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === product.product_images.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  const prevImage = () => {
    if (product && product.product_images.length > 0) {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === 0 ? product.product_images.length - 1 : prevIndex - 1
      );
    }
  };

  const handleThumbnailClick = (index: number) => {
    setCurrentImageIndex(index);
  };

  if (!product) return null;

  return (
    <div className="w-full md:w-1/2 md:h-[calc(100vh-64px)] md:sticky md:top-0 bg-gray-50 flex flex-col">
      <div className="relative h-96 md:h-full flex items-center justify-center overflow-hidden">
        {/* Discount badge if applicable */}
        {activeDiscount > 0 && (
          <Badge className="absolute top-8 right-8 bg-red-600 text-white hover:bg-red-700 z-10 text-sm px-4 py-2 font-bold animate-pulse">
            {activeDiscount}% DESCUENTO
          </Badge>
        )}

        {/* Main image */}
        <div className="relative w-full h-full">
          {product.product_images && product.product_images.length > 0 ? (
            <motion.div
              key={currentImageIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full relative"
            >
              <Image
                src={`${API_BASE_URL}${product.product_images[currentImageIndex].image_url}`}
                alt={product.product_name}
                fill
                priority
                className="object-contain p-4"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </motion.div>
          ) : (
            <Image
              src={"/images/placeholder.png"}
              alt={product.product_name || "Product image"}
              fill
              priority
              className="object-contain p-4"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          )}
        </div>

        {/* Navigation buttons */}
        {product.product_images && product.product_images.length > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full h-10 w-10 z-10 bg-white/80 backdrop-blur-sm hover:bg-white"
              onClick={prevImage}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full h-10 w-10 z-10 bg-white/80 backdrop-blur-sm hover:bg-white"
              onClick={nextImage}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {thumbnailImages.length > 1 && (
        <div className="hidden md:flex justify-center gap-2 p-4 bg-white">
          {thumbnailImages.map((img, index) => (
            <div
              key={index}
              className={`w-16 h-16 relative border rounded overflow-hidden cursor-pointer transition-all duration-200 
                ${currentImageIndex === index ? "border-yellow-500 shadow-md scale-105" : "border-gray-200 opacity-70"}`}
              onClick={() => handleThumbnailClick(index)}
            >
              <Image
                src={`${API_BASE_URL}${img}`}
                alt={`Thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
