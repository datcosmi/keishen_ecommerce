"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Package,
  Calendar,
  CreditCard,
  Tag,
  Truck,
  Search,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  PackageOpen,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import NavbarBlack from "@/components/navbarBlack";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import Footer from "@/components/footer";
import Link from "next/link";
import { toast } from "sonner";

// Types definition based on API response
interface Variante {
  id_pd: number;
  detail_name: string;
  detail_desc: string;
}

interface Producto {
  producto_id: number;
  producto_nombre: string;
  producto_precio: number;
  producto_imagenes: string[];
  variantes: Variante[];
}

interface Detalle {
  detalle_id: number;
  amount: number;
  unit_price: number;
  discount: number;
  producto: Producto;
}

interface Pedido {
  pedido_id: number;
  fecha_pedido: string;
  status: string;
  metodo_pago: string;
  cliente: string;
  detalles: Detalle[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function OrdersPage() {
  const { user: authUser } = useAuth();
  const [orders, setOrders] = useState<Pedido[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Pedido[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch orders data from API
  useEffect(() => {
    const fetchOrders = async () => {
      if (!authUser?.id_user) return;

      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(
          `${API_BASE_URL}/api/pedidos/details/${authUser.id_user}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch orders");
        }

        const data = await response.json();
        setOrders(data);
        setFilteredOrders(data);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setError(
          "No se pudieron cargar tus pedidos. Por favor intenta nuevamente más tarde."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [authUser?.id_user]);

  // Apply filters when searchTerm or statusFilter changes
  useEffect(() => {
    if (!orders) return;

    const filtered = orders.filter((order) => {
      const matchesSearch =
        searchTerm === "" ||
        order.detalles.some((detalle) =>
          detalle.producto.producto_nombre
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        ) ||
        order.pedido_id.toString().includes(searchTerm);

      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    setFilteredOrders(filtered);
  }, [searchTerm, statusFilter, orders]);

  const cancelOrder = async (pedidoId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/pedido/${pedidoId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "cancelado" }),
      });

      if (!response.ok) {
        throw new Error("Failed to cancel order");
      }

      // Update the local state to reflect the change
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.pedido_id === pedidoId
            ? { ...order, status: "cancelado" }
            : order
        )
      );

      // Also update the filtered orders
      setFilteredOrders((prevFiltered) =>
        prevFiltered.map((order) =>
          order.pedido_id === pedidoId
            ? { ...order, status: "cancelado" }
            : order
        )
      );

      toast.success("Pedido cancelado exitosamente.");
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast.error("Error al cancelar el pedido.");
    }
  };

  const CancelOrderButton = ({
    status,
    pedidoId,
  }: {
    status: string;
    pedidoId: number;
  }) => {
    if (status !== "pendiente") {
      return null;
    }

    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="text-red-500 border-red-200 hover:bg-red-50"
          >
            <XCircle className="h-4 w-4 mr-1" />
            Cancelar Pedido
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El pedido #{pedidoId} será
              cancelado y no podrás revertir este cambio.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => cancelOrder(pedidoId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Confirmar Cancelación
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  };

  // Format date to a more readable format
  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, "d 'de' MMMM, yyyy - HH:mm", { locale: es });
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

  // Calculate total for an order
  const calculateOrderTotal = (detalles: Detalle[]): number => {
    return detalles.reduce((acc, item) => {
      const itemTotal =
        item.amount * item.unit_price * (1 - item.discount / 100);
      return acc + itemTotal;
    }, 0);
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
      case "completado":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
            <CheckCircle className="h-3.5 w-3.5 mr-1" />
            Completado
          </Badge>
        );
      case "cancelado":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
            <XCircle className="h-3.5 w-3.5 mr-1" />
            Cancelado
          </Badge>
        );
      case "pendiente":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
            <Clock className="h-3.5 w-3.5 mr-1" />
            Pendiente
          </Badge>
        );
      case "enviado":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
            <Truck className="h-3.5 w-3.5 mr-1" />
            Enviado
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">
            {status}
          </Badge>
        );
    }
  };

  // Payment method badge component
  const PaymentMethodBadge = ({ method }: { method: string }) => {
    switch (method) {
      case "paypal":
        return (
          <Badge variant="outline" className="text-blue-600 border-blue-200">
            <CreditCard className="h-3.5 w-3.5 mr-1" />
            PayPal
          </Badge>
        );
      case "efectivo":
        return (
          <Badge variant="outline" className="text-green-600 border-green-200">
            <CreditCard className="h-3.5 w-3.5 mr-1" />
            Efectivo
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <CreditCard className="h-3.5 w-3.5 mr-1" />
            {method}
          </Badge>
        );
    }
  };

  // Skeleton for loading state
  if (isLoading) {
    return <OrdersSkeleton />;
  }

  // Error message
  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <NavbarBlack />
        <div className="container mx-auto py-10 px-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <NavbarBlack />
      <div className="container mx-auto py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">Mis Pedidos</h1>
              <p className="text-gray-500 mt-1">
                Consulta y realiza seguimiento de todos tus pedidos
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Badge
                variant="outline"
                className="text-purple-600 border-purple-200 px-3 py-1"
              >
                <Package className="h-4 w-4 mr-2" />
                Total de pedidos: {orders.length}
              </Badge>
            </div>
          </div>

          {/* Filters and search */}
          <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Buscar por producto o número de pedido..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                    <SelectItem value="enviado">Enviado</SelectItem>
                    <SelectItem value="completado">Completado</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Tabs for different views */}
          <Tabs defaultValue="list" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="list">
                <Package className="h-4 w-4 mr-2" />
                Vista de Lista
              </TabsTrigger>
              <TabsTrigger value="detail">
                <PackageOpen className="h-4 w-4 mr-2" />
                Vista Detallada
              </TabsTrigger>
            </TabsList>

            {/* List View */}
            <TabsContent value="list">
              {filteredOrders.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <Package className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                  <h3 className="text-lg font-medium text-gray-900">
                    No se encontraron pedidos
                  </h3>
                  <p className="text-gray-500 mt-1">
                    {searchTerm || statusFilter !== "all"
                      ? "No hay resultados para tu búsqueda actual."
                      : "Aún no has realizado ningún pedido."}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((pedido) => (
                    <Card key={pedido.pedido_id} className="overflow-hidden">
                      <div className="flex flex-col md:flex-row">
                        <div className="md:w-1/4 bg-gray-50 p-4 md:p-6">
                          <div className="space-y-4">
                            <div>
                              <span className="text-sm text-gray-500">
                                Pedido No.
                              </span>
                              <h3 className="text-xl font-semibold">
                                #{pedido.pedido_id}
                              </h3>
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                                <span className="text-sm">
                                  {formatDate(pedido.fecha_pedido)}
                                </span>
                              </div>
                              <div className="flex items-center">
                                <CreditCard className="h-4 w-4 mr-2 text-gray-500" />
                                <PaymentMethodBadge
                                  method={pedido.metodo_pago}
                                />
                              </div>
                              <div className="flex items-center mt-2 gap-3">
                                <StatusBadge status={pedido.status} />
                                <CancelOrderButton
                                  status={pedido.status}
                                  pedidoId={pedido.pedido_id}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex-1 p-4 md:p-6">
                          <div className="mb-4">
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="font-medium">
                                Resumen del Pedido
                              </h4>
                              <span className="font-semibold text-xl">
                                $
                                {calculateOrderTotal(
                                  pedido.detalles
                                ).toLocaleString("es-MX")}
                              </span>
                            </div>
                            <div className="text-sm text-gray-500">
                              {pedido.detalles.length}{" "}
                              {pedido.detalles.length === 1
                                ? "producto"
                                : "productos"}
                            </div>
                          </div>

                          <div className="space-y-3">
                            {pedido.detalles.slice(0, 2).map((detalle) => (
                              <div
                                key={detalle.detalle_id}
                                className="flex items-center gap-3"
                              >
                                <div className="w-12 h-12 bg-gray-100 rounded flex-shrink-0 overflow-hidden relative">
                                  {detalle.producto.producto_imagenes.length >
                                  0 ? (
                                    <div className="relative w-full h-full">
                                      <Link
                                        href={`/productos/${detalle.producto.producto_id}`}
                                      >
                                        <img
                                          src={`${API_BASE_URL}${detalle.producto.producto_imagenes[0]}`}
                                          alt={detalle.producto.producto_nombre}
                                          className="object-cover w-full h-full"
                                        />
                                      </Link>
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-center w-full h-full bg-gray-200">
                                      <Package className="h-6 w-6 text-gray-400" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <Link
                                    href={`/productos/${detalle.producto.producto_id}`}
                                  >
                                    <h5 className="font-medium text-sm hover:underline hover:text-blue-600">
                                      {detalle.producto.producto_nombre}
                                    </h5>
                                  </Link>
                                  <div className="text-xs text-gray-500">
                                    Cantidad: {detalle.amount} × $
                                    {detalle.unit_price.toLocaleString("es-MX")}
                                    {detalle.discount > 0 && (
                                      <span className="ml-1 text-green-600">
                                        (-{detalle.discount}%)
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}

                            {pedido.detalles.length > 2 && (
                              <div className="text-sm text-blue-600">
                                + {pedido.detalles.length - 2} productos más
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Detailed View */}
            <TabsContent value="detail">
              {filteredOrders.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <Package className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                  <h3 className="text-lg font-medium text-gray-900">
                    No se encontraron pedidos
                  </h3>
                  <p className="text-gray-500 mt-1">
                    {searchTerm || statusFilter !== "all"
                      ? "No hay resultados para tu búsqueda actual."
                      : "Aún no has realizado ningún pedido."}
                  </p>
                </div>
              ) : (
                <Accordion type="single" collapsible className="space-y-4">
                  {filteredOrders.map((pedido) => (
                    <AccordionItem
                      key={pedido.pedido_id}
                      value={`pedido-${pedido.pedido_id}`}
                      className="border rounded-lg overflow-hidden"
                    >
                      <AccordionTrigger className="px-6 py-4 hover:bg-gray-50">
                        <div className="flex flex-col md:flex-row md:items-center w-full text-left gap-y-2">
                          <div className="md:w-1/4">
                            <span className="text-sm text-gray-500">
                              Pedido No.
                            </span>
                            <h3 className="text-lg font-semibold">
                              #{pedido.pedido_id}
                            </h3>
                          </div>
                          <div className="md:w-1/4">
                            <span className="text-sm text-gray-500">Fecha</span>
                            <div>{formatDate(pedido.fecha_pedido)}</div>
                          </div>
                          <div className="md:w-1/4">
                            <span className="text-sm text-gray-500">
                              Estado
                            </span>
                            <div>
                              <StatusBadge status={pedido.status} />
                            </div>
                          </div>
                          <div className="md:w-1/4 text-right md:text-left">
                            <span className="text-sm text-gray-500">Total</span>
                            <div className="font-semibold">
                              $
                              {calculateOrderTotal(
                                pedido.detalles
                              ).toLocaleString("es-MX")}
                            </div>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="bg-gray-50 p-6 border-t">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <div>
                              <h4 className="font-medium mb-2 flex items-center">
                                <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                                Fecha del Pedido
                              </h4>
                              <p>{formatDate(pedido.fecha_pedido)}</p>
                            </div>
                            <div>
                              <h4 className="font-medium mb-2 flex items-center">
                                <CreditCard className="h-4 w-4 mr-2 text-gray-500" />
                                Método de Pago
                              </h4>
                              <div>
                                <PaymentMethodBadge
                                  method={pedido.metodo_pago}
                                />
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between items-center">
                                <h4 className="font-medium mb-2 flex items-center">
                                  <Truck className="h-4 w-4 mr-2 text-gray-500" />
                                  Estado del Pedido
                                </h4>
                                <CancelOrderButton
                                  status={pedido.status}
                                  pedidoId={pedido.pedido_id}
                                />
                              </div>
                              <div>
                                <StatusBadge status={pedido.status} />
                              </div>
                            </div>
                          </div>

                          <ScrollArea className="h-auto max-h-[500px]">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Producto</TableHead>
                                  <TableHead>Variantes</TableHead>
                                  <TableHead className="text-right">
                                    Precio
                                  </TableHead>
                                  <TableHead className="text-right">
                                    Cantidad
                                  </TableHead>
                                  <TableHead className="text-right">
                                    Descuento
                                  </TableHead>
                                  <TableHead className="text-right">
                                    Total
                                  </TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {pedido.detalles.map((detalle) => {
                                  const itemTotal =
                                    detalle.amount *
                                    detalle.unit_price *
                                    (1 - detalle.discount / 100);

                                  return (
                                    <TableRow key={detalle.detalle_id}>
                                      <TableCell className="min-w-[200px]">
                                        <div className="flex items-center gap-3">
                                          <div className="w-12 h-12 bg-gray-100 rounded flex-shrink-0 overflow-hidden relative">
                                            {detalle.producto.producto_imagenes
                                              .length > 0 ? (
                                              <div className="relative w-full h-full">
                                                <img
                                                  src={`${API_BASE_URL}${detalle.producto.producto_imagenes[0]}`}
                                                  alt={
                                                    detalle.producto
                                                      .producto_nombre
                                                  }
                                                  className="object-cover w-full h-full"
                                                />
                                              </div>
                                            ) : (
                                              <div className="flex items-center justify-center w-full h-full bg-gray-200">
                                                <Package className="h-6 w-6 text-gray-400" />
                                              </div>
                                            )}
                                          </div>
                                          <div>
                                            <div className="font-medium">
                                              {detalle.producto.producto_nombre}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                              ID: {detalle.producto.producto_id}
                                            </div>
                                          </div>
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        {detalle.producto.variantes.length >
                                        0 ? (
                                          <div className="flex flex-wrap gap-1">
                                            {detalle.producto.variantes.map(
                                              (variante) => (
                                                <Badge
                                                  key={variante.id_pd}
                                                  variant="outline"
                                                  className="text-xs"
                                                >
                                                  <span className="mr-1">
                                                    {variante.detail_name}:
                                                  </span>
                                                  {variante.detail_name.toLowerCase() ===
                                                  "color" ? (
                                                    <div className="flex items-center">
                                                      <div
                                                        className="w-3 h-3 rounded-full mr-1"
                                                        style={{
                                                          backgroundColor:
                                                            variante.detail_desc,
                                                        }}
                                                      />
                                                      {variante.detail_desc}
                                                    </div>
                                                  ) : (
                                                    variante.detail_desc
                                                  )}
                                                </Badge>
                                              )
                                            )}
                                          </div>
                                        ) : (
                                          <span className="text-gray-400 text-sm">
                                            —
                                          </span>
                                        )}
                                      </TableCell>
                                      <TableCell className="text-right">
                                        $
                                        {detalle.unit_price.toLocaleString(
                                          "es-MX"
                                        )}
                                      </TableCell>
                                      <TableCell className="text-right">
                                        {detalle.amount}
                                      </TableCell>
                                      <TableCell className="text-right">
                                        {detalle.discount > 0 ? (
                                          <Badge
                                            variant="outline"
                                            className="text-green-600 border-green-200"
                                          >
                                            <Tag className="h-3 w-3 mr-1" />
                                            {detalle.discount}%
                                          </Badge>
                                        ) : (
                                          <span className="text-gray-400 text-sm">
                                            —
                                          </span>
                                        )}
                                      </TableCell>
                                      <TableCell className="text-right font-medium">
                                        ${itemTotal.toLocaleString("es-MX")}
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          </ScrollArea>

                          <div className="mt-6 border-t pt-4">
                            <div className="flex justify-end">
                              <div className="w-full max-w-md">
                                <div className="flex justify-between py-2">
                                  <span className="text-gray-600">
                                    Subtotal
                                  </span>
                                  <span>
                                    $
                                    {pedido.detalles
                                      .reduce(
                                        (acc, detalle) =>
                                          acc +
                                          detalle.amount * detalle.unit_price,
                                        0
                                      )
                                      .toLocaleString("es-MX")}
                                  </span>
                                </div>
                                <div className="flex justify-between py-2">
                                  <span className="text-gray-600">
                                    Descuentos
                                  </span>
                                  <span className="text-green-600">
                                    -$
                                    {pedido.detalles
                                      .reduce(
                                        (acc, detalle) =>
                                          acc +
                                          (detalle.amount *
                                            detalle.unit_price *
                                            detalle.discount) /
                                            100,
                                        0
                                      )
                                      .toLocaleString("es-MX")}
                                  </span>
                                </div>
                                <div className="flex justify-between py-2 font-medium text-lg border-t">
                                  <span>Total</span>
                                  <span>
                                    $
                                    {calculateOrderTotal(
                                      pedido.detalles
                                    ).toLocaleString("es-MX")}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function OrdersSkeleton() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <NavbarBlack />
      <div className="container mx-auto py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-8 w-36" />
          </div>

          <Skeleton className="h-16 w-full mb-6" />

          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <Card key={item} className="overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/4 bg-gray-50 p-6">
                    <div className="space-y-4">
                      <Skeleton className="h-6 w-28 mb-1" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-6 w-24" />
                    </div>
                  </div>
                  <div className="flex-1 p-6">
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-6 w-24" />
                      </div>
                      <Skeleton className="h-4 w-16" />
                    </div>

                    <div className="space-y-3">
                      {[1, 2].map((product) => (
                        <div key={product} className="flex items-center gap-3">
                          <Skeleton className="w-12 h-12 rounded" />
                          <div className="flex-1">
                            <Skeleton className="h-4 w-32 mb-1" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
