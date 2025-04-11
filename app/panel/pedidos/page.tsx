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
  Edit,
  Trash2,
  X,
  CheckSquare,
  Square,
  RulerIcon,
  LayersIcon,
  TagIcon,
  CircleIcon,
  Plus,
} from "lucide-react";
import OrderDetailsModal from "@/components/orderDetailModal";

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
import { Dialog } from "@/components/ui/dialog";
import { toast } from "sonner";
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
import OrderFormModal from "@/components/forms/orderFormModal";
import { Order, ProductVariant } from "@/types/orderTypes";

type SortField = "id" | "date" | "status" | "paymentMethod" | "total";
type SortDirection = "asc" | "desc";
const API_BASE_URL = "http://localhost:3001/api";

const OrderDashboard: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Todos");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Estado para los pedidos seleccionados
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
  const [confirmDelete, setConfirmDelete] = useState(false);

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
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Modal de creación y edición
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [orderToEdit, setOrderToEdit] = useState<Order | null>(null);

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
    // Limpiar selección al refrescar
    setSelectedOrders([]);
    fetchOrders();
  };

  const canDeleteOrders = (selectedIds: number[]) => {
    return selectedIds.every((id) => {
      const order = orders.find((order) => order.pedido_id === id);
      return order && order.status === "pendiente";
    });
  };

  // Funciones para manejar selección de pedidos
  const handleSelectOrder = (orderId: number) => {
    setSelectedOrders((prev) => {
      // Si ya está seleccionado, lo quitamos
      if (prev.includes(orderId)) {
        return prev.filter((id) => id !== orderId);
      }
      // Si no está seleccionado, lo añadimos
      return [...prev, orderId];
    });
  };

  const handleSelectAll = () => {
    if (selectedOrders.length === currentOrders.length) {
      // Si todos están seleccionados, deseleccionamos todos
      setSelectedOrders([]);
    } else {
      // Si no todos están seleccionados, seleccionamos todos
      setSelectedOrders(currentOrders.map((order) => order.pedido_id));
    }
  };

  const handleClearSelection = () => {
    setSelectedOrders([]);
    setOrderToEdit(null);
    setIsEditModalOpen(false);
  };

  // Función para eliminar pedidos seleccionados
  const handleDeleteSelected = async () => {
    if (selectedOrders.length === 0) return;

    // Check if all selected orders can be deleted
    if (!canDeleteOrders(selectedOrders)) {
      toast.error("Solo se pueden eliminar pedidos con estado 'pendiente'.");
      setConfirmDelete(false);
      return;
    }

    setDeleteLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/pedidos`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids: selectedOrders }),
      });

      if (!response.ok) {
        throw new Error(`Error deleting orders: ${response.statusText}`);
      }

      // Eliminar pedidos localmente
      setOrders((prev) =>
        prev.filter((order) => !selectedOrders.includes(order.pedido_id))
      );
      setSelectedOrders([]);
      toast.success(
        `Se han eliminado ${selectedOrders.length} pedido(s) correctamente.`
      );
    } catch (error) {
      console.error("Error deleting orders:", error);
      toast.error("Error al eliminar los pedidos. Inténtalo de nuevo.");
    } finally {
      setDeleteLoading(false);
      setConfirmDelete(false);
    }
  };

  const transformOrderForEdit = (order: Order | null) => {
    if (!order) return undefined;

    return {
      id_pedido: order.pedido_id,
      fecha_pedido: order.fecha_pedido,
      status: order.status as "pendiente" | "enviado" | "finalizado",
      metodo_pago: order.metodo_pago as "efectivo" | "mercado pago" | "paypal",
      cliente: order.cliente,
      detalles: order.detalles.map((detail) => ({
        prod_id: detail.producto.producto_id,
        amount: detail.amount,
        unit_price: detail.unit_price,
        productName: detail.producto.producto_nombre,
        selected_details: detail.producto.variantes?.map((v) => v.id_pd) || [],
      })),
    };
  };

  const handleEditOrder = () => {
    if (selectedOrders.length === 1) {
      const selectedOrderId = selectedOrders[0];
      const orderToEdit = orders.find(
        (order) => order.pedido_id === selectedOrderId
      );
      if (orderToEdit) {
        setOrderToEdit(orderToEdit);
        setIsEditModalOpen(true);
      }
    }
  };

  // Calcular las cantidades para los filtros
  const pendienteCount = orders.filter((o) => o.status === "pendiente").length;
  const enviadoCount = orders.filter((o) => o.status === "enviado").length;
  const finalizadoCount = orders.filter(
    (o) => o.status === "finalizado"
  ).length;

  const statusOptions = [
    { id: "todos", label: "Todos", count: orders.length },
    { id: "pendiente", label: "Pendiente", count: pendienteCount },
    { id: "enviado", label: "Enviado", count: enviadoCount },
    { id: "finalizado", label: "Finalizado", count: finalizadoCount },
  ];

  // Calcular el total de un pedido
  const calculateOrderTotal = (order: Order): number => {
    return order.detalles.reduce((total, item) => {
      const discountMultiplier = 1 - item.discount / 100;
      return total + item.unit_price * item.amount * discountMultiplier;
    }, 0);
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
      case "enviado":
        colorClass = "bg-blue-50 text-blue-600 border-blue-300";
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

  const openOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsModalOpen(true);
  };

  // Comprobar si hay un único pedido seleccionado para mostrar el botón de editar
  const singleOrderSelected = selectedOrders.length === 1;

  return (
    <div className="flex flex-col md:flex-row gap-2 min-h-screen">
      <div className="p-6 flex-1">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Pedidos</h1>
            <p className="text-sm text-gray-500">
              Gestiona los pedidos de tus clientes
            </p>
          </div>

          {/* Botones de acción para selección */}
          <div className="flex gap-2">
            {selectedOrders.length > 0 && (
              <>
                {!canDeleteOrders(selectedOrders) &&
                  selectedOrders.length > 0 && (
                    <div className="flex items-center align-content-center">
                      <span className="text-xs text-red-500 mr-2">
                        Solo puedes eliminar pedidos pendientes
                      </span>
                    </div>
                  )}
                <Button
                  variant="outline"
                  onClick={handleClearSelection}
                  className="text-gray-600"
                >
                  Cancelar ({selectedOrders.length})
                </Button>
                {singleOrderSelected && (
                  <Button
                    variant="outline"
                    className="bg-blue-50 text-blue-600 hover:text-blue-600 border-blue-200 hover:bg-blue-100"
                    onClick={handleEditOrder}
                  >
                    <Edit size={16} className="mr-1" />
                    Editar
                  </Button>
                )}
                <AlertDialog
                  open={confirmDelete}
                  onOpenChange={setConfirmDelete}
                >
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="bg-red-50 text-red-600 hover:text-red-600 border-red-200 hover:bg-red-100"
                      disabled={!canDeleteOrders(selectedOrders)}
                    >
                      <Trash2 size={18} className="mr-1" />
                      Eliminar
                    </Button>
                  </AlertDialogTrigger>

                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        ¿Eliminar pedidos seleccionados?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Estás a punto de eliminar {selectedOrders.length}{" "}
                        pedido(s). Esta acción no se puede deshacer.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteSelected}
                        disabled={deleteLoading}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        {deleteLoading ? "Eliminando..." : "Eliminar"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}

            <OrderFormModal
              isEditMode={false}
              onOrderAdded={handleRefresh}
              buttonLabel="Nuevo Pedido"
              buttonIcon={<Plus className="h-5 w-5 mr-2" />}
            />

            {/* Edit Modal */}
            {orderToEdit && (
              <OrderFormModal
                existingOrder={transformOrderForEdit(orderToEdit)}
                isEditMode={true}
                onOrderUpdated={handleRefresh}
                isOpen={isEditModalOpen}
                onOpenChange={setIsEditModalOpen}
                hideButton={true}
              />
            )}
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
                        <TableHead className="w-10">
                          <div className="flex items-center justify-center">
                            <button
                              onClick={handleSelectAll}
                              className="focus:outline-none"
                            >
                              {selectedOrders.length === currentOrders.length &&
                              currentOrders.length > 0 ? (
                                <CheckSquare
                                  size={18}
                                  className="text-blue-600"
                                />
                              ) : (
                                <Square size={18} className="text-gray-400" />
                              )}
                            </button>
                          </div>
                        </TableHead>
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
                        <TableHead>Productos totales</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentOrders.map((order) => (
                        <TableRow
                          key={order.pedido_id}
                          className={`hover:bg-gray-50 ${
                            selectedOrders.includes(order.pedido_id)
                              ? "bg-blue-50"
                              : ""
                          }`}
                        >
                          <TableCell className="p-2 text-center">
                            <button
                              onClick={() => handleSelectOrder(order.pedido_id)}
                              className="focus:outline-none"
                            >
                              {selectedOrders.includes(order.pedido_id) ? (
                                <CheckSquare
                                  size={18}
                                  className="text-blue-600"
                                />
                              ) : (
                                <Square size={18} className="text-gray-400" />
                              )}
                            </button>
                          </TableCell>
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
                              {order.cliente || "No especificado"}
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
                              {order.detalles.some(
                                (item) => item.discount > 0
                              ) && (
                                <Badge className="ml-2 bg-orange-50 text-orange-600 border-orange-200">
                                  Con descuento
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              {order.detalles.length}{" "}
                              {order.detalles.length === 1
                                ? "producto"
                                : "productos"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant={"outline"}
                              size={"sm"}
                              className="flex-1"
                              onClick={() => openOrderDetails(order)}
                            >
                              <Eye size={16} />
                              Ver detalles
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}

                      {currentOrders.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={8}
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
                    <Card
                      key={order.pedido_id}
                      className={
                        selectedOrders.includes(order.pedido_id)
                          ? "ring-2 ring-blue-500"
                          : ""
                      }
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <button
                              onClick={() => handleSelectOrder(order.pedido_id)}
                              className="mr-2 focus:outline-none"
                            >
                              {selectedOrders.includes(order.pedido_id) ? (
                                <CheckSquare
                                  size={18}
                                  className="text-blue-600"
                                />
                              ) : (
                                <Square size={18} className="text-gray-400" />
                              )}
                            </button>
                            <div>
                              <h3 className="font-medium">
                                Pedido #{order.pedido_id}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {order.cliente || "No especificado"}
                              </p>
                            </div>
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
                            <span>
                              {order.detalles.length}{" "}
                              {order.detalles.length === 1
                                ? "producto"
                                : "productos"}
                            </span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center mb-4">
                          <span className="text-sm text-gray-500">Total:</span>
                          <div>
                            <span className="font-semibold">
                              ${calculateOrderTotal(order).toLocaleString()}
                            </span>
                            {order.detalles.some(
                              (item) => item.discount > 0
                            ) && (
                              <Badge className="ml-2 bg-orange-50 text-orange-600 border-orange-200 text-xs">
                                Con descuento
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex justify-between space-x-2">
                          <Button
                            variant={isGridView ? "outline" : "ghost"}
                            size={isGridView ? "sm" : "icon"}
                            className={
                              isGridView
                                ? "flex-1"
                                : "text-blue-600 hover:text-blue-800"
                            }
                            onClick={() => openOrderDetails(order)}
                          >
                            <Eye
                              size={isGridView ? 16 : 18}
                              className={isGridView ? "mr-1" : ""}
                            />
                            {isGridView && "Ver detalles"}
                          </Button>
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
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setIsDetailsModalOpen(false)}
        />
      </Dialog>
    </div>
  );
};

export default OrderDashboard;
