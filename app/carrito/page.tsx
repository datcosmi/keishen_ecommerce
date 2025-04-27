"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { TrashIcon } from "@heroicons/react/24/outline";
import NavbarWhite from "@/components/navbarWhite";
import Footer from "@/components/footer";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import SimilarProducts from "@/components/similarProducts";

interface CartItem {
  id: number;
  type: string;
  name: string;
  variant?: string;
  price: number;
  quantity: number;
  image: string;
  product_id: number;
  cart_item_id: number;
  discount_percent: number;
  variants?: { id_pd: number; detail_name: string; detail_desc: string }[];
}

interface CartSummary {
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function CartPage() {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartSummary, setCartSummary] = useState<CartSummary>({
    subtotal: 0,
    shipping: 0,
    discount: 0,
    total: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Get token from session
  const { data: session } = useSession();
  const token = session?.accessToken;

  const fetchCart = async () => {
    if (!user?.id_user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/api/cart/user/${user.id_user}/full-details`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error al cargar el carrito");
      }

      const data = await response.json();

      if (data.length === 0) {
        setCartItems([]);
        updateCartSummary([]);
        setIsLoading(false);
        return;
      }

      const activeCart = data.find((cart: any) => cart.status === "pendiente");

      if (!activeCart) {
        // No active carts found
        setCartItems([]);
        updateCartSummary([]);
        setIsLoading(false);
        return;
      }

      // Process the active cart data
      const cartData = activeCart;

      // Check if cart status is "finalizado" (completed)
      if (cartData.status === "finalizado") {
        setCartItems([]);
        updateCartSummary([]);
        setIsLoading(false);
        return;
      }

      // Transform cart items to match our interface
      const transformedItems = cartData.items.map((item: any) => {
        const product = item.product;

        // Calculate highest applicable discount
        let discountPercent = 0;
        if (product.product_discounts && product.product_discounts.length > 0) {
          // Find valid product discounts
          const validProductDiscounts = product.product_discounts.filter(
            (d: any) => {
              const startDate = new Date(d.start_date);
              const endDate = new Date(d.end_date);
              const now = new Date();
              return now >= startDate && now <= endDate;
            }
          );

          if (validProductDiscounts.length > 0) {
            // Get highest discount
            discountPercent = Math.max(
              ...validProductDiscounts.map((d: any) => d.percent)
            );
          }
        }

        if (
          discountPercent === 0 &&
          product.category_discounts &&
          product.category_discounts.length > 0
        ) {
          // Find valid category discounts if no product discount
          const validCategoryDiscounts = product.category_discounts.filter(
            (d: any) => {
              const startDate = new Date(d.start_date);
              const endDate = new Date(d.end_date);
              const now = new Date();
              return now >= startDate && now <= endDate;
            }
          );

          if (validCategoryDiscounts.length > 0) {
            // Get highest discount
            discountPercent = Math.max(
              ...validCategoryDiscounts.map((d: any) => d.percent)
            );
          }
        }

        // Use first image or placeholder
        const image =
          product.product_images && product.product_images.length > 0
            ? product.product_images[0]
            : "/images/placeholder.png";

        const variants = product.variantes || [];

        return {
          id: product.product_id,
          product_id: product.product_id,
          cart_item_id: item.id_item,
          type: product.category,
          name: product.product_name,
          price: product.product_unit_price,
          quantity: item.amount,
          discount_percent: discountPercent,
          image: image,
          variants: variants,
        };
      });

      setCartItems(transformedItems);
      updateCartSummary(transformedItems);
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching cart:", err);
      setError("No se pudo cargar el carrito. Inténtalo más tarde.");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user?.id_user]);

  const updateCartSummary = (items: CartItem[]) => {
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const discountAmount = items.reduce((sum, item) => {
      return sum + (item.price * item.quantity * item.discount_percent) / 100;
    }, 0);

    const shipping = 0; // You can set shipping cost based on your business logic

    setCartSummary({
      subtotal,
      shipping,
      discount: discountAmount,
      total: subtotal + shipping - discountAmount,
    });
  };

  const updateQuantity = async (id: number, increment: boolean) => {
    try {
      const item = cartItems.find((item) => item.cart_item_id === id);
      if (!item) return;

      const newQuantity = increment
        ? item.quantity + 1
        : Math.max(1, item.quantity - 1);

      // Update quantity in API
      const response = await fetch(`${API_BASE_URL}/api/cart/${id}/product`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: newQuantity }),
      });

      if (!response.ok) {
        throw new Error("No se pudo actualizar la cantidad");
      }

      // Update local state
      setCartItems((items) =>
        items.map((item) => {
          if (item.cart_item_id === id) {
            return { ...item, quantity: newQuantity };
          }
          return item;
        })
      );

      // Update cart summary
      updateCartSummary(
        cartItems.map((item) => {
          if (item.cart_item_id === id) {
            return { ...item, quantity: newQuantity };
          }
          return item;
        })
      );
    } catch (err) {
      console.error("Error updating quantity:", err);
      toast.error("No se pudo actualizar la cantidad. Inténtalo más tarde.");
    }
  };

  const removeItem = async (id: number) => {
    try {
      // Delete item from API
      const response = await fetch(`${API_BASE_URL}/api/cart/${id}/product`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("No se pudo eliminar el producto");
      }

      // Update local state
      const updatedItems = cartItems.filter((item) => item.cart_item_id !== id);
      setCartItems(updatedItems);

      // Update cart summary
      updateCartSummary(updatedItems);

      toast.success("Producto eliminado del carrito");
    } catch (err) {
      console.error("Error removing item:", err);
      toast.error("No se pudo eliminar el producto. Inténtalo más tarde.");
    }
  };

  const handleCheckout = async () => {
    try {
      if (!user?.id_user) {
        toast.error("Debes iniciar sesión para continuar");
        return;
      }

      // Here you would call your checkout API endpoint
      // For example:
      // const response = await fetch(`http://localhost:3001/api/checkout/${user.id_user}`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ cartItems, cartSummary }),
      // });

      // Placeholder for checkout functionality
      toast.info("Redirigiendo al proceso de pago...");

      // Redirect to checkout page or payment gateway
      router.push("/payment");
    } catch (err) {
      console.error("Error during checkout:", err);
      toast.error("Ocurrió un error al procesar el pago. Inténtalo más tarde.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <NavbarWhite />
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando tu carrito...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <NavbarWhite />
        <main className="max-w-7xl mx-auto px-8 py-12">
          <div className="text-center py-12">
            <h1 className="text-2xl font-medium text-gray-800 mb-4">Error</h1>
            <p className="text-gray-600 mb-8">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-black text-white px-6 py-2 rounded-xl font-medium hover:bg-gray-900 transition-colors"
            >
              Intentar nuevamente
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <NavbarWhite />
        <main className="max-w-7xl mx-auto px-8 py-12">
          <h1 className="text-3xl font-medium text-gray-800 mb-12">
            Carrito de compras
          </h1>
          <div className="text-center py-12">
            <h2 className="text-xl font-medium text-gray-800 mb-4">
              Tu carrito está vacío
            </h2>
            <p className="text-gray-600 mb-8">
              Agrega productos a tu carrito para continuar comprando
            </p>
            <button
              onClick={() => (window.location.href = "/productos")}
              className="bg-black text-white px-6 py-2 rounded-xl font-medium hover:bg-gray-900 transition-colors"
            >
              Ver productos
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const getCartProductIds = () => {
    return cartItems.map((item) => item.product_id);
  };

  return (
    <div className="min-h-screen bg-white">
      <NavbarWhite />

      <main className="max-w-7xl mx-auto px-8 py-12 pb-36">
        <h1 className="text-3xl font-medium text-gray-800 mb-12">
          Carrito de compras
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-16">
          {/* Productos del carrito */}
          <div className="md:col-span-2 space-y-8">
            {cartItems.map((item) => (
              <div
                key={item.cart_item_id}
                className="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-6 bg-white p-4 shadow-sm rounded-lg"
              >
                <button
                  className="text-gray-400 hover:text-gray-600 self-end md:self-auto md:mt-12"
                  onClick={() => removeItem(item.cart_item_id)}
                >
                  <TrashIcon className="h-5 w-5" />
                </button>

                <div className="w-full md:w-32 h-32 bg-gray-100 rounded-lg relative flex-shrink-0">
                  <Link href={`/productos/${item.product_id}`}>
                    <Image
                      src={
                        item.image.length > 0
                          ? `${API_BASE_URL}${item.image}`
                          : "/images/placeholder.png"
                      }
                      alt={item.name}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </Link>
                </div>

                <div className="flex-1 space-y-1">
                  <p className="text-sm text-gray-500">{item.type}</p>
                  <h3 className="flex gap-3 text-lg font-medium text-gray-900">
                    <Link
                      href={`/productos/${item.product_id}`}
                      className="hover:underline hover:text-blue-500"
                    >
                      {item.name}
                    </Link>{" "}
                    {item.discount_percent > 0 && (
                      <div className="flex items-center mt-1">
                        <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded">
                          {item.discount_percent}% descuento
                        </span>
                      </div>
                    )}
                  </h3>
                  {item.variants && item.variants.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {item.variants.map((variant) => (
                        <div key={variant.id_pd} className="flex items-center">
                          <span className="text-sm text-gray-500 mr-2">
                            {variant.detail_name}:
                          </span>
                          {variant.detail_name.toLowerCase() === "color" ? (
                            <div className="flex items-center">
                              <div
                                className="w-4 h-4 rounded-full mr-1"
                                style={{ backgroundColor: variant.detail_desc }}
                              ></div>
                              <span className="text-sm">
                                {variant.detail_desc}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm">
                              {variant.detail_desc}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center border rounded-lg">
                        <button
                          onClick={() =>
                            updateQuantity(item.cart_item_id, false)
                          }
                          className="px-3 py-1 text-gray-500 hover:text-gray-700"
                          aria-label="Disminuir cantidad"
                        >
                          -
                        </button>
                        <span className="px-3 py-1">{item.quantity}</span>
                        <button
                          onClick={() =>
                            updateQuantity(item.cart_item_id, true)
                          }
                          className="px-3 py-1 text-gray-500 hover:text-gray-700"
                          aria-label="Aumentar cantidad"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div>
                      <span className="text-lg font-medium">
                        <span className="text-sm text-gray-500 mr-2">
                          {item.quantity}x
                        </span>
                        $
                        {item.price.toLocaleString("es-MX", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>

                      {item.discount_percent > 0 && (
                        <div className="text-sm text-gray-500">
                          Total: $
                          {(
                            item.price *
                            item.quantity *
                            (1 - item.discount_percent / 100)
                          ).toLocaleString("es-MX", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Resumen de la compra */}
          <div className="md:col-span-1">
            <div className="bg-white p-6 space-y-6 shadow-sm rounded-lg">
              <h2 className="text-xl font-medium text-gray-900">
                Total a pagar
              </h2>

              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">
                    $
                    {cartSummary.subtotal.toLocaleString("es-MX", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Envío</span>
                  <span className="font-medium">
                    {cartSummary.shipping === 0 ? (
                      <span className="text-green-600">Gratis</span>
                    ) : (
                      `$${cartSummary.shipping.toLocaleString("es-MX", {
                        minimumFractionDigits: 2,
                      })}`
                    )}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Descuento</span>
                  <span className="font-medium text-red-600">
                    -$
                    {cartSummary.discount.toLocaleString("es-MX", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-medium">
                      Total estimado
                    </span>
                    <div className="text-right">
                      <span className="text-sm text-gray-500">MXN</span>
                      <span className="ml-2 text-xl font-bold">
                        $
                        {cartSummary.total.toLocaleString("es-MX", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                className="w-full bg-black text-white py-4 rounded-xl font-medium hover:bg-gray-900 transition-colors"
                onClick={handleCheckout}
              >
                Proceder al pago
              </button>
            </div>
          </div>
        </div>
        {cartItems.length > 0 && (
          <SimilarProducts cartProductIds={getCartProductIds()} limit={8} />
        )}
      </main>
      <Footer />
    </div>
  );
}
