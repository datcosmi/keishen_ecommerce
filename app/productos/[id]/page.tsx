"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import NavbarWhite from "@/components/navbarWhite";

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

interface Discounts {
  categories: CategoryDiscount[];
  products: ProductDiscount[];
}

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
  inStock: boolean;
  categoryId: string;
  addedDate: string;
}

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedStrap, setSelectedStrap] = useState<string>("");
  const [discounts, setDiscounts] = useState<Discounts | null>(null);
  const [activeDiscount, setActiveDiscount] = useState<number>(0);
  const [originalPrice, setOriginalPrice] = useState<number>(0);
  const [discountedPrice, setDiscountedPrice] = useState<number>(0);
  const router = useRouter();

  useEffect(() => {
    if (id) {
      // Fetch product data
      fetch(`/api/products/${id}`)
        .then((res) => res.json())
        .then((data) => {
          setProduct(data);
          setOriginalPrice(data.price);
          if (data.sizes.length > 0) setSelectedSize(data.sizes[0]);
          if (data.colors.length > 0) setSelectedColor(data.colors[0]);
          if (data.straps.length > 0) setSelectedStrap(data.straps[0]);
        })
        .catch((err) => console.error(err));

      // Fetch discounts data
      fetch("/api/discounts")
        .then((res) => res.json())
        .then((discountData) => {
          setDiscounts(discountData);
        })
        .catch((err) => console.error("Error fetching discounts:", err));
    }
  }, [id]);

  // Calculate applicable discount
  useEffect(() => {
    if (product && discounts) {
      const currentDate = new Date().toISOString().split("T")[0];
      let highestDiscount = 0;

      // Check product specific discounts
      discounts.products.forEach((discount) => {
        if (
          discount.productId === product.id &&
          discount.startDate <= currentDate &&
          discount.endDate >= currentDate &&
          discount.discountPercentage > highestDiscount
        ) {
          highestDiscount = discount.discountPercentage;
        }
      });

      // Check category discounts
      discounts.categories.forEach((discount) => {
        if (
          discount.categoryId === product.categoryId &&
          discount.startDate <= currentDate &&
          discount.endDate >= currentDate &&
          discount.discountPercentage > highestDiscount
        ) {
          highestDiscount = discount.discountPercentage;
        }
      });

      setActiveDiscount(highestDiscount);

      if (highestDiscount > 0) {
        const discounted = product.price * (1 - highestDiscount / 100);
        setDiscountedPrice(Math.round(discounted));
      } else {
        setDiscountedPrice(0);
      }
    }
  }, [product, discounts]);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-gray-500">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <NavbarWhite />
      <div className="flex flex-row h-screen">
        {/* Image section */}
        <div className="w-1/2 h-[calc(100vh-100px)] fixed bottom-0 left-0 bg-gray-100 flex items-center justify-center">
          <Button
            variant="outline"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full h-10 w-10"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full h-10 w-10"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
          <Image
            src={product.image}
            alt={product.name}
            width={500}
            height={500}
            className="p-8"
          />

          {/* Discount badge if applicable */}
          {activeDiscount > 0 && (
            <Badge className="absolute top-8 right-8 bg-red-600 text-white hover:bg-red-700">
              {activeDiscount}% DESCUENTO
            </Badge>
          )}
        </div>

        {/* Product details */}
        <div className="w-1/2 ml-auto min-h-screen p-8 relative">
          <Button
            variant="link"
            className="text-yellow-500 hover:text-yellow-600 mb-6 p-0 h-auto"
            asChild
          >
            <Link href="/productos">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Ver todos los productos
            </Link>
          </Button>

          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>

          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i < product.rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "fill-gray-200 text-gray-200"
                  }`}
                />
              ))}
            </div>
            <span className="text-gray-500">
              {product.rating.toFixed(1)} ({product.reviews} calificaciones)
            </span>
          </div>

          <div className="mb-6">
            {product.brand && (
              <Badge variant="outline" className="mb-2">
                {product.brand}
              </Badge>
            )}
            <p className="text-gray-600">{product.description}</p>
          </div>

          {!product.sizes.length &&
          !product.colors.length &&
          !product.straps.length ? null : (
            <Separator className="my-6" />
          )}

          <div className="space-y-6">
            {product.sizes.length > 0 && (
              <div>
                <h3 className="font-medium mb-3">Talla</h3>
                <Select value={selectedSize} onValueChange={setSelectedSize}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Seleccionar talla" />
                  </SelectTrigger>
                  <SelectContent>
                    {product.sizes.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {product.colors.length > 0 && (
              <div>
                <h3 className="font-medium mb-3">Color</h3>
                <div className="flex gap-3">
                  {product.colors.map((color) => (
                    <Button
                      key={color}
                      variant="outline"
                      className={`w-8 h-8 rounded-full p-0 ${
                        selectedColor === color
                          ? "ring-2 ring-black ring-offset-2"
                          : ""
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setSelectedColor(color)}
                    />
                  ))}
                </div>
              </div>
            )}

            {product.straps.length > 0 && (
              <div>
                <h3 className="font-medium mb-3">Correa</h3>
                <div className="flex gap-3 flex-wrap">
                  {product.straps.map((strap) => (
                    <Button
                      key={strap}
                      variant={selectedStrap === strap ? "default" : "outline"}
                      className="rounded-full"
                      onClick={() => setSelectedStrap(strap)}
                    >
                      {strap}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Stock information */}
          <div className="mt-6">
            <Badge
              variant={product.inStock ? "outline" : "destructive"}
              className="mb-2"
            >
              {product.inStock ? "En stock" : "Agotado"}
            </Badge>
          </div>

          {/* Price and buttons */}
          <Card className="fixed bottom-8 right-8 w-[calc(50%-4rem)]">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-input shadow-sm rounded-md">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-r-none"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={!product.inStock}
                    >
                      -
                    </Button>
                    <div className="px-4 py-2">{quantity}</div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-l-none"
                      onClick={() => setQuantity(quantity + 1)}
                      disabled={!product.inStock}
                    >
                      +
                    </Button>
                  </div>
                  <div className="flex flex-col">
                    {activeDiscount > 0 ? (
                      <>
                        <span className="text-xl font-bold text-red-600">
                          ${discountedPrice.toLocaleString()}.00
                        </span>
                        <span className="text-sm text-gray-500 line-through">
                          ${originalPrice.toLocaleString()}.00
                        </span>
                      </>
                    ) : (
                      <span className="text-xl font-bold">
                        ${product.price.toLocaleString()}.00
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  className="bg-black hover:bg-gray-800"
                  disabled={!product.inStock}
                >
                  {product.inStock ? "Añadir al carrito" : "Agotado"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
