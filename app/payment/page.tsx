"use client";

import { useState, useEffect, useRef } from "react";
import { useInView } from "react-intersection-observer";
import Image from "next/image";
import { CircleDollarSign, CreditCard } from "lucide-react";
import Footer from "@/components/footer";
import NavbarWhite from "@/components/navbarWhite";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import Script from "next/script";
import { useSession } from "next-auth/react";

// Define interfaces
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

interface PaymentResponse {
  url: string;
}

declare global {
  interface Window {
    paypal?: any;
  }
}

// PayPal types
interface PayPalActions {
  order: {
    create: (orderData: any) => Promise<string>;
    capture: () => Promise<any>;
  };
}

interface PayPalOrderData {
  purchase_units: Array<{
    payments: {
      captures: Array<{
        id: string;
        status: string;
      }>;
    };
  }>;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const PaymentPage = () => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartId, setCartId] = useState<number | null>(null);
  const [cartSummary, setCartSummary] = useState<CartSummary>({
    subtotal: 0,
    shipping: 0,
    discount: 0,
    total: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<
    "mercadopago" | "paypal" | "cash" | null
  >(null);
  const [paypalLoaded, setPaypalLoaded] = useState(false);

  const paypalButtonContainerRef = useRef<HTMLDivElement>(null);

  // Get token from session
  const { data: session } = useSession();
  const token = session?.accessToken;

  // Animation refs
  const [refSummary, inViewSummary] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [refPayments, inViewPayments] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  // Function to initialize PayPal buttons
  const initPayPalButton = () => {
    if (!window.paypal) {
      console.error("PayPal SDK not loaded");
      return;
    }

    if (!paypalButtonContainerRef.current) {
      console.error("PayPal button container not found");
      return;
    }

    // Clear any existing PayPal buttons
    if (paypalButtonContainerRef.current.firstChild) {
      paypalButtonContainerRef.current.innerHTML = "";
    }

    try {
      window.paypal
        .Buttons({
          style: {
            shape: "rect",
            color: "blue",
            layout: "vertical",
            label: "pay",
          },

          createOrder: function (_data: any, actions: PayPalActions) {
            // Convert to PayPal's format
            const items = cartItems.map((item) => ({
              name: item.name,
              unit_amount: {
                currency_code: "MXN",
                value: item.price.toFixed(2),
              },
              quantity: item.quantity,
              description: item.type,
            }));

            return actions.order.create({
              purchase_units: [
                {
                  amount: {
                    currency_code: "MXN",
                    value: cartSummary.total.toFixed(2),
                    breakdown: {
                      item_total: {
                        currency_code: "MXN",
                        value: cartSummary.subtotal.toFixed(2),
                      },
                      discount: {
                        currency_code: "MXN",
                        value: cartSummary.discount.toFixed(2),
                      },
                      shipping: {
                        currency_code: "MXN",
                        value: cartSummary.shipping.toFixed(2),
                      },
                    },
                  },
                  items: items,
                },
              ],
            });
          },

          onApprove: function (_data: any, actions: PayPalActions) {
            return actions.order.capture().then(async function (
              orderData: PayPalOrderData
            ) {
              // Successful capture
              const transaction =
                orderData.purchase_units[0].payments.captures[0];
              toast.loading(
                `Procesando pedido... ID de transacción: ${transaction.id}`
              );

              // Save the order with updated function
              const orderId = await saveOrder(transaction.id, "paypal");

              if (orderId) {
                toast.dismiss();
                toast.success("¡Pedido registrado correctamente!");
                toast.success(`Tu número de pedido es: ${orderId}`);

                // Redirect to success page
                setTimeout(() => {
                  window.location.href = "/compra-confirmada";
                }, 2000);
              } else {
                toast.dismiss();
                toast.error("Error al registrar el pedido");
              }
            });
          },

          onError: function (err: Error) {
            console.error("PayPal error:", err);
            toast.error(
              "Error al procesar el pago con PayPal. Inténtalo de nuevo."
            );
          },
        })
        .render(paypalButtonContainerRef.current);

      console.log("PayPal buttons rendered successfully");
    } catch (error) {
      console.error("Error rendering PayPal buttons:", error);
      toast.error("Error al cargar los botones de PayPal");
    }
  };

  const updateCartStatus = async (cartId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/cart/${cartId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "finalizado" }),
      });

      if (!response.ok) {
        console.error("Error updating cart status");
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error updating cart status:", error);
      return false;
    }
  };

  // Save order to backend
  const saveOrder = async (transactionId: string, paymentMethod: string) => {
    try {
      if (!user?.id_user || cartId === null) return null;

      console.log("Creating order with payment method:", paymentMethod);

      // First create the order
      const orderResponse = await fetch("${API_BASE_URL}/api/pedidos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: user.id_user,
          fecha_pedido: new Date().toISOString(),
          status: "pendiente",
          metodo_pago: convertPaymentMethod(paymentMethod),
        }),
      });

      if (!orderResponse.ok) {
        console.error("Error creating order");
        return null;
      }

      const orderData = await orderResponse.json();
      console.log("Order API response:", orderData);

      // Use id_pedido instead of id based on the server response
      if (!orderData || !orderData.id_pedido) {
        console.error("No order ID returned from API");
        return null;
      }

      const pedidoId = orderData.id_pedido;
      console.log("Order created with ID:", pedidoId);

      // Then create order details for each item
      for (const item of cartItems) {
        const productDetailIds = item.variants
          ? item.variants.map((variant) => variant.id_pd)
          : [];

        console.log(
          `Creating order detail for product ${item.product_id} with pedido_id ${pedidoId}`
        );

        try {
          const detailResponse = await fetch(
            "${API_BASE_URL}/api/pedido/details",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                pedido_id: pedidoId,
                prod_id: item.product_id,
                amount: item.quantity,
                unit_price: item.price,
                product_detail_ids: productDetailIds,
                discount: item.discount_percent,
              }),
            }
          );

          if (!detailResponse.ok) {
            const errorData = await detailResponse.json();
            console.error("Error al crear el detalle de pedido:", errorData);
          } else {
            console.log(
              `Order detail created successfully for product ${item.product_id}`
            );
          }
        } catch (detailError) {
          console.error(
            `Error creating order detail for product ${item.product_id}:`,
            detailError
          );
        }
      }

      const cartStatusUpdated = await updateCartStatus(cartId);
      if (!cartStatusUpdated) {
        console.warn("Order created but cart status could not be updated");
      }

      return pedidoId;
    } catch (error) {
      console.error("Error saving order:", error);
      return null;
    }
  };

  // Helper function to convert payment method names to match API requirements
  const convertPaymentMethod = (method: string): string => {
    switch (method) {
      case "paypal":
        return "paypal";
      case "mercadopago":
        return "mercado_pago";
      case "cash":
        return "efectivo";
      default:
        return method;
    }
  };

  // Fetch cart data
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

      // Store the cart ID
      setCartId(cartData.cart_id);

      // Transform cart items
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
      setError(
        "No se pudo cargar el resumen de la compra. Inténtalo más tarde."
      );
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user?.id_user]);

  // Initialize PayPal when it's loaded and selected
  useEffect(() => {
    if (paypalLoaded && selectedPayment === "paypal") {
      console.log("Attempting to initialize PayPal button");
      setTimeout(() => {
        // Small delay to ensure DOM is ready
        initPayPalButton();
      }, 100);
    }
  }, [paypalLoaded, selectedPayment, cartItems, cartSummary]);

  const updateCartSummary = (items: CartItem[]) => {
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const discountAmount = items.reduce((sum, item) => {
      return sum + (item.price * item.quantity * item.discount_percent) / 100;
    }, 0);

    const shipping = 0; // Free shipping

    setCartSummary({
      subtotal,
      shipping,
      discount: discountAmount,
      total: subtotal + shipping - discountAmount,
    });
  };

  const handleMercadoPagoCheckout = async () => {
    if (!user?.id_user) {
      toast.error("Debes iniciar sesión para continuar");
      return;
    }

    try {
      toast.loading("Conectando con Mercado Pago...");

      const res = await fetch("${API_BASE_URL}/api/pago/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: user.id_user,
          cart_items: cartItems,
          summary: cartSummary,
        }),
      });

      if (!res.ok) {
        throw new Error("Error al crear el pago con Mercado Pago");
      }

      const data: PaymentResponse = await res.json();

      if (data && data.url) {
        toast.success("Redirigiendo a Mercado Pago...");
        setTimeout(() => {
          window.location.href = data.url;
        }, 800);
      } else {
        toast.error("No se recibió la URL de Mercado Pago");
      }
    } catch (error) {
      console.error("Error en la solicitud:", error);
      toast.error("Hubo un error en el proceso de pago con Mercado Pago.");
    }
  };

  const handlePaymentSelection = (
    method: "mercadopago" | "paypal" | "cash"
  ) => {
    setSelectedPayment(method);
  };

  const handleProceedToPayment = async () => {
    if (!selectedPayment) {
      toast.error("Por favor selecciona un método de pago");
      return;
    }

    if (selectedPayment === "mercadopago") {
      handleMercadoPagoCheckout();
    } else if (selectedPayment === "cash") {
      try {
        toast.loading("Procesando tu pedido para pago en efectivo...");

        // Create order with cash payment method
        const orderId = await saveOrder("cash-payment", "cash");

        if (orderId) {
          toast.success("¡Pedido registrado correctamente!");
          toast.success(`Tu número de pedido es: ${orderId}`);
          setTimeout(() => {
            window.location.href = "/compra-confirmada";
          }, 2000);
        } else {
          toast.dismiss();
          toast.error(
            "Error al registrar el pedido. Por favor, inténtalo de nuevo."
          );
        }
      } catch (error) {
        console.error("Error processing cash payment:", error);
        toast.dismiss();
        toast.error(
          "Hubo un error al procesar tu pedido para pago en efectivo"
        );
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <NavbarWhite />
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando información de pago...</p>
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
          <h1 className="text-3xl font-medium text-gray-800 mb-12">Pago</h1>
          <div className="text-center py-12">
            <h2 className="text-xl font-medium text-gray-800 mb-4">
              No hay productos en tu carrito
            </h2>
            <p className="text-gray-600 mb-8">
              Agrega productos a tu carrito antes de proceder al pago
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

  return (
    <div className="min-h-screen bg-white">
      {/* PayPal Script */}
      <Script
        src={`https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&currency=MXN&intent=capture&debug=true`}
        onLoad={() => {
          console.log("PayPal sandbox script loaded successfully");
          setPaypalLoaded(true);
        }}
        onError={(e) => {
          console.error("PayPal script failed to load:", e);
          toast.error(
            "Error cargando PayPal. Por favor intenta otro método de pago."
          );
        }}
        strategy="lazyOnload"
      />

      <NavbarWhite />

      <main className="max-w-7xl mx-auto px-4 py-12 pb-36 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold text-gray-800 mb-12 px-4">
          Finalizar compra
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {/* Order Summary */}
          <div
            ref={refSummary}
            className={`md:col-span-2 space-y-6 transform transition-all duration-1000 ${
              inViewSummary
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-medium text-gray-900 mb-6">
                Resumen de tu pedido
              </h2>

              <div className="space-y-6">
                {cartItems.map((item) => (
                  <div
                    key={item.cart_item_id}
                    className="flex space-x-4 pb-4 border-b border-gray-100"
                  >
                    <div className="w-20 h-20 bg-gray-100 rounded-md relative flex-shrink-0">
                      <Image
                        src={
                          item.image.length > 0
                            ? `${API_BASE_URL}${item.image}`
                            : "/images/placeholder.png"
                        }
                        alt={item.name}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>

                    <div className="flex-1">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">
                            {item.name}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1">
                            Cantidad: {item.quantity}
                          </p>

                          {item.variants && item.variants.length > 0 && (
                            <div className="mt-1 space-y-1">
                              {item.variants.map((variant) => (
                                <div
                                  key={variant.id_pd}
                                  className="flex items-center"
                                >
                                  <span className="text-xs text-gray-500 mr-1">
                                    {variant.detail_name}:
                                  </span>
                                  {variant.detail_name.toLowerCase() ===
                                  "color" ? (
                                    <div className="flex items-center">
                                      <div
                                        className="w-3 h-3 rounded-full mr-1"
                                        style={{
                                          backgroundColor: variant.detail_desc,
                                        }}
                                      ></div>
                                      <span className="text-xs">
                                        {variant.detail_desc}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-xs">
                                      {variant.detail_desc}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="text-right">
                          <div className="text-sm font-medium">
                            $
                            {(item.price * item.quantity).toLocaleString(
                              "es-MX",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }
                            )}
                          </div>

                          {item.discount_percent > 0 && (
                            <div className="text-xs text-red-600 mt-1">
                              -{item.discount_percent}% descuento
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Payment Summary and Options */}
          <div className="md:col-span-1">
            <div
              ref={refPayments}
              className={`sticky top-6 space-y-6 transform transition-all duration-1000 delay-300 ${
                inViewPayments
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
            >
              {/* Order Total */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Total a pagar
                </h2>

                <div className="space-y-3 text-sm">
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

                  {cartSummary.discount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Descuento</span>
                      <span className="font-medium text-red-600">
                        -$
                        {cartSummary.discount.toLocaleString("es-MX", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  )}

                  <div className="pt-3 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-base font-medium">Total</span>
                      <div className="text-right">
                        <span className="text-sm text-gray-500">MXN</span>
                        <span className="ml-1 text-xl font-bold">
                          $
                          {cartSummary.total.toLocaleString("es-MX", {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Método de pago
                </h2>

                <div className="space-y-3">
                  {/* MercadoPago Option */}
                  <div
                    onClick={() => handlePaymentSelection("mercadopago")}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedPayment === "mercadopago"
                        ? "border-yellow-500 bg-yellow-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                          <CreditCard className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-medium">Mercado Pago</span>
                      </div>
                      <div>
                        <div
                          className={`w-5 h-5 rounded-full border-2 ${
                            selectedPayment === "mercadopago"
                              ? "border-yellow-500 bg-yellow-500"
                              : "border-gray-300"
                          }`}
                        >
                          {selectedPayment === "mercadopago" && (
                            <div className="w-full h-full flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-white"></div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* PayPal Option */}
                  <div
                    onClick={() => handlePaymentSelection("paypal")}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedPayment === "paypal"
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                          <CreditCard className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-medium">PayPal</span>
                      </div>
                      <div>
                        <div
                          className={`w-5 h-5 rounded-full border-2 ${
                            selectedPayment === "paypal"
                              ? "border-blue-600 bg-blue-600"
                              : "border-gray-300"
                          }`}
                        >
                          {selectedPayment === "paypal" && (
                            <div className="w-full h-full flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-white"></div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* PayPal Button Container */}
                    {selectedPayment === "paypal" && (
                      <div className="mt-4">
                        <div
                          ref={paypalButtonContainerRef}
                          id="paypal-button-container"
                          className="min-h-[150px]" // Add minimum height to make it visible even when loading
                        ></div>
                        {!paypalLoaded && (
                          <div className="text-center py-3">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="text-sm text-gray-500 mt-2">
                              Cargando PayPal...
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Cash Payment Option */}
                  <div
                    onClick={() => handlePaymentSelection("cash")}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedPayment === "cash"
                        ? "border-green-600 bg-green-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                          <CircleDollarSign className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-medium">Pago en Efectivo</span>
                      </div>
                      <div>
                        <div
                          className={`w-5 h-5 rounded-full border-2 ${
                            selectedPayment === "cash"
                              ? "border-green-600 bg-green-600"
                              : "border-gray-300"
                          }`}
                        >
                          {selectedPayment === "cash" && (
                            <div className="w-full h-full flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-white"></div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {selectedPayment === "cash" && (
                      <div className="mt-4 text-sm text-gray-600">
                        <p>
                          Paga en efectivo al recoger tu pedido en nuestra
                          tienda.
                        </p>
                        <p className="font-medium mt-1">
                          Dirección: Calle 5 de Febrero 603, Zona Centro, 34000
                          Durango, Dgo.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Checkout Buttons - Now properly placed inside the payment summary div */}
              {selectedPayment === "mercadopago" && (
                <button
                  onClick={handleProceedToPayment}
                  className="w-full bg-black text-white py-4 rounded-xl font-medium hover:bg-gray-900 transition-colors"
                >
                  Pagar con Mercado Pago
                </button>
              )}

              {selectedPayment === "cash" && (
                <button
                  onClick={handleProceedToPayment}
                  className="w-full bg-green-600 text-white py-4 rounded-xl font-medium hover:bg-green-700 transition-colors"
                >
                  Confirmar Pedido para Pago en Efectivo
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentPage;
