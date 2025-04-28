"use client";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { Button } from "./ui/button";
import { ChevronRight, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// Featured collections for the hero slider
const featuredItems = [
  {
    id: 1,
    title: "TRANSFORMA TU ESTILO",
    subtitle: "CON MODA QUE HABLA POR TI",
    description:
      "Eleva tu estilo adoptando las últimas tendencias y prestando atención a cada detalle para reflejar tu personalidad única.",
    image: "/images/arete.jpg",
    alt: "Elegant watch",
    linkText: "Ver productos",
    accentColor: "yellow",
  },
  {
    id: 2,
    title: "ELEGANCIA EN LO COTIDIANO",
    subtitle: "COLECCIÓN PREMIUM",
    description:
      "Descubre nuestras prendas que combinan estilo atemporal con materiales de primera calidad.",
    image: "/images/cadena-oro.jpg",
    alt: "Premium suit",
    linkText: "Explorar colecciones",
    accentColor: "blue",
  },
  {
    id: 3,
    title: "ACCESORIOS QUE DESTACAN",
    subtitle: "NUEVOS ARRIVALS",
    description:
      "Complementa tu look con nuestra exclusiva selección de accesorios para el hombre moderno.",
    image: "/images/gorra.jpg",
    alt: "Fashion accessories",
    linkText: "Descubrir más",
    accentColor: "red",
  },
];

const HeroSection = () => {
  // Configuración del parallax con useScroll de framer-motion
  const { scrollY } = useScroll();

  // Efectos de parallax
  const textY = useTransform(scrollY, [0, 300], [0, 150]);
  const imageY = useTransform(scrollY, [0, 300], [0, -100]);
  const textOpacity = useTransform(scrollY, [0, 200], [1, 0.5]);
  const imageOpacity = useTransform(scrollY, [0, 200], [1, 0.6]);
  const backgroundY = useTransform(scrollY, [0, 300], [0, 50]);

  // Detector para la animación inicial al cargar
  const { ref: inViewRef, inView: heroInView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  // Slider state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const autoPlayTime = 5000; // 5 seconds

  // Reference for the hero section
  const [heroRef, setHeroRef] = useState<HTMLElement | null>(null);

  // Handle auto-rotate of slides
  useEffect(() => {
    let slideInterval: NodeJS.Timeout;

    if (isAutoPlaying) {
      slideInterval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % featuredItems.length);
      }, autoPlayTime);
    }

    return () => {
      if (slideInterval) clearInterval(slideInterval);
    };
  }, [isAutoPlaying]);

  // Pause auto-rotation when user interacts with slider
  const handleSlideChange = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);

    // Resume auto-play after 10 seconds of inactivity
    setTimeout(() => {
      setIsAutoPlaying(true);
    }, 10000);
  };

  // Combined ref for intersection and scroll effects
  const setRefs = (element: HTMLElement | null) => {
    setHeroRef(element);
    if (inViewRef) {
      inViewRef(element);
    }
  };

  // Get accent color for current slide
  const getAccentColor = (color: string) => {
    switch (color) {
      case "yellow":
        return "from-yellow-300 to-yellow-500";
      case "blue":
        return "from-blue-300 to-blue-500";
      case "red":
        return "from-red-300 to-red-500";
      default:
        return "from-yellow-300 to-yellow-500";
    }
  };

  const currentAccentColor = getAccentColor(
    featuredItems[currentSlide].accentColor
  );
  const currentTextColor =
    featuredItems[currentSlide].accentColor === "yellow"
      ? "text-yellow-300"
      : featuredItems[currentSlide].accentColor === "blue"
        ? "text-blue-300"
        : "text-red-300";

  const currentButtonColor =
    featuredItems[currentSlide].accentColor === "yellow"
      ? "bg-yellow-400 hover:bg-yellow-500"
      : featuredItems[currentSlide].accentColor === "blue"
        ? "bg-blue-400 hover:bg-blue-500"
        : "bg-red-400 hover:bg-red-500";

  return (
    <section
      ref={setRefs}
      className="relative min-h-[100vh] w-full overflow-hidden bg-black"
    >
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black/90 to-black/70 z-10"></div>

      {/* Animated background text */}
      <motion.div
        className="absolute left-0 w-full flex justify-center -z-0"
        style={{
          bottom: "-24%",
          y: backgroundY,
          height: "30rem",
        }}
      >
        <div className="overflow-visible h-full flex items-center justify-center">
          <span className="text-[12rem] md:text-[20rem] font-extrabold text-center tracking-tighter opacity-[0.07] font-bold text-transparent bg-clip-text bg-gradient-to-t from-gray-700 to-gray-900 whitespace-nowrap">
            KEISHEN
          </span>
        </div>
      </motion.div>

      {/* Main hero content */}
      <div className="container mx-auto px-4 md:px-8 relative z-10 h-screen flex flex-col justify-center">
        <div
          className={`max-w-7xl mx-auto w-full transition-all duration-700 ${
            heroInView ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 md:gap-12">
            {/* Text Content - Left side */}
            <motion.div
              className="w-full lg:w-1/2 pt-16 lg:pt-0 order-2 lg:order-1 text-center lg:text-left"
              style={{
                y: textY,
                opacity: textOpacity,
              }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={`slide-text-${currentSlide}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                    {featuredItems[currentSlide].title}
                    <br />
                    <span className={currentTextColor}>
                      {featuredItems[currentSlide].subtitle}
                    </span>
                  </h1>
                  <p className="mt-4 md:mt-6 text-gray-300 max-w-xl mx-auto lg:mx-0 text-base md:text-lg">
                    {featuredItems[currentSlide].description}
                  </p>

                  <div className="mt-8 md:mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                    <Button
                      className={`${currentButtonColor} text-black hover:text-black font-medium rounded-full`}
                      size="lg"
                      asChild
                    >
                      <Link
                        href={"/productos"}
                        className="flex items-center gap-2"
                      >
                        <span>{featuredItems[currentSlide].linkText}</span>
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </Button>

                    <Button
                      variant="outline"
                      className="border-white hover:bg-white/10 rounded-full"
                      size="lg"
                      asChild
                    ></Button>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Slider controls */}
              <div className="mt-12 md:mt-16 flex items-center justify-center lg:justify-start gap-3">
                {featuredItems.map((_, index) => (
                  <button
                    key={`slide-dot-${index}`}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      currentSlide === index
                        ? `w-8 ${
                            _.accentColor === "yellow"
                              ? "bg-yellow-300"
                              : _.accentColor === "blue"
                                ? "bg-blue-300"
                                : "bg-red-300"
                          }`
                        : "bg-gray-500 hover:bg-gray-400"
                    }`}
                    onClick={() => handleSlideChange(index)}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </motion.div>

            {/* Image - Right side */}
            <motion.div
              className="w-full lg:w-1/2 relative order-1 lg:order-2"
              style={{
                y: imageY,
                opacity: imageOpacity,
              }}
            >
              <div className="relative h-[300px] md:h-[400px] lg:h-[500px] xl:h-[600px] w-full">
                {/* Enhanced background effect */}
                <div
                  className={`absolute inset-[5%] rounded-3xl bg-gradient-to-r ${currentAccentColor} opacity-15 
                filter blur-3xl transform scale-110 animate-pulse`}
                ></div>

                {/* Add a subtle vignette effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40 rounded-3xl"></div>

                {/* Light reflection effect */}
                <div className="absolute inset-0 overflow-hidden rounded-3xl z-10">
                  <div
                    className="absolute -inset-[400px] bg-gradient-to-br from-white/5 via-white/15 to-transparent 
                rotate-12 opacity-50 transform -translate-x-full animate-slow-slide"
                  ></div>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={`slide-image-${currentSlide}`}
                    initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 1.05, rotate: 2 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    {/* Image wrapper with additional effects */}
                    <div className="relative w-full h-full flex items-center justify-center">
                      <div className="relative w-[90%] h-[90%] overflow-hidden rounded-2xl">
                        {/* Gradient overlay for image edges */}
                        <div
                          className="absolute inset-0 rounded-2xl z-20 shadow-inner ring-1 ring-white/10 
                   bg-gradient-to-tr from-black/30 via-transparent to-black/20"
                        ></div>

                        <Image
                          src={featuredItems[currentSlide].image}
                          alt={featuredItems[currentSlide].alt}
                          fill
                          priority
                          style={{
                            objectFit: "cover",
                            objectPosition: "center",
                            filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.3))",
                          }}
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="z-10"
                        />
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black to-transparent z-20"></div>
    </section>
  );
};

export default HeroSection;
