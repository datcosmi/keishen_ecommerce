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
import { useSession } from "next-auth/react";
import { ParamValue } from "next/dist/server/request/params";

interface CartItems {
  cart_id: number | null;
  total_items: number;
}

interface RatingData {
  id_rating: number;
  user_id: number;
  prod_id: number;
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string | null;
  created_at: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

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
  const [selectedDetailIds, setSelectedDetailIds] = useState<number[]>([]);
  const [activeDiscount, setActiveDiscount] = useState<number>(0);
  const [originalPrice, setOriginalPrice] = useState<number>(0);
  const [discountedPrice, setDiscountedPrice] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const router = useRouter();

  // Ratings
  const [rating, setRating] = useState<number>(0);
  const [reviewCount, setReviewCount] = useState<number>(0);

  const [userRating, setUserRating] = useState<number | null>(null);
  const [userRatingId, setUserRatingId] = useState<number | null>(null);
  const [isSubmittingRating, setIsSubmittingRating] = useState<boolean>(false);
  const [showRatingModal, setShowRatingModal] = useState<boolean>(false);
  const [ratingHover, setRatingHover] = useState<number | null>(null);

  const [ratingCounts, setRatingCounts] = useState<Record<number, number>>({
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  });

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
      console.log("Cart items:", data);
    } catch (error) {
      console.error("Error fetching cart items:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRatings = async (productId: string | string[] | ParamValue) => {
    // Ensure productId is a string
    const idParam =
      typeof productId === "string"
        ? productId
        : Array.isArray(productId)
          ? productId[0]
          : String(productId);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/ratings/product/${idParam}/average`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch ratings");
      }
      const data = await response.json();
      setRating(data.average);
      setReviewCount(data.count);
    } catch (error) {
      console.error("Error fetching ratings:", error);
      // Fall back to default values
      setRating(0);
      setReviewCount(0);
    }
  };

  const fetchProductRatings = async (
    productId: string | string[] | ParamValue
  ) => {
    // Ensure productId is a string
    const idParam =
      typeof productId === "string"
        ? productId
        : Array.isArray(productId)
          ? productId[0]
          : String(productId);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/ratings/product/${idParam}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch product ratings");
      }
      const data = (await response.json()) as RatingData[];

      // Count ratings by star value
      const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      data.forEach((rating) => {
        if (rating.rating >= 1 && rating.rating <= 5) {
          counts[rating.rating as 1 | 2 | 3 | 4 | 5]++;
        }
      });

      setRatingCounts(counts);
    } catch (error) {
      console.error("Error fetching product ratings:", error);
    }
  };

  const fetchUserRating = async () => {
    if (!isAuthenticated || !user?.id_user) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/ratings/user/${user.id_user}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch user ratings");
      }

      const ratings = await response.json();

      // Find if user has rated this product
      const existingRating = ratings.find((r: any) => r.prod_id === Number(id));

      if (existingRating) {
        setUserRating(existingRating.rating);
        setUserRatingId(existingRating.id_rating);
      }
    } catch (error) {
      console.error("Error fetching user ratings:", error);
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
      console.log("Cart creation response:", data);

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
          product_detail_ids: selectedDetailIds, // Add the selected detail IDs
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
          console.log("Initial selected detail IDs:", initialDetailIds);

          fetchRatings(id);
          fetchProductRatings(id);
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
      fetchUserRating();
    }
  }, [user]);

  const submitRating = async (selectedRating: number) => {
    if (!isAuthenticated || !user) {
      toast.error("Por favor inicia sesión para calificar este producto");
      router.push("/login");
      return;
    }

    // Ensure id is properly type-cast as a number
    const productId =
      typeof id === "string"
        ? parseInt(id)
        : Array.isArray(id)
          ? parseInt(id[0])
          : null;

    if (productId === null) {
      toast.error("ID de producto inválido");
      return;
    }

    try {
      setIsSubmittingRating(true);

      // If there's an existing rating, update it
      if (userRatingId) {
        await updateRating(selectedRating);
      } else {
        // Otherwise create a new rating
        const currentDate = new Date().toISOString();

        const response = await fetch(`${API_BASE_URL}/api/ratings`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            user_id: user.id_user,
            prod_id: productId,
            rating: selectedRating,
            created_at: currentDate,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          if (
            data.error === "User has already rated this product" &&
            data.existing_rating
          ) {
            // If user has already rated, update our state with that information
            setUserRating(data.existing_rating.rating);
            setUserRatingId(data.existing_rating.id_rating);
            toast.info("Ya has calificado este producto anteriormente");
          } else {
            throw new Error(data.error || "Failed to submit rating");
          }
        } else {
          setUserRating(selectedRating);
          setUserRatingId(data.id_rating);
          toast.success("¡Gracias por tu calificación!");

          // Refresh the average rating
          fetchRatings(id);
        }
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
      toast.error("Error al enviar tu calificación");
    } finally {
      setIsSubmittingRating(false);
      setShowRatingModal(false);
    }
  };

  const updateRating = async (selectedRating: number) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/ratings/${userRatingId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            rating: selectedRating,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update rating");
      }

      setUserRating(selectedRating);
      toast.success("Tu calificación ha sido actualizada");

      // Refresh the average rating
      fetchRatings(id);
    } catch (error) {
      console.error("Error updating rating:", error);
      toast.error("Error al actualizar tu calificación");
    }
  };

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
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full h-10 w-10 z-10"
            onClick={prevImage}
            disabled={product.product_images.length <= 1}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full h-10 w-10 z-10"
            onClick={nextImage}
            disabled={product.product_images.length <= 1}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
          {product.product_images.length > 0 ? (
            <Image
              src={`${API_BASE_URL}${product.product_images[currentImageIndex].image_url}`}
              alt={product.product_name}
              fill
              priority
              className="object-cover transition-transform duration-300 z-0"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          ) : (
            <Image
              src={"/images/placeholder.png"}
              alt={product.product_name}
              fill
              priority
              className="object-cover transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, 50vw"
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

          {product.is_deleted && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-6">
              <strong>Este producto ya no está disponible.</strong> Ha sido
              retirado de nuestro catálogo.
            </div>
          )}

          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i < rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "fill-gray-200 text-gray-200"
                  }`}
                />
              ))}
            </div>
            <span className="text-gray-500">
              {rating > 0 ? rating.toFixed(1) : "Sin calificaciones"}{" "}
              {reviewCount > 0 ? `(${reviewCount} calificaciones)` : ""}
            </span>

            {/* New rating button */}
            <Button
              variant="outline"
              size="sm"
              className="ml-2"
              onClick={() => setShowRatingModal(true)}
              disabled={
                !isAuthenticated ||
                user?.role === "vendedor" ||
                user?.role === "superadmin" ||
                user?.role === "admin_tienda"
              }
            >
              {userRating ? "Editar calificación" : "Calificar producto"}
            </Button>
          </div>

          {/* Rating modal */}
          {showRatingModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <Card className="w-96 p-6">
                <h3 className="text-xl font-semibold mb-4">
                  {userRating
                    ? "Actualizar calificación"
                    : "Calificar este producto"}
                </h3>
                <div className="flex justify-center mb-6">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-10 w-10 cursor-pointer transition-all ${
                        (ratingHover || userRating || 0) >= star
                          ? "fill-yellow-400 text-yellow-400"
                          : "fill-gray-200 text-gray-200"
                      }`}
                      onMouseEnter={() => setRatingHover(star)}
                      onMouseLeave={() => setRatingHover(null)}
                      onClick={() => submitRating(star)}
                    />
                  ))}
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowRatingModal(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={() => submitRating(ratingHover || userRating || 5)}
                    disabled={isSubmittingRating}
                    className="bg-black hover:bg-gray-800"
                  >
                    {isSubmittingRating
                      ? "Enviando..."
                      : userRating
                        ? "Actualizar"
                        : "Enviar"}
                  </Button>
                </div>
              </Card>
            </div>
          )}

          <div className="mb-6">
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="mb-2">
                {product.category}
              </Badge>
              {/* Stock and availability information */}
              {product.is_deleted ? (
                <Badge variant="destructive" className="mb-2">
                  Producto no disponible
                </Badge>
              ) : (
                <Badge
                  variant={product.stock > 0 ? "outline" : "destructive"}
                  className="mb-2"
                >
                  {product.stock > 0 ? "En stock" : "Agotado"}
                </Badge>
              )}
            </div>
            <p className="text-gray-600">{product.description}</p>
          </div>

          {userRating && (
            <div className="mt-4 flex items-center">
              <span className="text-sm text-gray-600 mr-2">
                Tu calificación:
              </span>
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < userRating
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-gray-200 text-gray-200"
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {Object.keys(detailsByName).length > 0 && (
            <Separator className="my-6" />
          )}

          <div className="space-y-6">
            {Object.entries(detailsByName).map(([detailName, values]) => (
              <div key={detailName}>
                <h3 className="font-medium mb-3">{detailName}</h3>
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
                          className={`w-8 h-8 rounded-full p-0 ${
                            selectedDetails[detailName] === color
                              ? "ring-2 ring-black ring-offset-2"
                              : ""
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() =>
                            handleDetailSelection(detailName, color, detailId)
                          }
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
                          className="rounded-full"
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

            {/* Rating distribution */}
            <div className="mt-6 mb-8">
              <h3 className="font-medium mb-3">
                Distribución de calificaciones
              </h3>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((starValue) => (
                  <div key={starValue} className="flex items-center gap-2">
                    <div className="flex items-center min-w-[70px]">
                      {starValue}{" "}
                      <Star className="h-4 w-4 ml-1 fill-yellow-400 text-yellow-400" />
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full flex-grow">
                      <div
                        className="h-2 bg-yellow-400 rounded-full"
                        style={{
                          width: `${reviewCount > 0 ? (ratingCounts[starValue] / reviewCount) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm text-gray-500 min-w-[40px]">
                      {ratingCounts[starValue]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
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
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
