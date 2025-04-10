"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import NavbarWhite from "@/components/navbarWhite";
import { ProductData } from "@/types/productTypes";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface CartItems {
  cart_id: number | null;
  total_items: number;
}

const API_BASE_URL = "http://localhost:3001/api";

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<ProductData | null>(null);
  const [cartItems, setCartItems] = useState<CartItems>({
    cart_id: null,
    total_items: 0,
  });
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedDetails, setSelectedDetails] = useState<
    Record<string, string>
  >({});
  const [activeDiscount, setActiveDiscount] = useState<number>(0);
  const [originalPrice, setOriginalPrice] = useState<number>(0);
  const [discountedPrice, setDiscountedPrice] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const router = useRouter();

  // Default rating values since not implemented yet
  const defaultRating = 4.5;
  const defaultReviews = 18;

  // Authentication
  const { isAuthenticated, user } = useAuth();

  const fetchCartItems = async () => {
    try {
      setIsLoading(true);
      if (!user?.id_user) return;

      const response = await fetch(
        `${API_BASE_URL}/cart/user/${user.id_user}/count`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch cart items");
      }
      const data = await response.json();
      setCartItems(data);
      console.log("Cart items:", data);
    } catch (error) {
      console.error("Error fetching cart items:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new cart
  const createCart = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user?.id_user,
          status: "pendiente",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create cart");
      }

      const data = await response.json();
      return data.id_cart; // Assuming the returned cart ID field name
    } catch (error) {
      console.error("Error creating cart:", error);
      throw error;
    }
  };

  // Add product to cart
  const addToCart = async () => {
    if (!isAuthenticated || !user) {
      toast.error("Por favor inicia sesión para agregar productos al carrito");
      router.push("/login");
      return;
    }

    if (!product) {
      toast.error("Producto no disponible");
      return;
    }

    try {
      setIsAddingToCart(true);
      let currentCartId = cartItems.cart_id;

      // If no cart exists, create one
      if (!currentCartId) {
        currentCartId = await createCart();
      }

      // Add product to cart
      const response = await fetch(`${API_BASE_URL}/cart/product`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cart_id: currentCartId,
          prod_id: id,
          amount: quantity,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add product to cart");
      }

      // Refresh cart count
      await fetchCartItems();
      toast.success("Producto agregado al carrito");
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Error al agregar el producto al carrito");
    } finally {
      setIsAddingToCart(false);
    }
  };

  useEffect(() => {
    if (id) {
      // Fetch product data
      fetch(`${API_BASE_URL}/product/${id}/full-details`)
        .then((res) => res.json())
        .then((data: ProductData) => {
          setProduct(data);
          setOriginalPrice(data.price);

          // Initialize selected details
          const initialDetails: Record<string, string> = {};
          data.product_details.forEach((detail) => {
            initialDetails[detail.detail_name] = detail.detail_desc;
          });
          setSelectedDetails(initialDetails);
        })
        .catch((err) => {
          console.error(err);
          toast.error("Error al cargar el producto");
        });
    }
  }, [id]);

  useEffect(() => {
    if (user?.id_user) {
      fetchCartItems();
    }
  }, [user]);

  // Calculate applicable discount
  useEffect(() => {
    if (product) {
      const currentDate = new Date().toISOString();
      let highestDiscount = 0;

      // Check product specific discounts
      product.discount_product.forEach((discount) => {
        if (
          discount.start_date_discount <= currentDate &&
          discount.end_date_discount >= currentDate &&
          discount.percent_discount > highestDiscount
        ) {
          highestDiscount = discount.percent_discount;
        }
      });

      // Check category discounts
      product.discount_category.forEach((discount) => {
        if (
          discount.start_date_discount <= currentDate &&
          discount.end_date_discount >= currentDate &&
          discount.percent_discount > highestDiscount
        ) {
          highestDiscount = discount.percent_discount;
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
  }, [product]);

  const nextImage = () => {
    if (product && product.product_images.length > 0) {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === product.product_images.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  const prevImage = () => {
    if (product && product.product_images.length > 0) {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === 0 ? product.product_images.length - 1 : prevIndex - 1
      );
    }
  };

  // Helper function to determine if a detail is a color
  const isColorDetail = (detailName: string): boolean => {
    return detailName.toLowerCase() === "color";
  };

  // Handle detail selection
  const handleDetailSelection = (detailName: string, value: string) => {
    setSelectedDetails((prev) => ({
      ...prev,
      [detailName]: value,
    }));
  };

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-gray-500">Cargando...</p>
      </div>
    );
  }

  // Group details by their names for display
  const detailsByName: Record<string, string[]> = {};
  product.product_details.forEach((detail) => {
    if (!detailsByName[detail.detail_name]) {
      detailsByName[detail.detail_name] = [];
    }
    if (!detailsByName[detail.detail_name].includes(detail.detail_desc)) {
      detailsByName[detail.detail_name].push(detail.detail_desc);
    }
  });

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
            onClick={prevImage}
            disabled={product.product_images.length <= 1}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full h-10 w-10"
            onClick={nextImage}
            disabled={product.product_images.length <= 1}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
          {product.product_images.length > 0 ? (
            <Image
              src={`http://localhost:3001${product.product_images[currentImageIndex].image_url}`}
              alt={product.product_name}
              width={500}
              height={500}
              className="p-8"
              priority
            />
          ) : (
            <Image
              src={"/images/placeholder.png"}
              alt={product.product_name}
              width={500}
              height={500}
              className="p-8"
              priority
            />
          )}

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
            onClick={() => router.back()}
          >
            <span className="flex items-center">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Regresar a la tienda
            </span>
          </Button>

          <h1 className="text-3xl font-bold mb-2">{product.product_name}</h1>

          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i < defaultRating
                      ? "fill-yellow-400 text-yellow-400"
                      : "fill-gray-200 text-gray-200"
                  }`}
                />
              ))}
            </div>
            <span className="text-gray-500">
              {defaultRating.toFixed(1)} ({defaultReviews} calificaciones)
            </span>
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="mb-2">
                {product.category}
              </Badge>
              {/* Stock information */}
              <Badge
                variant={product.stock > 0 ? "outline" : "destructive"}
                className="mb-2"
              >
                {product.stock > 0 ? "En stock" : "Agotado"}
              </Badge>
            </div>
            <p className="text-gray-600">{product.description}</p>
          </div>

          {Object.keys(detailsByName).length > 0 && (
            <Separator className="my-6" />
          )}

          <div className="space-y-6">
            {Object.entries(detailsByName).map(([detailName, values]) => (
              <div key={detailName}>
                <h3 className="font-medium mb-3">{detailName}</h3>
                {isColorDetail(detailName) ? (
                  <div className="flex gap-3">
                    {values.map((color) => (
                      <Button
                        key={color}
                        variant="outline"
                        className={`w-8 h-8 rounded-full p-0 ${
                          selectedDetails[detailName] === color
                            ? "ring-2 ring-black ring-offset-2"
                            : ""
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => handleDetailSelection(detailName, color)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex gap-3 flex-wrap">
                    {values.map((value) => (
                      <Button
                        key={value}
                        variant={
                          selectedDetails[detailName] === value
                            ? "default"
                            : "outline"
                        }
                        className="rounded-full"
                        onClick={() => handleDetailSelection(detailName, value)}
                      >
                        {value}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            ))}
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
                      disabled={product.stock <= 0}
                    >
                      -
                    </Button>
                    <div className="px-4 py-2">{quantity}</div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-l-none"
                      onClick={() =>
                        setQuantity(Math.min(product.stock, quantity + 1))
                      }
                      disabled={product.stock <= 0}
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
                  disabled={product.stock <= 0 || isAddingToCart}
                  onClick={addToCart}
                >
                  {isAddingToCart
                    ? "Agregando..."
                    : product.stock > 0
                    ? "Añadir al carrito"
                    : "Agotado"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
