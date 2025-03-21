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
interface User {
  id_user: string | number;
  name: string;
}

interface Product {
  id_prod: string | number;
  name: string;
  price: number;
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
}

interface OrderFormModalProps {
  onOrderAdded?: () => void;
}

const API_BASE_URL = "http://localhost:3001/api";

const OrderFormModal: React.FC<OrderFormModalProps> = ({ onOrderAdded }) => {
  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

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
        const productsResponse = await fetch(`${API_BASE_URL}/product`);
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
      const filtered = products.filter((product) =>
        product.name.toLowerCase().includes(productSearch.toLowerCase())
      );
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
    setProductSearch(product.name);
    setCurrentDetail({
      ...currentDetail,
      prod_id: product.id_prod,
      unit_price: product.price,
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

    // Check if product already exists in order
    const existingProductIndex = orderDetails.findIndex(
      (detail) => detail.prod_id === currentDetail.prod_id
    );

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
          productName: selectedProduct.name,
        },
      ]);
    }

    // Reset current detail
    setCurrentDetail({
      prod_id: "",
      amount: 1,
      unit_price: 0,
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

  // Submit order
  const handleSubmit = async () => {
    // Validate order
    if (orderDetails.length === 0) {
      alert("Por favor, agrega al menos un producto al pedido");
      return;
    }

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
          }),
        });
      });

      await Promise.all(detailPromises);

      // Success!
      resetForm();
      setIsDialogOpen(false);
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

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button className="bg-black hover:bg-gray-800">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Pedido
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Pedido</DialogTitle>
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

                    {/* Dropdown de productos */}
                    {showProductDropdown && filteredProducts.length > 0 && (
                      <Card className="absolute z-10 w-full mt-1 max-h-48 overflow-auto">
                        <CardContent className="p-0">
                          <ul className="divide-y divide-gray-200">
                            {filteredProducts.map((product) => (
                              <li
                                key={product.id_prod.toString()}
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                onClick={() => handleProductSelect(product)}
                              >
                                {product.name} - ${product.price}
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
                        <TableCell>{detail.productName}</TableCell>
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
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || orderDetails.length === 0}
              className="bg-black hover:bg-gray-800"
            >
              {isSubmitting ? "Guardando..." : "Guardar Pedido"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default OrderFormModal;
