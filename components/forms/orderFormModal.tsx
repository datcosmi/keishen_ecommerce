"use client";
import React, { useState, useEffect, useRef } from "react";
import { X, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

// Define types
interface ProductDetail {
  detail_id: number;
  detail_name: string;
  detail_desc: string;
  stock: number;
}

interface ProductImage {
  image_id: number;
  image_url: string;
}

interface Discount {
  id_discount: number;
  percent_discount: number;
  start_date_discount: string;
  end_date_discount: string;
}

interface User {
  id_user: string | number;
  name: string;
}

interface Product {
  id_prod?: string | number;
  id_product?: string | number;
  name?: string;
  product_name?: string;
  price?: number;
  description?: string;
  category_id?: number;
  category?: string;
  stock?: number;
  product_details?: ProductDetail[];
  product_images?: ProductImage[];
  discount_product?: Discount[];
  discount_category?: Discount[];
}

interface OrderData {
  user_id?: string | number;
  fecha_pedido: string;
  status: "pendiente" | "enviado" | "finalizado";
  metodo_pago: "efectivo" | "mercado pago" | "paypal";
}

interface OrderDetail {
  prod_id: string | number;
  amount: number;
  unit_price: number;
  productName?: string;
  selected_details?: number[];
}

interface OrderFormModalProps {
  onOrderAdded?: () => void;
  onOrderUpdated?: () => void;
  existingOrder?: {
    id_pedido?: string | number;
    cliente?: string;
    fecha_pedido: string;
    status: "pendiente" | "enviado" | "finalizado";
    metodo_pago: "efectivo" | "mercado pago" | "paypal";
    detalles?: OrderDetail[];
  };
  isEditMode?: boolean;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  buttonLabel?: string;
  buttonIcon?: React.ReactNode;
  hideButton?: boolean;
}

const API_BASE_URL = "http://localhost:3001/api";

const OrderFormModal: React.FC<OrderFormModalProps> = ({
  onOrderAdded,
  onOrderUpdated,
  existingOrder,
  isEditMode,
  isOpen,
  onOpenChange,
  buttonLabel = "Añadir Producto",
  buttonIcon = <Plus className="h-5 w-5 mr-2" />,
  hideButton,
}) => {
  // Dialog state
  const [open, setOpen] = useState(false);

  // Sync open state with isOpen prop
  useEffect(() => {
    if (isOpen !== undefined) {
      setOpen(isOpen);
    }
  }, [isOpen]);

  // Handle internal open state changes
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  // Form data
  const [orderData, setOrderData] = useState<OrderData>({
    fecha_pedido: new Date().toISOString(),
    status: "pendiente",
    metodo_pago: "efectivo",
  });

  // Order details
  const [orderDetails, setOrderDetails] = useState<OrderDetail[]>([]);

  // Current detail being added
  const [currentDetail, setCurrentDetail] = useState<OrderDetail>({
    prod_id: "",
    amount: 1,
    unit_price: 0,
    selected_details: [],
  });

  // Data sources
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  // Search and autocomplete
  const [userSearch, setUserSearch] = useState<string>("");
  const [productSearch, setProductSearch] = useState<string>("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [showUserDropdown, setShowUserDropdown] = useState<boolean>(false);
  const [showProductDropdown, setShowProductDropdown] =
    useState<boolean>(false);

  // Selected entities
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Refs for click outside detection
  const userDropdownRef = useRef<HTMLDivElement | null>(null);
  const productDropdownRef = useRef<HTMLDivElement | null>(null);

  // Loading states
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fetch users and products on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch users
        const usersResponse = await fetch(`${API_BASE_URL}/users`);
        if (!usersResponse.ok) {
          throw new Error(`Error fetching users: ${usersResponse.statusText}`);
        }
        const usersData = await usersResponse.json();
        setUsers(usersData);

        // Fetch products
        const productsResponse = await fetch(
          `${API_BASE_URL}/products/full-details`
        );
        if (!productsResponse.ok) {
          throw new Error(
            `Error fetching products: ${productsResponse.statusText}`
          );
        }
        const productsData = await productsResponse.json();
        setProducts(productsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (existingOrder && isEditMode) {
      // Set order data
      setOrderData({
        fecha_pedido: existingOrder.fecha_pedido,
        status: existingOrder.status,
        metodo_pago: existingOrder.metodo_pago,
      });

      // Set order details if available
      if (existingOrder.detalles && existingOrder.detalles.length > 0) {
        setOrderDetails(existingOrder.detalles);
      }

      // If there's a client, set the search and selected user
      if (existingOrder.cliente) {
        setUserSearch(existingOrder.cliente);
        const foundUser = users.find(
          (user) => user.name === existingOrder.cliente
        );
        if (foundUser) {
          setSelectedUser(foundUser);
        }
      }
    }
  }, [existingOrder, isEditMode, users]);

  // Filter users based on search input
  useEffect(() => {
    if (userSearch) {
      const filtered = users.filter((user) =>
        user.name.toLowerCase().includes(userSearch.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers([]);
    }
  }, [userSearch, users]);

  // Filter products based on search input
  useEffect(() => {
    if (productSearch) {
      const filtered = products.filter((product) => {
        const productName = product.product_name || product.name || "";
        return productName.toLowerCase().includes(productSearch.toLowerCase());
      });
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts([]);
    }
  }, [productSearch, products]);

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target as Node)
      ) {
        setShowUserDropdown(false);
      }
      if (
        productDropdownRef.current &&
        !productDropdownRef.current.contains(event.target as Node)
      ) {
        setShowProductDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle user selection
  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    setUserSearch(user.name);
    setOrderData({
      ...orderData,
      user_id: user.id_user,
    });
    setShowUserDropdown(false);
  };

  // Handle clearing user selection
  const handleClearUser = () => {
    setSelectedUser(null);
    setUserSearch("");
    // Remove user_id from orderData
    const { user_id, ...restOrderData } = orderData;
    setOrderData(restOrderData);
  };

  // Handle product selection
  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setProductSearch(product.product_name || product.name || "");
    setCurrentDetail({
      ...currentDetail,
      prod_id: product.id_product || product.id_prod || "",
      unit_price: product.price || 0,
      selected_details: [],
    });
    setShowProductDropdown(false);
  };

  // Add product to order details
  const handleAddProductToOrder = () => {
    if (
      !currentDetail.prod_id ||
      currentDetail.amount <= 0 ||
      !selectedProduct
    ) {
      return;
    }

    // If the product has variants but none are selected, show an error
    if (
      selectedProduct.product_details &&
      selectedProduct.product_details.length > 0 &&
      (!currentDetail.selected_details ||
        currentDetail.selected_details.length === 0)
    ) {
      toast.error("Por favor, selecciona las variantes del producto");
      return;
    }

    // Validate main product stock
    const currentStock = selectedProduct.stock || 0;

    // Create a unique identifier for the product+variants combination
    const productVariantKey = `${currentDetail.prod_id}-${
      currentDetail.selected_details?.sort().join("-") || ""
    }`;

    // Check if the same product with same variants exists in order
    const existingProductIndex = orderDetails.findIndex((detail) => {
      const detailVariantKey = `${detail.prod_id}-${
        detail.selected_details?.sort().join("-") || ""
      }`;
      return detailVariantKey === productVariantKey;
    });

    // Calculate total amount including existing amount in order if any
    let totalAmount = currentDetail.amount;
    if (existingProductIndex >= 0) {
      totalAmount += orderDetails[existingProductIndex].amount;
    }

    // Check if we have enough stock
    if (totalAmount > currentStock) {
      toast.error(
        `Stock insuficiente. Solo hay ${currentStock} unidades disponibles.`
      );
      return;
    }

    // Also validate stock for each selected detail
    if (
      currentDetail.selected_details &&
      currentDetail.selected_details.length > 0
    ) {
      for (const detailId of currentDetail.selected_details) {
        const detail = selectedProduct.product_details?.find(
          (d) => d.detail_id === detailId
        );
        if (detail && detail.stock < totalAmount) {
          toast.error(
            `Stock insuficiente para variante ${detail.detail_name}: ${detail.detail_desc}. Solo hay ${detail.stock} unidades disponibles.`
          );
          return;
        }
      }
    }

    if (existingProductIndex >= 0) {
      // Update existing product quantity
      const updatedDetails = [...orderDetails];
      updatedDetails[existingProductIndex].amount += currentDetail.amount;
      setOrderDetails(updatedDetails);
    } else {
      // Add new product
      setOrderDetails([
        ...orderDetails,
        {
          ...currentDetail,
          productName:
            selectedProduct.product_name ||
            selectedProduct.name ||
            "Unknown Product",
        },
      ]);
    }

    // Reset current detail
    setCurrentDetail({
      prod_id: "",
      amount: 1,
      unit_price: 0,
      selected_details: [],
    });
    setSelectedProduct(null);
    setProductSearch("");
  };

  // Remove product from order details
  const handleRemoveProduct = (index: number) => {
    const updatedDetails = [...orderDetails];
    updatedDetails.splice(index, 1);
    setOrderDetails(updatedDetails);
  };

  // Calculate order total
  const calculateOrderTotal = (): number => {
    return orderDetails.reduce(
      (total, item) => total + item.amount * item.unit_price,
      0
    );
  };

  // Handle payment method selection
  const handlePaymentMethodSelect = (
    method: "efectivo" | "mercado pago" | "paypal"
  ) => {
    setOrderData({
      ...orderData,
      metodo_pago: method,
    });
  };

  // Handle status selection
  const handleStatusSelect = (
    status: "pendiente" | "enviado" | "finalizado"
  ) => {
    setOrderData({
      ...orderData,
      status: status,
    });
  };

  // Handle variant selection
  const handleVariantSelect = (detailName: string, detailId: number) => {
    // First, find all details with the same detail_name
    const detailsWithSameName =
      selectedProduct?.product_details?.filter(
        (d) => d.detail_name === detailName
      ) || [];

    // Get IDs of those details
    const detailIdsWithSameName = detailsWithSameName.map((d) => d.detail_id);

    // Remove any previously selected detail with the same name
    const filteredDetails =
      currentDetail.selected_details?.filter(
        (id) => !detailIdsWithSameName.includes(id)
      ) || [];

    // Add the newly selected detail
    setCurrentDetail({
      ...currentDetail,
      selected_details: [...filteredDetails, detailId],
    });
  };

  // Reset form
  const resetForm = () => {
    setOrderData({
      fecha_pedido: new Date().toISOString(),
      status: "pendiente",
      metodo_pago: "efectivo",
    });
    setOrderDetails([]);
    setCurrentDetail({
      prod_id: "",
      amount: 1,
      unit_price: 0,
    });
    setSelectedUser(null);
    setSelectedProduct(null);
    setUserSearch("");
    setProductSearch("");
  };

  const updateProductStocks = async () => {
    try {
      // Track products that need updating and their quantities
      const productUpdates = new Map<string | number, number>();
      // Track product details that need updating and their quantities
      const detailUpdates = new Map<number, number>();

      // Collect all updates needed
      orderDetails.forEach((detail) => {
        const productId = detail.prod_id;
        const quantity = detail.amount;

        // Add to product updates
        if (productUpdates.has(productId)) {
          productUpdates.set(
            productId,
            productUpdates.get(productId)! + quantity
          );
        } else {
          productUpdates.set(productId, quantity);
        }

        // Add to product detail updates if applicable
        if (detail.selected_details && detail.selected_details.length > 0) {
          detail.selected_details.forEach((detailId) => {
            if (detailUpdates.has(detailId)) {
              detailUpdates.set(
                detailId,
                detailUpdates.get(detailId)! + quantity
              );
            } else {
              detailUpdates.set(detailId, quantity);
            }
          });
        }
      });

      // Process product stock updates
      const productUpdatePromises = Array.from(productUpdates.entries()).map(
        ([productId, quantity]) => {
          // Find current stock
          const product = products.find(
            (p) =>
              (p.id_product &&
                p.id_product.toString() === productId.toString()) ||
              (p.id_prod && p.id_prod.toString() === productId.toString())
          );

          if (!product) return Promise.resolve();

          const currentStock = product.stock || 0;
          const newStock = Math.max(0, currentStock - quantity); // Ensure stock doesn't go negative

          return fetch(`${API_BASE_URL}/product/${productId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              stock: newStock,
            }),
          }).then((response) => {
            if (!response.ok) {
              throw new Error(
                `Failed to update stock for product ${productId}`
              );
            }
            return response;
          });
        }
      );

      // Process product detail stock updates
      // Prepare the bulk update format
      const detailUpdateData = Array.from(detailUpdates.entries()).map(
        ([detailId, quantity]) => {
          // Find current stock for this detail
          let currentStock = 0;
          products.some((product) => {
            const detail = product.product_details?.find(
              (d) => d.detail_id === detailId
            );
            if (detail) {
              currentStock = detail.stock || 0;
              return true;
            }
            return false;
          });

          const newStock = Math.max(0, currentStock - quantity); // Ensure stock doesn't go negative

          return {
            id_pd: detailId.toString(),
            data: { stock: newStock },
          };
        }
      );

      // Only call the API if there are details to update
      let detailUpdatePromise: Promise<any> = Promise.resolve();
      if (detailUpdateData.length > 0) {
        detailUpdatePromise = fetch(
          `${API_BASE_URL}/products/details/bulk-update`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(detailUpdateData),
          }
        ).then((response) => {
          if (!response.ok) {
            throw new Error(`Failed to update stock for product details`);
          }
          return response;
        });
      }

      // Wait for all updates to complete
      await Promise.all([...productUpdatePromises, detailUpdatePromise]);

      console.log("Stock updated successfully for all products and details");
    } catch (error) {
      console.error("Error updating product stocks:", error);
      toast.error(
        "Se creó el pedido pero hubo un error actualizando el inventario"
      );
    }
  };

  const createOrder = async () => {
    setIsSubmitting(true);

    try {
      // Prepare the order data for submission
      const orderDataToSubmit = { ...orderData };

      // Step 1: Create the order
      const orderResponse = await fetch(`${API_BASE_URL}/pedidos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderDataToSubmit),
      });

      if (!orderResponse.ok) {
        throw new Error(`Error creating order: ${orderResponse.statusText}`);
      }

      const newOrder = await orderResponse.json();
      const orderId = newOrder.id_pedido || newOrder.pedido_id;

      // Step 2: Create order details
      const detailPromises = orderDetails.map((detail) => {
        return fetch(`${API_BASE_URL}/pedido/details`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            pedido_id: orderId,
            prod_id: detail.prod_id,
            amount: detail.amount,
            unit_price: detail.unit_price,
            product_detail_ids: detail.selected_details || [],
          }),
        });
      });

      await Promise.all(detailPromises);

      // Step 3: Update product stock levels
      await updateProductStocks();

      // Success!
      resetForm();
      setOpen(false);
      onOrderAdded && onOrderAdded();

      // Show success message
      toast.success("Pedido creado correctamente");
    } catch (error) {
      console.error("Error submitting order:", error);
      alert(
        `Error al crear el pedido: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateOrder = async () => {
    setIsSubmitting(true);

    try {
      // Update the order data
      const orderResponse = await fetch(
        `${API_BASE_URL}/pedidos/${existingOrder?.id_pedido}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(orderData),
        }
      );

      if (!orderResponse.ok) {
        throw new Error(`Error updating order: ${orderResponse.statusText}`);
      }

      // Handle order details
      await fetch(
        `${API_BASE_URL}/pedido/details/${existingOrder?.id_pedido}`,
        {
          method: "DELETE",
        }
      );

      // Then create new details
      const detailPromises = orderDetails.map((detail) => {
        return fetch(`${API_BASE_URL}/pedido/details`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            pedido_id: existingOrder?.id_pedido,
            prod_id: detail.prod_id,
            amount: detail.amount,
            unit_price: detail.unit_price,
            product_detail_ids: detail.selected_details || [],
          }),
        });
      });

      await Promise.all(detailPromises);

      // Handle stock updates
      resetForm();
      setOpen(false);
      onOrderUpdated && onOrderUpdated();

      toast.success("Pedido actualizado correctamente");
    } catch (error) {
      console.error("Error updating order:", error);
      alert(
        `Error al actualizar el pedido: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit order
  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const orderDataToSubmit = {
        ...orderData,
        user_id: selectedUser?.id_user,
      };

      let response;
      if (isEditMode && existingOrder?.id_pedido) {
        // Update existing order
        response = await fetch(
          `${API_BASE_URL}/pedidos/${existingOrder.id_pedido}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(orderDataToSubmit),
          }
        );
      } else {
        // Create new order
        response = await fetch(`${API_BASE_URL}/pedidos`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(orderDataToSubmit),
        });
      }

      if (!response.ok) {
        throw new Error(`Error ${isEditMode ? "updating" : "creating"} order`);
      }

      const result = await response.json();
      const orderId = isEditMode ? existingOrder?.id_pedido : result.id_pedido;

      // Handle order details
      if (isEditMode) {
        // Delete existing details first
        await fetch(`${API_BASE_URL}/pedido/details/${orderId}`, {
          method: "DELETE",
        });
      }

      // Create new details
      const detailPromises = orderDetails.map((detail) =>
        fetch(`${API_BASE_URL}/pedido/details`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            pedido_id: orderId,
            prod_id: detail.prod_id,
            amount: detail.amount,
            unit_price: detail.unit_price,
            product_detail_ids: detail.selected_details || [],
          }),
        })
      );

      await Promise.all(detailPromises);

      // Update stocks
      await updateProductStocks();

      toast.success(
        isEditMode
          ? "Pedido actualizado correctamente"
          : "Pedido creado correctamente"
      );

      // Call the appropriate callback
      if (isEditMode) {
        onOrderUpdated && onOrderUpdated();
      } else {
        onOrderAdded && onOrderAdded();
      }

      setOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error processing order:", error);
      toast.error(
        isEditMode
          ? "Error al actualizar el pedido"
          : "Error al crear el pedido"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        {!hideButton && (
          <DialogTrigger asChild>
            <Button variant="default" className="bg-black hover:bg-gray-800">
              {buttonIcon}
              {buttonLabel}
            </Button>
          </DialogTrigger>
        )}
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Editar Pedido" : "Crear Nuevo Pedido"}
            </DialogTitle>
            <DialogDescription>
              Agrega la información del pedido y sus productos
            </DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <div className="flex justify-center py-6">
              <p>Cargando datos...</p>
            </div>
          ) : (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Cliente (Autocomplete) */}
                <div className="relative" ref={userDropdownRef}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cliente (Opcional)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <Input
                      type="text"
                      className="pl-10"
                      placeholder="Buscar cliente..."
                      value={userSearch}
                      onChange={(e) => {
                        setUserSearch(e.target.value);
                        setShowUserDropdown(true);
                      }}
                      onFocus={() => setShowUserDropdown(true)}
                    />
                    {selectedUser && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={handleClearUser}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {/* Dropdown de usuarios */}
                  {showUserDropdown && filteredUsers.length > 0 && (
                    <Card className="absolute z-10 w-full mt-1 max-h-48 overflow-auto">
                      <CardContent className="p-0">
                        <ul className="divide-y divide-gray-200">
                          {filteredUsers.map((user) => (
                            <li
                              key={user.id_user.toString()}
                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                              onClick={() => handleUserSelect(user)}
                            >
                              {user.name}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Fecha del Pedido */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha
                  </label>
                  <Input
                    type="datetime-local"
                    value={orderData.fecha_pedido.slice(0, 16)}
                    onChange={(e) =>
                      setOrderData({
                        ...orderData,
                        fecha_pedido: new Date(e.target.value).toISOString(),
                      })
                    }
                  />
                </div>

                {/* Método de Pago (Botones) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Método de Pago
                  </label>
                  <div className="flex space-x-2">
                    <Button
                      variant={
                        orderData.metodo_pago === "efectivo"
                          ? "default"
                          : "outline"
                      }
                      onClick={() => handlePaymentMethodSelect("efectivo")}
                      className={
                        orderData.metodo_pago === "efectivo"
                          ? "bg-black hover:bg-gray-800"
                          : ""
                      }
                    >
                      Efectivo
                    </Button>
                    <Button
                      variant={
                        orderData.metodo_pago === "mercado pago"
                          ? "default"
                          : "outline"
                      }
                      onClick={() => handlePaymentMethodSelect("mercado pago")}
                      className={
                        orderData.metodo_pago === "mercado pago"
                          ? "bg-black hover:bg-gray-800"
                          : ""
                      }
                    >
                      Mercado Pago
                    </Button>
                    <Button
                      variant={
                        orderData.metodo_pago === "paypal"
                          ? "default"
                          : "outline"
                      }
                      onClick={() => handlePaymentMethodSelect("paypal")}
                      className={
                        orderData.metodo_pago === "paypal"
                          ? "bg-black hover:bg-gray-800"
                          : ""
                      }
                    >
                      PayPal
                    </Button>
                  </div>
                </div>

                {/* Estado del Pedido (Botones) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado
                  </label>
                  <div className="flex space-x-2">
                    <Button
                      variant={
                        orderData.status === "pendiente" ? "default" : "outline"
                      }
                      onClick={() => handleStatusSelect("pendiente")}
                      className={
                        orderData.status === "pendiente"
                          ? "bg-black hover:bg-gray-800"
                          : ""
                      }
                    >
                      Pendiente
                    </Button>
                    <Button
                      variant={
                        orderData.status === "enviado" ? "default" : "outline"
                      }
                      onClick={() => handleStatusSelect("enviado")}
                      className={
                        orderData.status === "enviado"
                          ? "bg-black hover:bg-gray-800"
                          : ""
                      }
                    >
                      Enviado
                    </Button>
                    <Button
                      variant={
                        orderData.status === "finalizado"
                          ? "default"
                          : "outline"
                      }
                      onClick={() => handleStatusSelect("finalizado")}
                      className={
                        orderData.status === "finalizado"
                          ? "bg-black hover:bg-gray-800"
                          : ""
                      }
                    >
                      Finalizado
                    </Button>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <h3 className="text-lg font-medium mb-2">Agregar Productos</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {/* Producto (Autocomplete) */}
                  <div className="relative" ref={productDropdownRef}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Producto
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                      </div>
                      <Input
                        type="text"
                        className="pl-10"
                        placeholder="Buscar producto..."
                        value={productSearch}
                        onChange={(e) => {
                          setProductSearch(e.target.value);
                          setShowProductDropdown(true);
                        }}
                        onFocus={() => setShowProductDropdown(true)}
                      />
                    </div>

                    {selectedProduct &&
                      selectedProduct.product_details &&
                      selectedProduct.product_details.length > 0 && (
                        <div className="mt-4 border rounded-md p-4 bg-gray-50">
                          <h4 className="text-sm font-medium mb-2">
                            Variantes del Producto
                          </h4>

                          {/* Group details by detail_name */}
                          {Object.entries(
                            selectedProduct.product_details.reduce(
                              (acc, detail) => {
                                if (!acc[detail.detail_name]) {
                                  acc[detail.detail_name] = [];
                                }
                                acc[detail.detail_name].push(detail);
                                return acc;
                              },
                              {} as Record<string, ProductDetail[]>
                            )
                          ).map(([detailName, details]) => (
                            <div key={detailName} className="mb-3">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                {detailName}
                              </label>
                              <div className="flex flex-wrap gap-2">
                                {details.map((detail) => (
                                  <Button
                                    key={detail.detail_id}
                                    type="button"
                                    variant={
                                      currentDetail.selected_details?.includes(
                                        detail.detail_id
                                      )
                                        ? "default"
                                        : "outline"
                                    }
                                    className={
                                      currentDetail.selected_details?.includes(
                                        detail.detail_id
                                      )
                                        ? "bg-black hover:bg-gray-800"
                                        : ""
                                    }
                                    onClick={() =>
                                      handleVariantSelect(
                                        detailName,
                                        detail.detail_id
                                      )
                                    }
                                    disabled={detail.stock === 0}
                                  >
                                    {detail.detail_desc}
                                    <span className="ml-1 text-xs">
                                      ({detail.stock})
                                    </span>
                                  </Button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                    {/* Dropdown de productos */}
                    {showProductDropdown && filteredProducts.length > 0 && (
                      <Card className="absolute z-10 w-full mt-1 max-h-48 overflow-auto">
                        <CardContent className="p-0">
                          <ul className="divide-y divide-gray-200">
                            {filteredProducts.map((product) => (
                              <li
                                key={(
                                  product.id_product ||
                                  product.id_prod ||
                                  ""
                                ).toString()}
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                onClick={() => handleProductSelect(product)}
                              >
                                <div className="flex justify-between">
                                  <span>
                                    {product.product_name ||
                                      product.name ||
                                      "Unknown"}{" "}
                                    - ${product.price || 0}
                                  </span>
                                  <span
                                    className={`text-sm ${
                                      (product.stock || 0) > 5
                                        ? "text-green-600"
                                        : "text-red-600"
                                    }`}
                                  >
                                    Stock: {product.stock || 0}
                                  </span>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  {/* Cantidad */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cantidad
                    </label>
                    <Input
                      type="number"
                      min="1"
                      value={currentDetail.amount}
                      onChange={(e) =>
                        setCurrentDetail({
                          ...currentDetail,
                          amount: parseInt(e.target.value) || 1,
                        })
                      }
                    />
                  </div>

                  {/* Precio Unitario (Automático) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Precio Unitario
                    </label>
                    <Input
                      type="number"
                      value={currentDetail.unit_price}
                      disabled
                    />
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={handleAddProductToOrder}
                  disabled={!selectedProduct}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Producto
                </Button>
              </div>

              {/* Tabla de productos agregados */}
              <div className="mt-4">
                <h3 className="text-lg font-medium mb-2">
                  Detalles del Pedido
                </h3>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead>Cantidad</TableHead>
                      <TableHead>Precio Unitario</TableHead>
                      <TableHead>Subtotal</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orderDetails.map((detail, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          {detail.productName}
                          {detail.selected_details &&
                            detail.selected_details.length > 0 && (
                              <div className="text-xs text-gray-500 mt-1">
                                {detail.selected_details
                                  .map((detailId) => {
                                    // Find the detail in the products list
                                    const product = products.find(
                                      (p) => p.id_prod === detail.prod_id
                                    );
                                    const variantDetail =
                                      product?.product_details?.find(
                                        (d) => d.detail_id === detailId
                                      );
                                    return variantDetail
                                      ? `${variantDetail.detail_name}: ${variantDetail.detail_desc}`
                                      : "";
                                  })
                                  .filter(Boolean)
                                  .join(", ")}
                              </div>
                            )}
                        </TableCell>
                        <TableCell>{detail.amount}</TableCell>
                        <TableCell>
                          ${detail.unit_price.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          $
                          {(detail.amount * detail.unit_price).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveProduct(index)}
                            className="h-8 w-8 p-0 text-red-500 bg-red-50 hover:text-red-700 hover:bg-red-100"
                          >
                            <X size={16} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}

                    {orderDetails.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center py-4 text-gray-500"
                        >
                          No hay productos agregados al pedido
                        </TableCell>
                      </TableRow>
                    )}

                    {orderDetails.length > 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className="text-right font-medium"
                        >
                          Total:
                        </TableCell>
                        <TableCell colSpan={2} className="font-bold">
                          ${calculateOrderTotal().toLocaleString()}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || orderDetails.length === 0}
              className="bg-black hover:bg-gray-800"
            >
              {isSubmitting
                ? "Guardando..."
                : isEditMode
                ? "Actualizar Pedido"
                : "Guardar Pedido"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default OrderFormModal;
