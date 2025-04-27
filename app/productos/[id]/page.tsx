"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  ShoppingCart,
  Share2,
  Minus,
  Plus,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import NavbarWhite from "@/components/navbarWhite";
import { ProductData } from "@/types/productTypes";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { CartItems } from "@/types/cartTypes";
import RatingSection from "@/components/ratingSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductImagesSection from "@/components/productImagesSection";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<ProductData | null>(null);
  const [cartItems, setCartItems] = useState<CartItems>({
    cart_id: null,
    total_items: 0,
  });
  const [quantity, setQuantity] = useState(1);
  const [selectedDetails, setSelectedDetails] = useState<
    Record<string, string>
  >({});
  const [selectedDetailIds, setSelectedDetailIds] = useState<number[]>([]);
  const [activeDiscount, setActiveDiscount] = useState<number>(0);
  const [originalPrice, setOriginalPrice] = useState<number>(0);
  const [discountedPrice, setDiscountedPrice] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const router = useRouter();

  // Authentication
  const { isAuthenticated, user } = useAuth();
  const { data: session } = useSession();
  const token = session?.accessToken;

  const fetchCartItems = async () => {
    try {
      setIsLoading(true);
      if (!user?.id_user) return;

      const response = await fetch(
        `${API_BASE_URL}/api/cart/user/${user.id_user}/count`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch cart items");
      }
      const data = await response.json();
      setCartItems(data);
    } catch (error) {
      console.error("Error fetching cart items:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new cart
  const createCart = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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
      return data.id || data.cart_id || data.id_cart;
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

    if (product.is_deleted) {
      toast.error("Este producto ya no está disponible");
      return;
    }

    try {
      setIsAddingToCart(true);
      let currentCartId = cartItems.cart_id;

      // If no cart exists, create one
      if (!currentCartId) {
        currentCartId = await createCart();
      }

      // Add product to cart with selected details
      const response = await fetch(`${API_BASE_URL}/api/cart/product`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          cart_id: currentCartId,
          prod_id: id,
          amount: quantity,
          product_detail_ids: selectedDetailIds,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add product to cart");
      }

      // Refresh cart count
      await fetchCartItems();
      toast.success("Producto agregado al carrito", {
        action: {
          label: "Ver carrito",
          onClick: () => router.push("/carrito"),
        },
      });
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
      fetch(`${API_BASE_URL}/api/product/${id}/full-details`)
        .then((res) => res.json())
        .then((data: ProductData) => {
          setProduct(data);
          setOriginalPrice(data.price);

          // Initialize selected details
          const initialDetails: Record<string, string> = {};
          const initialDetailIds: number[] = [];

          // Group details by name to get unique detail names
          const detailNames = [
            ...new Set(data.product_details.map((d) => d.detail_name)),
          ];

          // For each detail name, select the first available option
          detailNames.forEach((name) => {
            const firstDetail = data.product_details.find(
              (d) => d.detail_name === name
            );
            if (firstDetail) {
              initialDetails[name] = firstDetail.detail_desc;
              initialDetailIds.push(firstDetail.detail_id);
            }
          });

          setSelectedDetails(initialDetails);
          setSelectedDetailIds(initialDetailIds);
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

  const shareProduct = () => {
    if (navigator.share) {
      navigator
        .share({
          title: product?.product_name || "Producto",
          text: product?.description || "Mira este producto",
          url: window.location.href,
        })
        .then(() => toast.success("¡Compartido exitosamente!"))
        .catch((error) => toast.error("Error al compartir"));
    } else {
      navigator.clipboard
        .writeText(window.location.href)
        .then(() => toast.success("Enlace copiado al portapapeles"))
        .catch(() => toast.error("Error al copiar enlace"));
    }
  };

  // Helper function to determine if a detail is a color
  const isColorDetail = (detailName: string): boolean => {
    return detailName.toLowerCase() === "color";
  };

  // Handle detail selection
  const handleDetailSelection = (
    detailName: string,
    value: string,
    detailId: number
  ) => {
    setSelectedDetails((prev) => ({
      ...prev,
      [detailName]: value,
    }));

    setSelectedDetailIds((prevIds) => {
      // Create a new array by removing any previous IDs for this detail type
      const updatedIds = [...prevIds];

      // Find the index of any detail of the same type
      const indexToRemove = product?.product_details.findIndex(
        (detail) =>
          detail.detail_name === detailName &&
          updatedIds.includes(detail.detail_id)
      );

      // If found, remove it
      if (indexToRemove !== -1 && indexToRemove !== undefined && product) {
        const idToRemove = product.product_details[indexToRemove].detail_id;
        const removeIndex = updatedIds.indexOf(idToRemove);
        if (removeIndex !== -1) {
          updatedIds.splice(removeIndex, 1);
        }
      }

      // Add the new ID
      return [...updatedIds, detailId];
    });
  };

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Cargando producto...</p>
        </div>
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

      {/* Mobile breadcrumb - only visible on small screens */}
      <div className="md:hidden p-4 bg-white shadow-sm sticky top-0 z-10">
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center text-gray-700"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Regresar
        </Button>
      </div>

      <div className="flex flex-col md:flex-row min-h-[calc(100vh-64px)]">
        {/* Image section */}
        <ProductImagesSection
          product={product}
          activeDiscount={activeDiscount}
          API_BASE_URL={API_BASE_URL}
        />

        {/* Product details */}
        <div className="w-full md:w-1/2 p-5 md:p-8 lg:p-12 flex flex-col">
          <div className="sticky top-0 bg-white pt-4 pb-2 z-10 hidden md:block">
            <Button
              variant="link"
              className="text-yellow-500 hover:text-yellow-600 mb-2 p-0 h-auto"
              onClick={() => router.back()}
            >
              <span className="flex items-center">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Regresar a la tienda
              </span>
            </Button>
          </div>

          {/* Product name and badges */}
          <div className="mb-6">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge variant="outline" className="bg-gray-50">
                {product.category}
              </Badge>

              {/* Stock and availability information */}
              {product.is_deleted ? (
                <Badge variant="destructive">Producto no disponible</Badge>
              ) : (
                <Badge
                  variant={product.stock > 0 ? "default" : "destructive"}
                  className={
                    product.stock > 0
                      ? "bg-green-100 text-green-800 hover:bg-green-200"
                      : ""
                  }
                >
                  {product.stock > 0 ? "En stock" : "Agotado"}
                </Badge>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-bold mb-4">
              {product.product_name}
            </h1>

            {/* Rating summary */}
            <RatingSection productId={id} API_BASE_URL={API_BASE_URL} />
          </div>

          {/* Product deleted warning */}
          {product.is_deleted && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">
                    Este producto ya no está disponible. Ha sido retirado de
                    nuestro catálogo.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Price display */}
          <div className="flex items-center gap-3 mb-6">
            {activeDiscount > 0 ? (
              <>
                <span className="text-2xl md:text-3xl font-bold text-red-600">
                  ${discountedPrice.toLocaleString()}.00
                </span>
                <span className="text-lg text-gray-500 line-through">
                  ${originalPrice.toLocaleString()}.00
                </span>
              </>
            ) : (
              <span className="text-2xl md:text-3xl font-bold">
                ${product.price.toLocaleString()}.00
              </span>
            )}
          </div>

          {/* Tabs for product info */}
          <Tabs defaultValue="details" className="w-full my-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Detalles</TabsTrigger>
              <TabsTrigger value="description">Descripción</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-4">
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  {product.description}
                </p>
              </div>
            </TabsContent>

            <TabsContent value="details" className="mt-4 space-y-6">
              {Object.entries(detailsByName).map(([detailName, values]) => (
                <div key={detailName}>
                  <h3 className="font-medium mb-3 text-gray-800">
                    {detailName}
                  </h3>
                  {isColorDetail(detailName) ? (
                    <div className="flex gap-3">
                      {values.map((color) => {
                        // Find the detail object to get its ID
                        const detailObj = product.product_details.find(
                          (d) =>
                            d.detail_name === detailName &&
                            d.detail_desc === color
                        );
                        const detailId = detailObj ? detailObj.detail_id : 0;

                        return (
                          <Button
                            key={color}
                            variant="outline"
                            className={`w-10 h-10 rounded-full p-0 transition-all duration-200 ${
                              selectedDetails[detailName] === color
                                ? "ring-2 ring-yellow-500 ring-offset-2 scale-110"
                                : ""
                            }`}
                            style={{ backgroundColor: color }}
                            onClick={() =>
                              handleDetailSelection(detailName, color, detailId)
                            }
                            title={color}
                          />
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex gap-3 flex-wrap">
                      {values.map((value) => {
                        // Find the detail object to get its ID
                        const detailObj = product.product_details.find(
                          (d) =>
                            d.detail_name === detailName &&
                            d.detail_desc === value
                        );
                        const detailId = detailObj ? detailObj.detail_id : 0;

                        return (
                          <Button
                            key={value}
                            variant={
                              selectedDetails[detailName] === value
                                ? "default"
                                : "outline"
                            }
                            className={`rounded-full transition-all ${
                              selectedDetails[detailName] === value
                                ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                                : "hover:border-yellow-500 hover:text-yellow-600"
                            }`}
                            onClick={() =>
                              handleDetailSelection(detailName, value, detailId)
                            }
                          >
                            {value}
                          </Button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </TabsContent>
          </Tabs>

          <Separator className="my-6" />

          {/* Action buttons */}
          <div className="mt-auto">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                {/* Quantity selector */}
                <div className="flex items-center border border-gray-200 rounded-full overflow-hidden shadow-sm">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-none h-10 w-10 hover:bg-gray-100"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={product.stock <= 0 || product.is_deleted}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <div className="w-12 text-center">{quantity}</div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-none h-10 w-10 hover:bg-gray-100"
                    onClick={() =>
                      setQuantity(Math.min(product.stock, quantity + 1))
                    }
                    disabled={product.stock <= 0 || product.is_deleted}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full"
                    onClick={shareProduct}
                  >
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Add to cart button */}
              <Button
                className={`w-full py-6 text-lg rounded-full transition-all duration-300 shadow-md ${
                  product.stock <= 0 || product.is_deleted
                    ? "bg-gray-400 hover:bg-gray-500 cursor-not-allowed"
                    : "bg-yellow-500 hover:bg-yellow-600 hover:shadow-lg active:scale-98"
                }`}
                disabled={
                  product.stock <= 0 ||
                  isAddingToCart ||
                  product.is_deleted ||
                  user?.role === "vendedor" ||
                  user?.role === "superadmin" ||
                  user?.role === "admin_tienda"
                }
                onClick={addToCart}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {isAddingToCart
                  ? "Agregando..."
                  : product.is_deleted
                    ? "No disponible"
                    : user?.role === "vendedor" ||
                        user?.role === "superadmin" ||
                        user?.role === "admin_tienda"
                      ? "No puedes agregar productos al carrito"
                      : product.stock > 0
                        ? "Añadir al carrito"
                        : "Agotado"}
              </Button>

              {/* Additional product information */}
              {!product.is_deleted && product.stock > 0 && (
                <p className="text-sm text-gray-500 text-center mt-2">
                  Solo quedan {product.stock} unidades disponibles
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
