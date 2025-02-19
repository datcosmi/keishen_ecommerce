"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useInView } from "react-intersection-observer";
import NavbarBlack from "./components/navbarBlack";

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

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error(err));
  }, []);

  const totalPages = Math.ceil(products.length / productsPerPage);
  const paginatedProducts = products.slice(
    currentPage * productsPerPage,
    (currentPage + 1) * productsPerPage
  );

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const { ref: heroRef, inView: heroInView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <div className="min-h-screen bg-black">
      <NavbarBlack />

      {/* Hero Section */}
      <section ref={heroRef} className="relative pt-24 px-8">
        <div className="absolute bottom-[-34%] left-0 w-full flex justify-center z-0">
          {" "}
          <span className="text-[20rem] font-extrabold text-center tracking-tighter opacity-50 font-bold text-transparent bg-clip-text bg-gradient-to-t from-[#808080] to-black">
            KEISHEN
          </span>
        </div>

        <div
          className={`max-w-6xl mx-auto transition-all duration-700 ${
            heroInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="w-1/2 pt-16">
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
                <span>Ver todo</span>
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
            </div>
            <div className="w-1/2 relative">
              <div className="relative w-full min-h-[600px]">
                <Image
                  src="/watch.png"
                  alt="Fashion Model"
                  layout="fill"
                  objectFit="contain"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brands Section */}
      <div className="mt-16 py-8 bg-yellow-300 relative z-20">
        {" "}
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
      <section className="py-16 px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-black mb-8">
            VISTE CON ESTILO
          </h2>
          <div className="grid grid-cols-3 gap-8">
            {paginatedProducts.map((product) => (
              <Link
                href={`/product/${product.id}`}
                key={product.id}
                className="group cursor-pointer"
              >
                <div className="w-full h-64 flex items-center justify-center bg-gray-100 rounded-xl overflow-hidden">
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={300}
                    height={300}
                    className="object-contain w-full h-full"
                  />
                </div>

                <h3 className="text-sm font-medium text-black">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-500">${product.price}</p>
              </Link>
            ))}
          </div>

          {/* Controles de paginación */}
          <div className="flex justify-center mt-8 space-x-4">
            <button
              onClick={prevPage}
              disabled={currentPage === 0}
              className={`px-4 py-2 rounded-full ${
                currentPage === 0
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-yellow-300 hover:bg-yellow-400"
              }`}
            >
              ← Anterior
            </button>
            <button
              onClick={nextPage}
              disabled={currentPage === totalPages - 1}
              className={`px-4 py-2 rounded-full ${
                currentPage === totalPages - 1
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-yellow-300 hover:bg-yellow-400"
              }`}
            >
              Siguiente →
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
