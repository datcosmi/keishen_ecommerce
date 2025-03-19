"use client";
import React, { useState, useEffect } from "react";
import {
  Search,
  Eye,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ShoppingBag,
  Calendar,
  CreditCard,
  List,
  Grid,
  RefreshCw,
} from "lucide-react";
import Sidebar from "../components/admins/sidebar";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Product {
  producto_id: number;
  producto_nombre: string;
  producto_precio: number;
  producto_imagenes: string[];
}

interface OrderDetail {
  detalle_id: number;
  amount: number;
  unit_price: number;
  producto: Product;
}

interface Order {
  pedido_id: number;
  fecha_pedido: string;
  status: "pendiente" | "finalizado";
  metodo_pago: "mercado pago" | "paypal" | "efectivo";
  cliente: string;
  detalles: OrderDetail[];
}

type SortField = "id" | "date" | "status" | "paymentMethod" | "total";
type SortDirection = "asc" | "desc";
const API_BASE_URL = "http://localhost:3001/api";

const OrderDashboard: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Todos");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Ordenamiento
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Vista
  const [isGridView, setIsGridView] = useState(true);

  // Modal de detalles
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/pedidos/details`);
      if (!response.ok) {
        throw new Error(`Error fetching orders: ${response.statusText}`);
      }
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleRefresh = async () => {
    fetchOrders();
  };

  // Calcular las cantidades para los filtros
  const pendienteCount = orders.filter((o) => o.status === "pendiente").length;
  const finalizadoCount = orders.filter(
    (o) => o.status === "finalizado"
  ).length;

  const statusOptions = [
    { id: "todos", label: "Todos", count: orders.length },
    { id: "pendiente", label: "Pendiente", count: pendienteCount },
    { id: "finalizado", label: "Finalizado", count: finalizadoCount },
  ];

  // Calcular el total de un pedido
  const calculateOrderTotal = (order: Order): number => {
    return order.detalles.reduce(
      (total, item) => total + item.unit_price * item.amount,
      0
    );
  };

  // Formatear fecha
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Aplicar los filtros por búsqueda y estado
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.pedido_id.toString().includes(searchQuery.toString()) ||
      order.cliente.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.metodo_pago.toLowerCase().includes(searchQuery.toLowerCase());

    // Aplicar filtro por estado
    if (
      selectedStatus !== "Todos" &&
      order.status !== selectedStatus.toLowerCase()
    ) {
      return false;
    }

    return matchesSearch;
  });

  // Ordenar los pedidos
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (sortField === "id") {
      return sortDirection === "asc"
        ? a.pedido_id - b.pedido_id
        : b.pedido_id - a.pedido_id;
    } else if (sortField === "date") {
      return sortDirection === "asc"
        ? new Date(a.fecha_pedido).getTime() -
            new Date(b.fecha_pedido).getTime()
        : new Date(b.fecha_pedido).getTime() -
            new Date(a.fecha_pedido).getTime();
    } else if (sortField === "status") {
      return sortDirection === "asc"
        ? a.status.localeCompare(b.status)
        : b.status.localeCompare(a.status);
    } else if (sortField === "paymentMethod") {
      return sortDirection === "asc"
        ? a.metodo_pago.localeCompare(b.metodo_pago)
        : b.metodo_pago.localeCompare(a.metodo_pago);
    } else if (sortField === "total") {
      const totalA = calculateOrderTotal(a);
      const totalB = calculateOrderTotal(b);
      return sortDirection === "asc" ? totalA - totalB : totalB - totalA;
    }
    return 0;
  });

  // Actualizar el total de páginas cuando los pedidos filtrados cambian
  useEffect(() => {
    setTotalPages(Math.max(1, Math.ceil(filteredOrders.length / rowsPerPage)));
    setCurrentPage(1); // Resetear a la primera página cuando cambian los filtros
  }, [filteredOrders.length, rowsPerPage]);

  // Paginación
  const indexOfLastOrder = currentPage * rowsPerPage;
  const indexOfFirstOrder = indexOfLastOrder - rowsPerPage;
  const currentOrders = sortedOrders.slice(indexOfFirstOrder, indexOfLastOrder);

  // Manejadores para la paginación
  const handlePageChange = (page: number) => {
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (value: string) => {
    setRowsPerPage(Number(value));
    setCurrentPage(1); // Resetear a la primera página cuando cambia el número de filas
  };

  // Manejador para el ordenamiento
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Cambiar dirección si es la misma columna
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Nueva columna, comenzar con ascendente
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Actualizar el estado de un pedido
  const handleUpdateStatus = (
    orderId: number,
    newStatus: "pendiente" | "finalizado"
  ) => {
    setOrders(
      orders.map((order) =>
        order.pedido_id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  // Ver detalles de un pedido
  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
  };

  // Renderizar indicador de ordenamiento
  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ChevronUp className="ml-1 h-4 w-4" />
    ) : (
      <ChevronDown className="ml-1 h-4 w-4" />
    );
  };

  // Renderizar el badge de estado con el color correspondiente
  const renderStatusBadge = (status: string) => {
    let colorClass = "";

    switch (status) {
      case "pendiente":
        colorClass = "bg-yellow-50 text-yellow-600 border-yellow-300";
        break;
      case "finalizado":
        colorClass = "bg-green-50 text-green-600 border-green-300";
        break;
      default:
        colorClass = "bg-gray-50 text-gray-600 border-gray-300";
    }

    return (
      <Badge variant="outline" className={colorClass}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="flex flex-col md:flex-row gap-2 min-h-screen bg-[#eaeef6]">
      <Sidebar />
      <div className="p-6 flex-1">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Pedidos</h1>
            <p className="text-sm text-gray-500">
              Gestiona los pedidos de tus clientes
            </p>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex gap-4 mb-8 overflow-x-auto">
          {statusOptions.map((option) => (
            <Button
              key={option.id}
              variant={selectedStatus === option.label ? "default" : "outline"}
              className={`rounded-lg text-sm font-medium ${
                selectedStatus === option.label
                  ? "bg-black text-white"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
              onClick={() => setSelectedStatus(option.label)}
            >
              {option.label}
              <span className="ml-2 text-xs">{option.count}</span>
            </Button>
          ))}

          <div className="flex ml-auto">
            <Button
              variant={isGridView ? "outline" : "default"}
              size="icon"
              className={`mr-2 ${!isGridView ? "bg-black text-white" : ""}`}
              onClick={() => setIsGridView(false)}
            >
              <List className="h-5 w-5" />
            </Button>
            <Button
              variant={isGridView ? "default" : "outline"}
              size="icon"
              className={isGridView ? "bg-black text-white" : ""}
              onClick={() => setIsGridView(true)}
            >
              <Grid className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Barra de búsqueda */}
        <div className="relative mb-6 flex">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              type="text"
              className="pl-10 pr-3 bg-white"
              placeholder="Buscar pedidos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            className="ml-2"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
            <span className="ml-2">Actualizar</span>
          </Button>
        </div>

        {/* Estado para cargar los pedidos */}
        {loading ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p>Cargando pedidos...</p>
            </CardContent>
          </Card>
        ) : (
          /* Tabla de pedidos */
          <Card>
            <CardContent className="p-0">
              {!isGridView ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead
                          className="cursor-pointer"
                          onClick={() => handleSort("id")}
                        >
                          <div className="flex items-center">
                            Pedido
                            {renderSortIndicator("id")}
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer"
                          onClick={() => handleSort("date")}
                        >
                          <div className="flex items-center">
                            Fecha
                            {renderSortIndicator("date")}
                          </div>
                        </TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead
                          className="cursor-pointer"
                          onClick={() => handleSort("status")}
                        >
                          <div className="flex items-center">
                            Estado
                            {renderSortIndicator("status")}
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer"
                          onClick={() => handleSort("paymentMethod")}
                        >
                          <div className="flex items-center">
                            Método de pago
                            {renderSortIndicator("paymentMethod")}
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer"
                          onClick={() => handleSort("total")}
                        >
                          <div className="flex items-center">
                            Total
                            {renderSortIndicator("total")}
                          </div>
                        </TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentOrders.map((order) => (
                        <TableRow
                          key={order.pedido_id}
                          className="hover:bg-gray-50"
                        >
                          <TableCell>
                            <div className="font-medium">{order.pedido_id}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-600">
                              {formatDate(order.fecha_pedido)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-600">
                              {order.cliente}
                            </div>
                          </TableCell>
                          <TableCell>
                            {renderStatusBadge(order.status)}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-600">
                              {order.metodo_pago.charAt(0).toUpperCase() +
                                order.metodo_pago.slice(1)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              ${calculateOrderTotal(order).toLocaleString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleViewDetails(order)}
                                    className="text-blue-600 hover:text-blue-800"
                                  >
                                    <Eye size={18} />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md">
                                  <DialogHeader>
                                    <DialogTitle>
                                      Detalles del Pedido #{order.pedido_id}
                                    </DialogTitle>
                                    <DialogDescription>
                                      Información completa del pedido
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="mt-4 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <p className="text-sm font-medium text-gray-500">
                                          Cliente
                                        </p>
                                        <p className="text-sm">
                                          {order.cliente}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium text-gray-500">
                                          Fecha
                                        </p>
                                        <p className="text-sm">
                                          {formatDate(order.fecha_pedido)}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium text-gray-500">
                                          Estado
                                        </p>
                                        <div className="mt-1">
                                          {renderStatusBadge(order.status)}
                                        </div>
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium text-gray-500">
                                          Método de pago
                                        </p>
                                        <p className="text-sm">
                                          {order.metodo_pago
                                            .charAt(0)
                                            .toUpperCase() +
                                            order.metodo_pago.slice(1)}
                                        </p>
                                      </div>
                                    </div>

                                    <div>
                                      <p className="text-sm font-medium text-gray-500 mb-2">
                                        Productos
                                      </p>
                                      <Table>
                                        <TableHeader>
                                          <TableRow>
                                            <TableHead>Producto</TableHead>
                                            <TableHead>Cantidad</TableHead>
                                            <TableHead>
                                              Precio unitario
                                            </TableHead>
                                            <TableHead>Subtotal</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {order.detalles.map((item, index) => (
                                            <TableRow key={index}>
                                              <TableCell>
                                                Producto{" "}
                                                {item.producto.producto_nombre}
                                              </TableCell>
                                              <TableCell>
                                                {item.amount}
                                              </TableCell>
                                              <TableCell>
                                                $
                                                {item.unit_price.toLocaleString()}
                                              </TableCell>
                                              <TableCell>
                                                $
                                                {(
                                                  item.amount * item.unit_price
                                                ).toLocaleString()}
                                              </TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                      <div className="text-right mt-2">
                                        <p className="font-medium">
                                          Total: $
                                          {calculateOrderTotal(
                                            order
                                          ).toLocaleString()}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>

                              {/* Menú para actualizar estado */}
                              <Select
                                value={order.status}
                                onValueChange={(
                                  value: "pendiente" | "finalizado"
                                ) => handleUpdateStatus(order.pedido_id, value)}
                              >
                                <SelectTrigger className="w-[110px] h-8">
                                  <SelectValue placeholder="Actualizar" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pendiente">
                                    Pendiente
                                  </SelectItem>
                                  <SelectItem value="finalizado">
                                    Finalizado
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}

                      {currentOrders.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={7}
                            className="text-center text-gray-500 h-32"
                          >
                            No se encontraron pedidos con los filtros actuales
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                // Vista de cuadrícula
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                  {currentOrders.map((order) => (
                    <Card key={order.pedido_id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-medium">
                              Pedido #{order.pedido_id}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {order.cliente}
                            </p>
                          </div>
                          {renderStatusBadge(order.status)}
                        </div>

                        <div className="space-y-2 mb-3">
                          <div className="flex items-center text-sm">
                            <Calendar
                              size={16}
                              className="mr-2 text-gray-400"
                            />
                            <span>{formatDate(order.fecha_pedido)}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <CreditCard
                              size={16}
                              className="mr-2 text-gray-400"
                            />
                            <span>
                              {order.metodo_pago.charAt(0).toUpperCase() +
                                order.metodo_pago.slice(1)}
                            </span>
                          </div>
                          <div className="flex items-center text-sm">
                            <ShoppingBag
                              size={16}
                              className="mr-2 text-gray-400"
                            />
                            <span>{order.detalles.length} productos</span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center mb-4">
                          <span className="text-sm text-gray-500">Total:</span>
                          <span className="font-semibold">
                            ${calculateOrderTotal(order).toLocaleString()}
                          </span>
                        </div>

                        <div className="flex justify-between space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onClick={() => handleViewDetails(order)}
                              >
                                <Eye size={16} className="mr-1" />
                                Ver detalles
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                              <DialogHeader>
                                <DialogTitle>
                                  Detalles del Pedido #{order.pedido_id}
                                </DialogTitle>
                                <DialogDescription>
                                  Información completa del pedido
                                </DialogDescription>
                              </DialogHeader>
                              <div className="mt-4 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm font-medium text-gray-500">
                                      Cliente
                                    </p>
                                    <p className="text-sm">{order.cliente}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-500">
                                      Fecha
                                    </p>
                                    <p className="text-sm">
                                      {formatDate(order.fecha_pedido)}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-500">
                                      Estado
                                    </p>
                                    <div className="mt-1">
                                      {renderStatusBadge(order.status)}
                                    </div>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-500">
                                      Método de pago
                                    </p>
                                    <p className="text-sm">
                                      {order.metodo_pago
                                        .charAt(0)
                                        .toUpperCase() +
                                        order.metodo_pago.slice(1)}
                                    </p>
                                  </div>
                                </div>

                                <div>
                                  <p className="text-sm font-medium text-gray-500 mb-2">
                                    Productos
                                  </p>
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Producto</TableHead>
                                        <TableHead>Cantidad</TableHead>
                                        <TableHead>Precio unitario</TableHead>
                                        <TableHead>Subtotal</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {order.detalles.map((item, index) => (
                                        <TableRow key={index}>
                                          <TableCell>
                                            Producto {item.producto.producto_id}
                                          </TableCell>
                                          <TableCell>{item.amount}</TableCell>
                                          <TableCell>
                                            ${item.unit_price.toLocaleString()}
                                          </TableCell>
                                          <TableCell>
                                            $
                                            {(
                                              item.amount * item.unit_price
                                            ).toLocaleString()}
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                  <div className="text-right mt-2">
                                    <p className="font-medium">
                                      Total: $
                                      {calculateOrderTotal(
                                        order
                                      ).toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <Select
                            value={order.status}
                            onValueChange={(
                              value: "pendiente" | "finalizado"
                            ) => handleUpdateStatus(order.pedido_id, value)}
                          >
                            <SelectTrigger className="flex-1 h-8">
                              <SelectValue placeholder="Estado" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pendiente">
                                Pendiente
                              </SelectItem>
                              <SelectItem value="finalizado">
                                Finalizado
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {currentOrders.length === 0 && (
                    <div className="col-span-full text-center text-gray-500 py-12">
                      No se encontraron pedidos con los filtros actuales
                    </div>
                  )}
                </div>
              )}

              {/* Paginación */}
              {filteredOrders.length > 0 && (
                <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
                  <div className="flex items-center">
                    <Select
                      value={rowsPerPage.toString()}
                      onValueChange={handleRowsPerPageChange}
                    >
                      <SelectTrigger className="w-20 h-8">
                        <SelectValue placeholder={rowsPerPage.toString()} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="text-sm text-gray-500 ml-2">
                      filas por página
                    </span>
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <span className="text-sm text-gray-700">
                      Página {currentPage} de {totalPages}
                    </span>

                    <div className="flex ml-2 gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage === 1}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronsLeft size={16} />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronLeft size={16} />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronRight size={16} />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handlePageChange(totalPages)}
                        disabled={currentPage === totalPages}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronsRight size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default OrderDashboard;
