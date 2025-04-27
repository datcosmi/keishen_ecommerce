"use client";
import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";
import { motion } from "framer-motion";
import NavbarBlack from "@/components/navbarBlack";
import Footer from "@/components/footer";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  // Suggested links for the user
  const suggestedLinks = [
    { name: "Inicio", path: "/" },
    { name: "Productos", path: "/productos" },
    { name: "Sobre Nosotros", path: "/contacto#sobre-nosotros" },
    { name: "Contacto", path: "/contacto" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <NavbarBlack />

      <main className="flex-grow flex items-center justify-center py-16 px-4">
        <div className="max-w-5xl w-full mx-auto">
          {mounted && (
            <motion.div
              className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              {/* Left Side - Image */}
              <motion.div
                variants={itemVariants}
                className="flex justify-center lg:justify-end"
              >
                <div className="relative">
                  <div className="absolute -top-6 -left-6 w-24 h-24 bg-yellow-400 rounded-tl-3xl z-0"></div>
                  <div className="relative z-10 overflow-hidden rounded-xl border-4 border-white shadow-2xl">
                    <Image
                      src="/images/black-bg.png"
                      alt="Página no encontrada"
                      width={500}
                      height={500}
                      className="w-80 h-80 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <h1 className="text-9xl font-bold text-white">404</h1>
                    </div>
                  </div>
                  <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-black rounded-br-3xl z-0"></div>
                </div>
              </motion.div>

              {/* Right Side - Content */}
              <motion.div
                variants={itemVariants}
                className="text-center lg:text-left"
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Página No Encontrada
                </h2>
                <div className="h-1 w-24 bg-yellow-400 mb-6 mx-auto lg:mx-0"></div>
                <p className="text-lg text-gray-600 mb-8">
                  Lo sentimos, la página que estás buscando no existe o ha sido
                  movida. Te invitamos a explorar otras secciones de nuestra
                  boutique.
                </p>

                {/* Navigation Options */}
                <div className="flex flex-col gap-6">
                  <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                    <Link
                      href="/"
                      className="bg-black text-white px-6 py-3 rounded-lg font-medium flex items-center hover:bg-gray-800 transition-colors"
                    >
                      <Home className="w-5 h-5 mr-2" />
                      Volver al Inicio
                    </Link>
                    <Button
                      onClick={() => router.back()}
                      className="bg-transparent border-2 border-black text-black px-6 py-3 rounded-lg font-medium hover:bg-black hover:text-white transition-colors flex items-center h-full"
                    >
                      <ArrowLeft className="w-5 h-5 mr-2" />
                      Regresar
                    </Button>
                  </div>

                  {/* Suggested Links */}
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-3">O visita:</h3>
                    <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                      {suggestedLinks.map((link, index) => (
                        <Link
                          key={index}
                          href={link.path}
                          className="px-4 py-2 bg-gray-100 hover:bg-yellow-400 hover:text-black transition-colors rounded-lg"
                        >
                          {link.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </div>
      </main>

      {/* Search Bar Section */}
      {mounted && (
        <motion.section
          className="py-16 bg-gray-50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <div className="max-w-3xl mx-auto px-4">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-4">
                ¿Buscas algo específico?
              </h3>
              <p className="text-gray-600">
                Utiliza nuestro buscador para encontrar lo que necesitas
              </p>
            </div>
            <div className="flex">
              <input
                type="text"
                className="flex-grow px-4 py-3 rounded-l-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all"
                placeholder="¿Qué estás buscando?"
              />
              <button className="bg-black text-white px-6 py-3 rounded-r-lg font-medium hover:bg-gray-800 transition-colors">
                Buscar
              </button>
            </div>
          </div>
        </motion.section>
      )}

      <Footer />
    </div>
  );
}
