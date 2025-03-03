"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useInView } from "react-intersection-observer";
import NavbarBlack from "./components/navbarBlack";
import {
  ChevronLeft,
  ChevronRight,
  Tag,
  Clock,
  ArrowRight,
} from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import Footer from "./components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  brand?: string;
  colors?: string[];
  inStock?: boolean;
  categoryId?: string;
  addedDate?: string; // New field for product's added date
}

interface Category {
  id: string;
  name: string;
}

interface ProductDiscount {
  id: string;
  productId: string;
  discountPercentage: number;
  startDate: string;
  endDate: string;
}

interface CategoryDiscount {
  id: string;
  categoryId: string;
  discountPercentage: number;
  startDate: string;
  endDate: string;
}

interface DiscountedProduct extends Product {
  discountPercentage: number;
  originalPrice: number;
  endDate?: string; // For tracking when the discount ends
}

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
  const [currentPage, setCurrentPage] = useState(0);
  const [productDiscounts, setProductDiscounts] = useState<ProductDiscount[]>(
    []
  );
  const [categoryDiscounts, setCategoryDiscounts] = useState<
    CategoryDiscount[]
  >([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categoryProducts, setCategoryProducts] = useState<Product[]>([]);
  const [newestProducts, setNewestProducts] = useState<Product[]>([]);
  const [endingSoonDiscounts, setEndingSoonDiscounts] = useState<
    DiscountedProduct[]
  >([]);
  const productsPerPage = 3;

  // Referencia para el efecto de parallax
  const [heroRef, setHeroRef] = useState<HTMLElement | null>(null);

  // Configuración del parallax con useScroll de framer-motion
  const { scrollY } = useScroll();

  // Efectos de parallax
  const textY = useTransform(scrollY, [0, 300], [0, 250]);
  const imageY = useTransform(scrollY, [0, 300], [0, -150]);
  const textOpacity = useTransform(scrollY, [0, 200], [1, 0]);
  const imageOpacity = useTransform(scrollY, [0, 200], [1, 0.3]);
  const backgroundY = useTransform(scrollY, [0, 300], [0, 50]);

  // Detector para la animación inicial al cargar
  const { ref: inViewRef, inView: heroInView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const setRefs = (element: HTMLElement | null) => {
    setHeroRef(element);
    if (inViewRef) {
      inViewRef(element);
    }
  };

  // Fetch products
  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        // Asegurarse de que todos los productos tengan las propiedades necesarias
        const enhancedProducts = data.map((product: Product) => ({
          ...product,
          brand: product.brand || "KEISHEN",
          colors: product.colors || ["#000000", "#FFFFFF", "#808080"],
          inStock: product.inStock !== undefined ? product.inStock : true,
          // Assign random categoryId if not present (for demo purposes)
          categoryId:
            product.categoryId || Math.floor(Math.random() * 5 + 1).toString(),
          // Set a random addedDate if not present (for demo purposes)
          addedDate:
            product.addedDate ||
            new Date(
              Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000
            ).toISOString(),
        }));
        setAllProducts(enhancedProducts);

        // Filtrar solo productos en existencia
        const inStockProducts = enhancedProducts.filter(
          (product: Product) => product.inStock !== false
        );
        setDisplayProducts(inStockProducts);

        // Get newest products
        const sortedByDate = [...inStockProducts].sort(
          (a, b) =>
            new Date(b.addedDate || "").getTime() -
            new Date(a.addedDate || "").getTime()
        );
        setNewestProducts(sortedByDate.slice(0, 8));
      })
      .catch((err) => console.error(err));
  }, []);

  // Fetch categories
  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        setCategories(data);
      })
      .catch((err) => console.error("Error fetching categories:", err));
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

  // Fetch discounts
  useEffect(() => {
    fetch("/api/discounts")
      .then((res) => res.json())
      .then((data) => {
        setProductDiscounts(data.products);
        setCategoryDiscounts(data.categories);
      })
      .catch((err) => console.error("Error fetching discounts:", err));
  }, []);

  // Process discounted products when both products and discounts are loaded
  useEffect(() => {
    if (allProducts.length > 0 && productDiscounts.length > 0) {
      const now = new Date();

      // Filter active discounts by date
      const activeDiscounts = productDiscounts.filter((discount) => {
        const startDate = new Date(discount.startDate);
        const endDate = new Date(discount.endDate);
        return now >= startDate && now <= endDate;
      });

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

      setDiscountedProducts(productsWithDiscounts);

      // Process discounts ending soon
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

      const endingSoon = productsWithDiscounts
        .filter((product) => {
          const endDate = new Date(product.endDate || "");
          return endDate > now && endDate < sevenDaysFromNow;
        })
        .sort((a, b) => {
          const dateA = new Date(a.endDate || "");
          const dateB = new Date(b.endDate || "");
          return dateA.getTime() - dateB.getTime();
        });

      setEndingSoonDiscounts(endingSoon.slice(0, 4));
    }
  }, [allProducts, productDiscounts]);

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

  const totalPages = Math.ceil(displayProducts.length / productsPerPage);

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

  // Format remaining time from now to endDate
  const formatRemainingTime = (endDate: string) => {
    const end = new Date(endDate);
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
  };

  // Calcular productos a mostrar en la página actual
  const currentProducts = displayProducts.slice(
    currentPage * productsPerPage,
    (currentPage + 1) * productsPerPage
  );

  return (
    <div className="min-h-screen bg-black">
      <NavbarBlack />

      {/* Hero Section */}
      <section
        ref={setRefs}
        className="relative px-8 pb-20 pt-10 overflow-hidden"
      >
        {/* Contenedor para texto de fondo */}
        <motion.div
          className="absolute left-0 w-full flex justify-center z-0"
          style={{
            bottom: "-24%",
            y: backgroundY,
            height: "30rem",
          }}
        >
          <div className="overflow-visible h-full flex items-center justify-center">
            <span className="text-[20rem] font-extrabold text-center tracking-tighter opacity-50 font-bold text-transparent bg-clip-text bg-gradient-to-t from-[#808080] to-black whitespace-nowrap">
              KEISHEN
            </span>
          </div>
        </motion.div>

        <div
          className={`max-w-6xl mx-auto transition-all duration-700 ${
            heroInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="flex items-start justify-between">
            <motion.div
              className="w-1/2 pt-16"
              style={{
                y: textY,
                opacity: textOpacity,
              }}
            >
              <h1 className="text-6xl font-bold text-white leading-tight">
                TRANSFORMA TU
                <br />
                <span className="text-yellow-300">ESTILO</span> CON MODA
                <br />
                QUE HABLA <span className="text-yellow-300">POR TI</span>
              </h1>
              <p className="mt-6 text-gray-400 max-w-xl">
                Eleva tu estilo adoptando las últimas tendencias y prestando
                atención a cada detalle para reflejar tu personalidad única.
              </p>

              <Button
                className="mt-8 bg-yellow-300 text-black hover:bg-yellow-400 rounded-full"
                size="lg"
                asChild
              >
                <Link href="/productos" className="flex items-center gap-2">
                  <span>Ver todo</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
            <motion.div
              className="w-1/2 relative"
              style={{
                y: imageY,
                opacity: imageOpacity,
              }}
            >
              <div className="relative w-full min-h-[600px]">
                <Image
                  src="/watch.png"
                  alt="Fashion Model"
                  layout="fill"
                  objectFit="contain"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

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
      <section className="py-16 px-8 bg-white relative z-30">
        <div className="max-w-6xl mx-auto relative">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-black">VISTE CON ESTILO</h2>
            <p className="text-gray-500">
              Mostrando {displayProducts.length} productos en existencia
            </p>
          </div>

          {displayProducts.length > 0 ? (
            <>
              <Button
                onClick={prevPage}
                disabled={currentPage === 0}
                variant="outline"
                size="icon"
                className="absolute left-[-60px] top-1/2 -translate-y-1/2 bg-white/80 rounded-full shadow-lg disabled:opacity-0"
              >
                <ChevronLeft className="h-6 w-6 text-gray-500" />
              </Button>

              {/* Carrusel de productos */}
              <div className="overflow-hidden w-full relative">
                <motion.div
                  className="flex"
                  animate={{ x: `-${currentPage * 100}%` }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                >
                  <div className="flex w-full">
                    {currentProducts.map((product) => {
                      // Calculate if product has an active discount
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
                        discountPercentage = productDiscount.discountPercentage;
                      } else if (categoryDiscount) {
                        originalPrice = product.price;
                        displayPrice =
                          product.price *
                          (1 - categoryDiscount.discountPercentage / 100);
                        discountPercentage =
                          categoryDiscount.discountPercentage;
                      }

                      return (
                        <div
                          key={product.id}
                          className="w-1/3 px-4"
                          style={{ flex: "0 0 33.333%" }}
                        >
                          <Link
                            href={`/producto/${product.id}`}
                            className="block h-full"
                          >
                            <Card className="overflow-hidden h-full transition-all duration-300 hover:shadow-md">
                              <CardContent className="p-0">
                                <div className="relative aspect-square bg-gray-100">
                                  <Image
                                    src={product.image}
                                    alt={product.name}
                                    fill
                                    className="object-cover p-6 transition-transform duration-300 group-hover:scale-105"
                                  />
                                  {discountPercentage > 0 && (
                                    <div className="absolute top-4 right-4 z-10">
                                      <Badge className="bg-red-600 text-white">
                                        {discountPercentage}% OFF
                                      </Badge>
                                    </div>
                                  )}
                                </div>
                                <div className="p-3">
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <p className="text-sm text-gray-600 mb-1">
                                        {product.brand}
                                      </p>
                                      <h3 className="text-base font-semibold">
                                        {product.name}
                                      </h3>
                                    </div>
                                    <div className="text-right">
                                      {originalPrice ? (
                                        <>
                                          <span className="text-base font-bold text-red-600 block">
                                            {formatPrice(displayPrice)}
                                          </span>
                                          <span className="text-sm text-gray-500 line-through">
                                            {formatPrice(originalPrice)}
                                          </span>
                                        </>
                                      ) : (
                                        <span className="text-base font-bold">
                                          {formatPrice(displayPrice)}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  {product.colors && (
                                    <div className="mt-2 flex items-center justify-between">
                                      <p className="text-xs text-gray-500">
                                        {product.colors.length}{" "}
                                        {product.colors.length === 1
                                          ? "color"
                                          : "colores"}
                                      </p>
                                      <div className="flex gap-1">
                                        {product.colors
                                          .slice(0, 3)
                                          .map((color, index) => (
                                            <div
                                              key={index}
                                              className="h-3 w-3 rounded-full border border-gray-300"
                                              style={{ backgroundColor: color }}
                                            />
                                          ))}
                                        {product.colors.length > 3 && (
                                          <div className="text-xs text-gray-500">
                                            +{product.colors.length - 3}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              </div>

              <Button
                onClick={nextPage}
                disabled={currentPage === totalPages - 1}
                variant="outline"
                size="icon"
                className="absolute right-[-60px] top-1/2 -translate-y-1/2 bg-white/80 rounded-full shadow-lg disabled:opacity-0"
              >
                <ChevronRight className="h-6 w-6 text-gray-500" />
              </Button>
            </>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">
                No hay productos en existencia
              </h3>
              <p className="text-gray-500">
                Intenta consultar más tarde o contacta con nosotros para más
                información.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* NEW SECTION: Newest Products */}
      <section className="py-16 px-8 bg-white relative z-30">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <div>
              <Badge
                variant="outline"
                className="bg-blue-100 text-blue-600 mb-3"
              >
                Recién llegados
              </Badge>
              <h2 className="text-3xl font-bold text-black">
                NUEVOS PRODUCTOS
              </h2>
            </div>
            <Button variant="outline" className="rounded-full" asChild>
              <Link href="/nuevos" className="flex items-center gap-2">
                <span>Ver todos los nuevos</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {newestProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {newestProducts.slice(0, 8).map((product) => (
                <Link
                  key={product.id}
                  href={`/producto/${product.id}`}
                  className="block"
                >
                  <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg h-full">
                    <CardContent className="p-0">
                      <div className="relative aspect-square bg-gray-50">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover p-4 transition-transform duration-300 hover:scale-105"
                        />
                        <div className="absolute top-4 left-4 z-10">
                          <Badge className="bg-blue-600 text-white">
                            Nuevo
                          </Badge>
                        </div>
                      </div>
                      <div className="p-4">
                        <p className="text-sm text-gray-600 mb-1">
                          {product.brand}
                        </p>
                        <h3 className="text-lg font-semibold mb-2">
                          {product.name}
                        </h3>
                        <span className="text-lg font-bold">
                          {formatPrice(product.price)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-lg shadow-sm">
              <h3 className="text-xl font-medium mb-2">
                No hay productos nuevos disponibles
              </h3>
              <p className="text-gray-500 mb-4">
                Vuelve pronto para descubrir nuestras novedades.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* NEW SECTION: Ending Soon Discounts */}
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
                  href={`/producto/${product.id}`}
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
                            : ""}
                        </Badge>
                      </div>
                      <div className="relative aspect-square bg-white">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover p-4 transition-transform duration-300 hover:scale-105"
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
            </div>
          )}
        </div>
      </section>

      {/* NEW SECTION: Individual Product Discounts */}
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
                  href={`/producto/${product.id}`}
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

      {/* NEW SECTION: Category Discounts */}
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
                      {/* Placeholder for category image - using a fallback icon */}
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

      {/* NEW SECTION: Categories Showcase */}
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
                          {/* Category image with emoji placeholder */}
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
                          // Calculate if product has an active discount
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
                              href={`/producto/${product.id}`}
                              className="block"
                            >
                              <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg group">
                                <CardContent className="p-0">
                                  <div className="relative aspect-square bg-gray-50">
                                    <Image
                                      src={product.image}
                                      alt={product.name}
                                      fill
                                      className="object-cover p-3 transition-transform duration-300 group-hover:scale-105"
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
