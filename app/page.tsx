"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import NavbarBlack from "@/components/navbarBlack";
import { ChevronRight, Tag } from "lucide-react";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import HeroSection from "@/components/heroSection";
import ProductsSection from "@/components/productsSection";
import {
  Product,
  ProductData,
  Category,
  ProductDiscount,
  CategoryDiscount,
  DiscountedProduct,
} from "@/types/indexTypes";
import NewestProductsSection from "@/components/newestProductsSection";
import EndingSoonDiscountsSection from "@/components/EndingSoonDiscountsSection";

export default function LandingPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [displayProducts, setDisplayProducts] = useState<Product[]>([]);
  const [discountedProducts, setDiscountedProducts] = useState<
    DiscountedProduct[]
  >([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [discountedCategories, setDiscountedCategories] = useState<
    { category: Category; discountPercentage: number }[]
  >([]);
  const [productDiscounts, setProductDiscounts] = useState<ProductDiscount[]>(
    []
  );
  const [categoryDiscounts, setCategoryDiscounts] = useState<
    CategoryDiscount[]
  >([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categoryProducts, setCategoryProducts] = useState<Product[]>([]);
  const [newestProducts, setNewestProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Asegurarse de que todos los productos tengan las propiedades necesarias
  const enhancedProducts = (data: ProductData[]): Product[] => {
    return data.map((product) => ({
      ...product,
      brand: product.brand || "KEISHEN",
      colors: product.colors || ["#000000", "#FFFFFF", "#808080"],
      inStock: product.inStock !== undefined ? product.inStock : true,
      categoryId:
        product.categoryId || Math.floor(Math.random() * 5 + 1).toString(),
      addedDate:
        product.addedDate ||
        new Date(
          Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000
        ).toISOString(),
    }));
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/products");
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      const data = await response.json();
      const enhancedData = enhancedProducts(data);
      setAllProducts(enhancedData);

      // Filtrar productos en existencia
      const inStockProducts = enhancedData.filter(
        (product: Product) => product.inStock !== false
      );
      setDisplayProducts(inStockProducts);

      // Obtener productos más recientes
      const sortedByDate = [...inStockProducts].sort(
        (a, b) =>
          new Date(b.addedDate || "").getTime() -
          new Date(a.addedDate || "").getTime()
      );
      setNewestProducts(sortedByDate.slice(0, 8));
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchDiscounts = async () => {
    try {
      const response = await fetch("/api/discounts");
      if (!response.ok) {
        throw new Error("Failed to fetch discounts");
      }
      const data = await response.json();
      setProductDiscounts(data.products);
      setCategoryDiscounts(data.categories);
    } catch (error) {
      console.error("Error fetching discounts:", error);
    }
  };

  // Fetch products, categories and discounts
  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchDiscounts();
  }, []);

  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      // Set the first category as selected by default when categories load
      setSelectedCategory(categories[0]?.id || "");
    }
  }, [categories]);

  useEffect(() => {
    if (selectedCategory && allProducts.length > 0) {
      // Filter products by the selected category
      let filteredProducts = allProducts.filter(
        (product) =>
          product.categoryId === selectedCategory && product.inStock !== false
      );

      // Apply any active discounts to these products
      if (productDiscounts.length > 0 || categoryDiscounts.length > 0) {
        const now = new Date();

        // Process product-specific discounts
        const activeProductDiscounts = productDiscounts.filter((discount) => {
          const startDate = new Date(discount.startDate);
          const endDate = new Date(discount.endDate);
          return now >= startDate && now <= endDate;
        });

        // Process category discounts
        const activeCategoryDiscount = categoryDiscounts.find((discount) => {
          const startDate = new Date(discount.startDate);
          const endDate = new Date(discount.endDate);
          return (
            discount.categoryId === selectedCategory &&
            now >= startDate &&
            now <= endDate
          );
        });

        // Apply discounts to products
        filteredProducts = filteredProducts.map((product) => {
          // Check for product-specific discount
          const productDiscount = activeProductDiscounts.find(
            (d) => d.productId === product.id
          );

          if (productDiscount) {
            return {
              ...product,
              originalPrice: product.price,
              price:
                product.price * (1 - productDiscount.discountPercentage / 100),
              discountPercentage: productDiscount.discountPercentage,
              endDate: productDiscount.endDate,
            };
          }
          // Check for category discount
          else if (activeCategoryDiscount) {
            return {
              ...product,
              originalPrice: product.price,
              price:
                product.price *
                (1 - activeCategoryDiscount.discountPercentage / 100),
              discountPercentage: activeCategoryDiscount.discountPercentage,
              endDate: activeCategoryDiscount.endDate,
            };
          }

          // No discount
          return {
            ...product,
            discountPercentage: 0,
          };
        });
      } else {
        // If no discounts, ensure each product has a discountPercentage property of 0
        filteredProducts = filteredProducts.map((product) => ({
          ...product,
          discountPercentage: 0,
        }));
      }

      setCategoryProducts(filteredProducts);
    }
  }, [selectedCategory, allProducts, productDiscounts, categoryDiscounts]);

  // Process discounted categories when both categories and discounts are loaded
  useEffect(() => {
    if (categories.length > 0 && categoryDiscounts.length > 0) {
      const now = new Date();

      // Filter active category discounts by date
      const activeDiscounts = categoryDiscounts.filter((discount) => {
        const startDate = new Date(discount.startDate);
        const endDate = new Date(discount.endDate);
        return now >= startDate && now <= endDate;
      });

      // Map categories with discounts
      const categoriesWithDiscounts = [];

      for (const discount of activeDiscounts) {
        const category = categories.find((c) => c.id === discount.categoryId);
        if (category) {
          categoriesWithDiscounts.push({
            category,
            discountPercentage: discount.discountPercentage,
          });
        }
      }

      setDiscountedCategories(categoriesWithDiscounts);
    }
  }, [categories, categoryDiscounts]);

  const formatPrice = (price: number) => {
    return `$${price.toLocaleString("es-MX")}`;
  };

  return (
    <div className="min-h-screen bg-black">
      <NavbarBlack />

      {/* Hero Section */}
      <HeroSection />

      {/* Brands Section */}
      <div className="py-8 bg-yellow-300 relative z-30">
        <div className="max-w-6xl mx-auto px-8">
          <div className="flex justify-between items-center">
            {["JOYERIA", "CAMISAS", "PANTALONES", "GORRAS", "OTROS"].map(
              (brand) => (
                <span key={brand} className="text-black font-bold text-xl">
                  {brand}
                </span>
              )
            )}
          </div>
        </div>
      </div>

      {/* Products Section */}
      <ProductsSection
        allProducts={allProducts.filter((p) => p.inStock !== false)}
        newestProducts={newestProducts.filter((p) => p.inStock !== false)}
        productDiscountsData={productDiscounts}
        categoryDiscountsData={categoryDiscounts}
      />

      {/* Newest Products */}
      <NewestProductsSection
        allProductsData={allProducts.filter((p) => p.inStock !== false)}
        newestProductsData={newestProducts.filter((p) => p.inStock !== false)}
      />

      {/* Ending Soon Discounts */}
      <EndingSoonDiscountsSection
        allProductsData={allProducts.filter((p) => p.inStock !== false)}
        productDiscountsData={productDiscounts}
      />

      {/* Individual Product Discounts */}
      <section className="py-16 px-8 bg-gray-100 relative z-30">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <div>
              <Badge variant="outline" className="bg-red-100 text-red-600 mb-3">
                <Tag className="h-4 w-4 mr-2" /> Ofertas Especiales
              </Badge>
              <h2 className="text-3xl font-bold text-black">
                DESCUENTOS EXCLUSIVOS
              </h2>
            </div>
            <Button variant="outline" className="rounded-full" asChild>
              <Link href="/ofertas" className="flex items-center gap-2">
                <span>Ver todas las ofertas</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {discountedProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {discountedProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/productos/${product.id}`}
                  className="block"
                >
                  <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg relative h-full">
                    <CardContent className="p-0">
                      <div className="absolute top-4 right-4 z-10">
                        <Badge className="bg-red-600 text-white">
                          {product.discountPercentage}% OFF
                        </Badge>
                      </div>
                      <div className="relative aspect-square bg-gray-50">
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
                No hay ofertas disponibles
              </h3>
              <p className="text-gray-500 mb-4">
                Vuelve pronto para disfrutar de nuestros descuentos exclusivos.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Category Discounts */}
      <section className="py-16 px-8 bg-black text-white relative z-30">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <div>
              <Badge
                variant="outline"
                className="bg-yellow-300 text-black mb-3"
              >
                <Tag className="h-4 w-4 mr-2" /> Categorías en Promoción
              </Badge>
              <h2 className="text-3xl font-bold">AHORRA POR CATEGORÍA</h2>
            </div>
            <Button
              className="bg-yellow-300 text-black hover:bg-yellow-400 rounded-full"
              asChild
            >
              <Link href="/categorias" className="flex items-center gap-2">
                <span>Explorar categorías</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {discountedCategories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {discountedCategories.map(({ category, discountPercentage }) => (
                <Link
                  key={category.id}
                  href={`/categoria/${category.id}`}
                  className="block"
                >
                  <div className="group relative overflow-hidden rounded-lg bg-gray-900 aspect-[4/3]">
                    <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-70 z-10"></div>
                    <div className="absolute top-4 right-4 z-20">
                      <Badge className="bg-yellow-300 text-black font-bold">
                        {discountPercentage}% DESCUENTO
                      </Badge>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-8xl text-gray-500 opacity-20">
                        {category.name === "Camisas" && "👕"}
                        {category.name === "Pantalones" && "👖"}
                        {category.name === "Gorras" && "🧢"}
                        {category.name === "Joyeria" && "💍"}
                        {category.name === "Otros" && "🛍️"}
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 p-6 z-20">
                      <h3 className="text-2xl font-bold mb-2">
                        {category.name.toUpperCase()}
                      </h3>
                      <p className="text-gray-300 mb-4">
                        Todos los productos con {discountPercentage}% de
                        descuento
                      </p>
                      <span className="text-yellow-300 font-medium flex items-center group-hover:translate-x-2 transition-transform duration-300">
                        Explorar colección{" "}
                        <ChevronRight className="h-5 w-5 ml-1" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-900 rounded-lg">
              <h3 className="text-xl font-medium mb-2">
                No hay categorías en oferta
              </h3>
              <p className="text-gray-400 mb-4">
                Revisa más tarde para encontrar descuentos por categoría.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Categories Showcase */}
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
                    .filter((cat) => cat.id === selectedCategory)
                    .map((category) => (
                      <div
                        key={category.id}
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
                                href={`/categoria/${category.id}`}
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
                  {categories.map((category, index) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`relative overflow-hidden rounded-lg transition-all duration-300 text-left ${
                        selectedCategory === category.id
                          ? "bg-yellow-300 text-black"
                          : "bg-black text-white hover:bg-gray-800"
                      }`}
                    >
                      <div className="px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-10 h-10 rounded-full ${
                              selectedCategory === category.id
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

                        {selectedCategory === category.id && (
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
                .filter((cat) => cat.id === selectedCategory)
                .map((category) => (
                  <div key={category.id}>
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
                          href={`/categoria/${category.id}`}
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
                        .filter((product) => product.categoryId === category.id)
                        .slice(0, 4)
                        .map((product) => {
                          const productDiscount = productDiscounts.find(
                            (d) =>
                              d.productId === product.id &&
                              new Date() >= new Date(d.startDate) &&
                              new Date() <= new Date(d.endDate)
                          );

                          const categoryDiscount = categoryDiscounts.find(
                            (d) =>
                              d.categoryId === product.categoryId &&
                              new Date() >= new Date(d.startDate) &&
                              new Date() <= new Date(d.endDate)
                          );

                          // Apply discount if exists
                          let displayPrice = product.price;
                          let originalPrice = null;
                          let discountPercentage = 0;

                          if (productDiscount) {
                            originalPrice = product.price;
                            displayPrice =
                              product.price *
                              (1 - productDiscount.discountPercentage / 100);
                            discountPercentage =
                              productDiscount.discountPercentage;
                          } else if (categoryDiscount) {
                            originalPrice = product.price;
                            displayPrice =
                              product.price *
                              (1 - categoryDiscount.discountPercentage / 100);
                            discountPercentage =
                              categoryDiscount.discountPercentage;
                          }

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
                                      src={product.image}
                                      alt={product.name}
                                      fill
                                      className="object-cover p-4 transition-transform duration-300 hover:scale-105"
                                      sizes="(max-width: 768px) 100vw, 50vw"
                                    />

                                    {discountPercentage > 0 && (
                                      <div className="absolute top-3 right-3 z-10">
                                        <Badge className="bg-red-600 text-white">
                                          {discountPercentage}% OFF
                                        </Badge>
                                      </div>
                                    )}
                                  </div>
                                  <div className="p-3">
                                    <p className="text-sm text-gray-600 mb-1">
                                      {product.brand}
                                    </p>
                                    <h3 className="text-base font-semibold mb-1 line-clamp-1">
                                      {product.name}
                                    </h3>
                                    <div className="flex justify-between items-center">
                                      <div>
                                        {originalPrice ? (
                                          <>
                                            <span className="text-base font-bold text-red-600 block">
                                              {formatPrice(displayPrice)}
                                            </span>
                                            <span className="text-xs text-gray-500 line-through">
                                              {formatPrice(originalPrice)}
                                            </span>
                                          </>
                                        ) : (
                                          <span className="text-base font-bold">
                                            {formatPrice(displayPrice)}
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
                      (product) => product.categoryId === category.id
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

      <Footer />
    </div>
  );
}
