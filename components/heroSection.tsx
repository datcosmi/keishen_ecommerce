"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useState } from "react";
import { useInView } from "react-intersection-observer";
import { Button } from "./ui/button";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const HeroSection = () => {
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

  // Referencia para el efecto de parallax
  const [heroRef, setHeroRef] = useState<HTMLElement | null>(null);

  const setRefs = (element: HTMLElement | null) => {
    setHeroRef(element);
    if (inViewRef) {
      inViewRef(element);
    }
  };

  return (
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
  );
};

export default HeroSection;
