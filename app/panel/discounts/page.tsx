"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  RefreshCw,
  Plus,
  CheckSquare,
  Square,
  Tags,
  ShoppingBag,
} from "lucide-react";
import Sidebar from "@/components/sidebar";
import { toast } from "sonner";

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
import { Discount } from "@/types/discountTypes";
import DiscountFormModal from "@/components/forms/discountFormModal";

// Types for discounts
type DiscountType = "product" | "category";

type SortField = "percent" | "start_date" | "end_date";
type SortDirection = "asc" | "desc";

const API_BASE_URL = "http://localhost:3001/api";

const DiscountDashboard: React.FC = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [discountType, setDiscountType] = useState<DiscountType>("product");
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);

  // Selection and editing states
  const [selectedDiscounts, setSelectedDiscounts] = useState<number[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [totalPages, setTotalPages] = useState(1);

  // Sorting
  const [sortField, setSortField] = useState<SortField>("percent");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const handleEditDiscount = async (discountId: number) => {
    // Find the discount in the current list
    const discountToEdit = discounts.find((d) => d.id_discount === discountId);
    if (discountToEdit) {
      setEditingDiscount(discountToEdit);
      setEditModalOpen(true);
    }
  };

  // Fetch discounts based on type
  const fetchDiscounts = async (type: DiscountType) => {
    setLoading(true);
    try {
      const endpoint =
        type === "product"
          ? `${API_BASE_URL}/descuentos/products`
          : `${API_BASE_URL}/descuentos/categories`;

      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(
          `Error fetching ${type} discounts: ${response.statusText}`
        );
      }
      const data = await response.json();
      setDiscounts(data);
    } catch (error) {
      console.error(`Error fetching ${type} discounts:`, error);
      toast.error(
        `No se pudieron cargar los descuentos de ${
          type === "product" ? "productos" : "categorías"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  // Initial and type change fetch
  useEffect(() => {
    fetchDiscounts(discountType);
  }, [discountType]);

  // Handlers for selection
  const handleDiscountSelect = (id: number) => {
    setSelectedDiscounts((prev) =>
      prev.includes(id)
        ? prev.filter((discountId) => discountId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedDiscounts.length === currentDiscounts.length) {
      setSelectedDiscounts([]);
    } else {
      setSelectedDiscounts(
        currentDiscounts.map((discount) => discount.id_discount)
      );
    }
  };

  // Handler for deleting discounts
  const handleDelete = async (type: DiscountType) => {
    setLoading(true);
    const endpoint =
      type === "product"
        ? `${API_BASE_URL}/descuentos/product`
        : `${API_BASE_URL}/descuentos/category`;

    try {
      const response = await fetch(endpoint, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids: selectedDiscounts }),
      });

      if (!response.ok) {
        throw new Error(`Error eliminando descuentos: ${response.statusText}`);
      }

      // Actualizar la lista de productos después de eliminar
      setDiscounts(
        discounts.filter(
          (discount) => !selectedDiscounts.includes(discount.id_discount)
        )
      );
      setSelectedDiscounts([]);
    } catch (error) {
      console.error("Error eliminando descuentos:", error);
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  // Filtering and sorting
  const filteredDiscounts = discounts.filter((discount) => {
    const matchesSearch =
      (discountType === "product"
        ? discount.product_name
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())
        : discount.category_name
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())) ||
      discount.percent.toString().includes(searchQuery);
    return matchesSearch;
  });

  // Sorting logic
  const sortedDiscounts = [...filteredDiscounts].sort((a, b) => {
    const getValue = (d: Discount, field: SortField) => {
      switch (field) {
        case "percent":
          return d.percent;
        case "start_date":
          return new Date(d.start_date).getTime();
        case "end_date":
          return new Date(d.end_date).getTime();
      }
    };

    const multiplier = sortDirection === "asc" ? 1 : -1;
    return multiplier * (getValue(a, sortField) - getValue(b, sortField));
  });

  // Pagination
  useEffect(() => {
    setTotalPages(
      Math.max(1, Math.ceil(filteredDiscounts.length / rowsPerPage))
    );
    setCurrentPage(1);
  }, [filteredDiscounts.length, rowsPerPage]);

  const indexOfLastDiscount = currentPage * rowsPerPage;
  const indexOfFirstDiscount = indexOfLastDiscount - rowsPerPage;
  const currentDiscounts = sortedDiscounts.slice(
    indexOfFirstDiscount,
    indexOfLastDiscount
  );

  // Date formatting
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Determine discount status
  const getDiscountStatus = (start_date: string, end_date: string) => {
    const now = new Date();
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    if (now < startDate)
      return { text: "Pendiente", color: "bg-yellow-50 text-yellow-600" };
    if (now > endDate)
      return { text: "Expirado", color: "bg-red-50 text-red-600" };
    return { text: "Activo", color: "bg-green-50 text-green-600" };
  };

  // Render sort indicator
  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ChevronUp className="ml-1 h-4 w-4" />
    ) : (
      <ChevronDown className="ml-1 h-4 w-4" />
    );
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (value: string) => {
    setRowsPerPage(Number(value));
    setCurrentPage(1);
  };

  // Sort handler
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-2 min-h-screen">
      <div className="p-6 flex-1">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Descuentos</h1>
            <p className="text-sm text-gray-500">
              Gestiona descuentos por productos y categorías
            </p>
          </div>
          <div className="flex items-center gap-2">
            {selectedDiscounts.length > 0 && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setSelectedDiscounts([])}
                  className="text-gray-600"
                >
                  Cancelar ({selectedDiscounts.length})
                </Button>

                {selectedDiscounts.length === 1 && (
                  <Button
                    variant="outline"
                    onClick={() => handleEditDiscount(selectedDiscounts[0])}
                    className="bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"
                  >
                    <Edit size={16} className="mr-1" />
                    Editar
                  </Button>
                )}

                <AlertDialog
                  open={deleteDialogOpen}
                  onOpenChange={setDeleteDialogOpen}
                >
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                    >
                      <Trash2 size={16} className="mr-1" />
                      Eliminar{" "}
                      {selectedDiscounts.length > 1
                        ? `(${selectedDiscounts.length})`
                        : ""}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmar eliminación</AlertDialogTitle>
                      <AlertDialogDescription>
                        {selectedDiscounts.length === 1
                          ? "¿Estás seguro de que deseas eliminar este descuento? Esta acción no se puede deshacer."
                          : `¿Estás seguro de que deseas eliminar estos ${selectedDiscounts.length} descuentos? Esta acción no se puede deshacer.`}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(discountType)}
                        className="bg-red-600 hover:bg-red-700"
                        disabled={loading}
                      >
                        {loading ? "Eliminando..." : "Eliminar"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
            <DiscountFormModal
              onDiscountAdded={(discount) => {
                // Handle the newly added discount, e.g., update your list
                console.log("New discount added:", discount);
                fetchDiscounts(
                  discountType === "product" ? "product" : "category"
                ); // Refresh your discount list
              }}
              buttonLabel="Añadir Descuento"
            />

            {editingDiscount && (
              <DiscountFormModal
                discount={editingDiscount}
                isOpen={editModalOpen}
                onOpenChange={setEditModalOpen}
                onDiscountAdded={() => {}} // Add this line with an empty function
                onDiscountUpdated={(updatedDiscount) => {
                  // Update the discount in the list
                  fetchDiscounts(discountType);
                  setSelectedDiscounts([]);
                  setEditingDiscount(null);
                }}
              />
            )}
          </div>
        </div>

        {/* Tipo de descuento */}
        <div className="flex gap-4 mb-8">
          <Button
            variant={discountType === "product" ? "default" : "outline"}
            onClick={() => setDiscountType("product")}
            className={`rounded-lg text-sm font-medium ${
              discountType === "product"
                ? "bg-black text-white"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <ShoppingBag className="mr-2 h-4 w-4" />
            Descuentos por Producto
          </Button>
          <Button
            variant={discountType === "category" ? "default" : "outline"}
            onClick={() => setDiscountType("category")}
            className={`rounded-lg text-sm font-medium ${
              discountType === "category"
                ? "bg-black text-white"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Tags className="mr-2 h-4 w-4" />
            Descuentos por Categoría
          </Button>
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
              placeholder={`Buscar descuentos por ${
                discountType === "product" ? "nombre de producto" : "categoría"
              }...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            className="ml-2"
            onClick={() => fetchDiscounts(discountType)}
            disabled={loading}
          >
            <RefreshCw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
            <span className="ml-2">Actualizar</span>
          </Button>
        </div>

        {/* Estado para cargar los descuentos */}
        {loading ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p>Cargando descuentos...</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">
                        <button
                          onClick={handleSelectAll}
                          className="focus:outline-none"
                        >
                          {selectedDiscounts.length ===
                            currentDiscounts.length &&
                          currentDiscounts.length > 0 ? (
                            <CheckSquare size={18} className="text-blue-600" />
                          ) : (
                            <Square size={18} className="text-gray-400" />
                          )}
                        </button>
                      </TableHead>
                      <TableHead>
                        {discountType === "product" ? "Producto" : "Categoría"}
                      </TableHead>
                      <TableHead
                        className="cursor-pointer"
                        onClick={() => handleSort("percent")}
                      >
                        <div className="flex items-center">
                          Porcentaje de Descuento
                          {renderSortIndicator("percent")}
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer"
                        onClick={() => handleSort("start_date")}
                      >
                        <div className="flex items-center">
                          Fecha de Inicio
                          {renderSortIndicator("start_date")}
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer"
                        onClick={() => handleSort("end_date")}
                      >
                        <div className="flex items-center">
                          Fecha de Fin
                          {renderSortIndicator("end_date")}
                        </div>
                      </TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentDiscounts.map((discount) => {
                      const status = getDiscountStatus(
                        discount.start_date,
                        discount.end_date
                      );
                      return (
                        <TableRow
                          key={discount.id_discount}
                          className={`hover:bg-gray-50 ${
                            selectedDiscounts.includes(discount.id_discount)
                              ? "bg-blue-50"
                              : ""
                          }`}
                        >
                          <TableCell className="p-2">
                            <button
                              onClick={() =>
                                handleDiscountSelect(discount.id_discount)
                              }
                              className="focus:outline-none"
                            >
                              {selectedDiscounts.includes(
                                discount.id_discount
                              ) ? (
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
                            <div className="text-sm font-medium text-gray-900">
                              {discountType === "product"
                                ? discount.product_name
                                : discount.category_name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="bg-blue-50 text-blue-600 border-blue-200"
                            >
                              {discount.percent}% OFF
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-600">
                              {formatDate(discount.start_date)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-600">
                              {formatDate(discount.end_date)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={status.color}>
                              {status.text}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}

                    {currentDiscounts.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center text-gray-500 h-32"
                        >
                          No se encontraron descuentos
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Paginación */}
              {filteredDiscounts.length > 0 && (
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
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
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

export default DiscountDashboard;
