import { NextResponse } from "next/server";

interface Product {
  id: string;
  name: string;
  brand: string;
  description: string;
  price: number;
  rating: number;
  reviews: number;
  sizes: string[];
  colors: string[];
  straps: string[];
  image: string;
}

const mockProducts: Product[] = [
  {
    id: "1",
    name: "Reloj para Hombre",
    brand: "Rolex",
    description:
      "Elegante y sofisticado, este reloj para hombre combina diseño moderno con funcionalidad excepcional.",
    price: 3500,
    rating: 4.0,
    reviews: 121,
    sizes: ["XL", "L", "M", "S"],
    colors: ["#000000", "#ffffff", "#ff0000"],
    straps: ["Acero inoxidable", "Cuero", "Silicona"],
    image: "/images/reloj-hombre.png",
  },
  {
    id: "2",
    name: "Otro Reloj",
    brand: "Seiko",
    description: "Otro modelo de reloj para probar la API mock.",
    price: 2800,
    rating: 4.5,
    reviews: 90,
    sizes: ["XL", "M"],
    colors: ["#0000ff", "#ffff00"],
    straps: ["Acero inoxidable", "Silicona"],
    image: "/images/otro-reloj.png",
  },
  {
    id: "3",
    name: "Gorra Deportiva",
    brand: "Nike",
    description:
      "Gorra ajustable con diseño transpirable ideal para actividades deportivas.",
    price: 50,
    rating: 4.7,
    reviews: 200,
    sizes: [],
    colors: ["#000000", "#ff0000", "#008000"],
    straps: [],
    image: "/images/gorra-nike.png",
  },
  {
    id: "4",
    name: "Pulsera de Plata",
    brand: "Pandora",
    description:
      "Elegante pulsera de plata con detalles finos y acabados premium.",
    price: 120,
    rating: 4.9,
    reviews: 320,
    sizes: [],
    colors: ["#c0c0c0"],
    straps: [],
    image: "/images/pulsera-plata.png",
  },
  {
    id: "5",
    name: "Camiseta Casual",
    brand: "Adidas",
    description: "Camiseta cómoda y ligera, perfecta para uso diario.",
    price: 35,
    rating: 4.6,
    reviews: 150,
    sizes: ["S", "M", "L", "XL"],
    colors: ["#ffffff", "#000000", "#0000ff"],
    straps: [],
    image: "/images/camiseta-adidas.png",
  },
  {
    id: "6",
    name: "Anillo de Oro",
    brand: "Cartier",
    description:
      "Anillo de oro con diseño exclusivo para ocasiones especiales.",
    price: 750,
    rating: 5.0,
    reviews: 80,
    sizes: [],
    colors: ["#ffd700"],
    straps: [],
    image: "/images/anillo-oro.png",
  },
];

export async function GET() {
  return NextResponse.json(mockProducts);
}
