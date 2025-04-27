"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Loader2 } from "lucide-react";
import { useInView } from "react-intersection-observer";

interface Category {
  id_cat: number;
  name: string;
  image_url: string | null;
}

const CategoriesShowcase = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
  const API_BASE_URL_IMAGE = process.env.NEXT_PUBLIC_IMAGES_URL;

  // Animation refs for the section
  const [headerRef, headerInView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const [cardsRef, cardsInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  // Default image for categories without images
  const defaultCategoryImage = "/images/placeholder.png";

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `${API_BASE_URL}/api/categories-with-image`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }

        const data = await response.json();

        // Filter out categories with empty names or "si"
        const filteredCategories = data.filter(
          (cat: Category) =>
            cat.name &&
            cat.name.trim() !== "" &&
            cat.name.toLowerCase() !== "si"
        );

        setCategories(filteredCategories);
      } catch (err) {
        setError("Error loading categories. Please try again later.");
        console.error("Error fetching categories:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, [API_BASE_URL]);

  if (error) {
    return (
      <div className="py-16 text-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div
          ref={headerRef}
          className={`text-center mb-12 transform transition-all duration-1000 ${
            headerInView
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10"
          }`}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Explora Nuestras <span className="text-yellow-400">Categorías</span>
          </h2>
          <div className="w-24 h-1 bg-black mx-auto mb-6"></div>
          <p className="text-gray-700 max-w-2xl mx-auto">
            Descubre nuestra exclusiva selección de productos para el hombre
            moderno. Elegancia y estilo en cada categoría.
          </p>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-12 h-12 text-yellow-400 animate-spin" />
          </div>
        ) : (
          <div
            ref={cardsRef}
            className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 transform transition-all duration-1000 delay-300 ${
              cardsInView
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-20"
            }`}
          >
            {categories.map((category, index) => (
              <Link
                href={`/productos?category=${category.id_cat}`}
                key={category.id_cat}
                className={`group transform transition-all duration-500 hover:scale-105 delay-${index * 100}`}
              >
                <div className="relative bg-white rounded-xl overflow-hidden shadow-lg h-80">
                  {/* Category Image */}
                  <div className="absolute inset-0 z-0">
                    <Image
                      src={
                        category.image_url
                          ? `${API_BASE_URL_IMAGE}${category.image_url}`
                          : defaultCategoryImage
                      }
                      alt={category.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      priority={index < 3}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                  </div>

                  {/* Category Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 z-10 transform transition-transform duration-500 group-hover:translate-y-0">
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {category.name}
                    </h3>
                    <div className="flex items-center">
                      <span className="text-yellow-400 text-sm font-medium mr-2">
                        Ver productos
                      </span>
                      <div className="bg-yellow-400 rounded-full p-1 transform transition-transform duration-500 group-hover:translate-x-2">
                        <ChevronRight className="w-4 h-4 text-black" />
                      </div>
                    </div>
                  </div>

                  {/* Decorative elements */}
                  <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-yellow-400 opacity-70"></div>
                  <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-white opacity-70"></div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default CategoriesShowcase;
