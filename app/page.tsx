"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useInView } from "react-intersection-observer";
import NavbarBlack from "./components/navbarBlack";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
}

export default function LandingPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [displayProducts, setDisplayProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
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
        }));
        setAllProducts(enhancedProducts);

        // Filtrar solo productos en existencia
        const inStockProducts = enhancedProducts.filter(
          (product: Product) => product.inStock !== false
        );
        setDisplayProducts(inStockProducts);
      })
      .catch((err) => console.error(err));
  }, []);

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
            bottom: "-28%",
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
                    {currentProducts.map((product) => (
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
                                  <span className="text-base font-bold text-right">
                                    {formatPrice(product.price)}
                                  </span>
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
                    ))}
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
      <Footer />
    </div>
  );
}
