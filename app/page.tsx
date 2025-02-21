"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useInView } from "react-intersection-observer";
import NavbarBlack from "./components/navbarBlack";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { motion, useScroll, useTransform } from "framer-motion";
import Footer from "./components/footer";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
}

export default function LandingPage() {
  const [products, setProducts] = useState<Product[]>([]);
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
      .then((data) => setProducts(data))
      .catch((err) => console.error(err));
  }, []);

  const totalPages = Math.ceil(products.length / productsPerPage);

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

              <button className="mt-8 bg-yellow-300 text-black px-8 py-3 rounded-full font-medium flex items-center space-x-2 hover:bg-yellow-400 transition-colors">
                <Link href={"/productos"}>
                  <span>Ver todo</span>
                </Link>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 12h14M12 5l7 7-7 7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
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
          <h2 className="text-3xl font-bold text-black mb-8">
            VISTE CON ESTILO
          </h2>

          <button
            onClick={prevPage}
            disabled={currentPage === 0}
            className="absolute left-[-60px] top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-lg disabled:opacity-0"
          >
            <ChevronLeftIcon className="h-8 w-8 text-gray-500" />
          </button>

          {/* Carrusel de productos */}
          <div className="overflow-hidden w-full relative">
            <motion.div
              className="flex"
              animate={{ x: `-${currentPage * 100}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              <div className="flex w-full">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="w-1/3 px-4"
                    style={{ flex: "0 0 33.333%" }}
                  >
                    <Link
                      href={`/producto/${product.id}`}
                      className="group cursor-pointer block"
                    >
                      <div className="w-full h-64 flex items-center justify-center bg-gray-100 rounded-xl overflow-hidden">
                        <Image
                          src={product.image}
                          alt={product.name}
                          width={200}
                          height={200}
                          className="object-contain w-full h-full"
                        />
                      </div>
                      <h3 className="mt-4 text-sm font-medium text-black">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-500">${product.price}</p>
                    </Link>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <button
            onClick={nextPage}
            disabled={currentPage === totalPages - 1}
            className="absolute right-[-60px] top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-lg disabled:opacity-0"
          >
            <ChevronRightIcon className="h-8 w-8 text-gray-500" />
          </button>
        </div>
      </section>
      <Footer />
    </div>
  );
}
