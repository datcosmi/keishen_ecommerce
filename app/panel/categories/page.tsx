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
  List,
  Grid,
  RefreshCw,
  Layers2,
  X,
  Square,
  CheckSquare,
} from "lucide-react";
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
import CategoryModal from "@/components/forms/categoryModal";
import { Category } from "@/types/categoryTypes";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import Link from "next/link";

type SortField = "id_cat" | "name";
type SortDirection = "asc" | "desc";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const CategoriesDashboard: React.FC = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Selección de categorías
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // Editar categoria
  const [categoryToEdit, setCategoryToEdit] = useState<Category | undefined>(
    undefined
  );
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [totalPages, setTotalPages] = useState(1);

  // Ordenamiento
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  // Vista
  const [isGridView, setIsGridView] = useState(true);

  // Diálogo de confirmación para eliminar múltiples
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Get token from session
  const { data: session } = useSession();
  const token = session?.accessToken;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/categories`);
        const data = await response.json();
        setCategories(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/categories`);
      const data = await response.json();
      setCategories(data);
      setSelectedCategories([]);
      setSelectAll(false);
    } catch (error) {
      console.error("Error refreshing categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryAdded = (category: Category) => {
    setCategories([...categories, category]);
    handleRefresh();
  };

  const handleCategoryUpdated = (updatedCategory: Category) => {
    setCategories(
      categories.map((cat) =>
        cat.id_cat === updatedCategory.id_cat ? updatedCategory : cat
      )
    );
    setEditModalOpen(false);
  };

  const handleEdit = (category?: Category) => {
    if (category) {
      setCategoryToEdit(category);
    } else if (selectedCategories.length === 1) {
      const categoryToEdit = categories.find(
        (cat) => cat.id_cat === selectedCategories[0]
      );
      setCategoryToEdit(categoryToEdit);
    } else {
      return;
    }
    setEditModalOpen(true);
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      // Format data for the bulk-update API
      const updateData = selectedCategories.map((id) => ({
        id_cat: id.toString(),
        data: { is_deleted: true },
      }));

      const response = await fetch(`${API_BASE_URL}/api/categories`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error(`Error actualizando productos: ${response.statusText}`);
      }

      // Update the local state to reflect the changes
      setCategories(
        categories.map((category) =>
          selectedCategories.includes(category.id_cat)
            ? { ...category, is_deleted: true }
            : category
        )
      );

      setSelectedCategories([]);
      toast.success(
        selectedCategories.length > 1
          ? "Categorias eliminados correctamente"
          : "Categoría eliminado correctamente"
      );
    } catch (error) {
      console.error("Error eliminando categorias:", error);
      toast.error(
        selectedCategories.length > 1
          ? "Error al eliminar categorias"
          : "Error al eliminar la categoría"
      );
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      handleRefresh();
    }
  };

  // Obtener las iniciales del nombre de la categoría
  const getCategoryInitials = (name: string): string => {
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase())
      .join("")
      .substring(0, 2);
  };

  // Generar un color basado en el nombre de la categoría
  const getInitialsBackgroundColor = (name: string): string => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-yellow-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-red-500",
      "bg-teal-500",
      "bg-orange-500",
    ];

    // Usar la suma de los códigos de caracteres para determinar el color
    const sum = name
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[sum % colors.length];
  };

  // Manejo de selección de categorías
  const toggleSelectCategory = (id: number) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((catId) => catId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(currentCategories.map((cat) => cat.id_cat));
    }
    setSelectAll(!selectAll);
  };

  // Aplicar los filtros por búsqueda
  const filteredCategories = categories.filter((category) => {
    const matchesSearch =
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.id_cat.toString().includes(searchQuery);

    return matchesSearch;
  });

  // Ordenar las categorías
  const sortedCategories = [...filteredCategories].sort((a, b) => {
    if (sortField === "name") {
      return sortDirection === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    } else if (sortField === "id_cat") {
      return sortDirection === "asc"
        ? a.id_cat - b.id_cat
        : b.id_cat - a.id_cat;
    }
    return 0;
  });

  // Actualizar el total de páginas cuando las categorías filtradas cambian
  useEffect(() => {
    setTotalPages(
      Math.max(1, Math.ceil(filteredCategories.length / rowsPerPage))
    );
    setCurrentPage(1);
  }, [filteredCategories.length, rowsPerPage]);

  // Paginación
  const indexOfLastCategory = currentPage * rowsPerPage;
  const indexOfFirstCategory = indexOfLastCategory - rowsPerPage;
  const currentCategories = sortedCategories.slice(
    indexOfFirstCategory,
    indexOfLastCategory
  );

  // Comprobar si todos los elementos de la página actual están seleccionados
  useEffect(() => {
    const allCurrentSelected = currentCategories.every((cat) =>
      selectedCategories.includes(cat.id_cat)
    );
    setSelectAll(allCurrentSelected && currentCategories.length > 0);
  }, [currentCategories, selectedCategories]);

  // Manejadores para la paginación
  const handlePageChange = (page: number) => {
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (value: string) => {
    setRowsPerPage(Number(value));
    setCurrentPage(1);
  };

  // Manejador para el ordenamiento
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
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

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Main Content */}
      <div className="p-6 flex-1">
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800 flex items-center">
                <Layers2 className="h-6 w-6 mr-2 text-amber-400" />
                Categorías
              </h1>
              <p className="text-sm text-gray-500">
                Aquí tienes una lista de todas las categorías existentes
              </p>
            </div>

            <div className="flex items-center gap-2">
              {selectedCategories.length > 0 && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedCategories([])}
                    className="text-gray-600 border-gray-200 hover:bg-gray-50"
                  >
                    <X size={16} className="mr-1" />
                    Cancelar ({selectedCategories.length})
                  </Button>

                  {selectedCategories.length === 1 && (
                    <Button
                      variant="outline"
                      onClick={() => handleEdit()}
                      className="bg-blue-50 text-blue-600 hover:text-blue-700 border-blue-200 hover:bg-blue-100"
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
                        className="bg-red-50 text-red-600 hover:text-red-700 border-red-200 hover:bg-red-100"
                      >
                        <Trash2 size={16} className="mr-1" />
                        Eliminar{" "}
                        {selectedCategories.length > 1
                          ? `(${selectedCategories.length})`
                          : ""}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Confirmar eliminación
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          {selectedCategories.length === 1
                            ? "¿Estás seguro de que deseas eliminar esta categoria? Esta acción no se puede deshacer."
                            : `¿Estás seguro de que deseas eliminar estas ${selectedCategories.length} categorias? Esta acción no se puede deshacer.`}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete()}
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

              <CategoryModal onCategoryAdded={handleCategoryAdded} />
            </div>
          </div>
        </div>

        {/* Barra de búsqueda */}
        <div className="relative mb-6 flex items-center">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              type="text"
              className="pl-10 pr-3 bg-white"
              placeholder="Buscar categorías..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {/* Vista Toggle */}
          <div className="flex justify-end space-x-2 ml-2">
            <Button
              variant={isGridView ? "outline" : "default"}
              size="icon"
              className={`${!isGridView ? "bg-black text-white" : ""}`}
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

        {/* Estado para cargar las categorías */}
        {loading ? (
          <Card className="min-h-[300px] flex items-center justify-center">
            <CardContent className="p-6 text-center">
              <RefreshCw className="h-8 w-8 mb-4 mx-auto animate-spin text-gray-600" />
              <p className="text-gray-600">Cargando categorías...</p>
            </CardContent>
          </Card>
        ) : (
          /* Tabla de categorías o vista de cuadrícula */
          <Card>
            <CardContent className="p-0">
              {!isGridView ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <div className="flex items-center justify-center">
                            <button
                              onClick={toggleSelectAll}
                              className="focus:outline-none"
                            >
                              {selectedCategories.length ===
                                currentCategories.length &&
                              currentCategories.length > 0 ? (
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
                          onClick={() => handleSort("id_cat")}
                        >
                          <div className="flex items-center">
                            ID
                            {renderSortIndicator("id_cat")}
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer"
                          onClick={() => handleSort("name")}
                        >
                          <div className="flex items-center">
                            Nombre
                            {renderSortIndicator("name")}
                          </div>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentCategories.map((category) => (
                        <TableRow
                          key={category.id_cat}
                          className={`hover:bg-gray-50 ${
                            selectedCategories.includes(category.id_cat)
                              ? "bg-blue-50"
                              : ""
                          }`}
                        >
                          <TableCell className="p-2 text-center">
                            <button
                              onClick={() =>
                                toggleSelectCategory(category.id_cat)
                              }
                              className="focus:outline-none"
                            >
                              {selectedCategories.includes(category.id_cat) ? (
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
                            <div className="text-sm text-gray-600">
                              <Link
                                href={`/productos?category=${category.id_cat}`}
                              >
                                {category.id_cat}
                              </Link>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${getInitialsBackgroundColor(
                                  category.name
                                )}`}
                              >
                                {getCategoryInitials(category.name)}
                              </div>
                              <div className="ml-4">
                                <div
                                  className="text-sm font-medium text-gray-900 hover:text-blue-600 cursor-pointer"
                                  onClick={() => handleEdit(category)}
                                >
                                  {category.name}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}

                      {currentCategories.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={3}
                            className="text-center text-gray-500 h-32"
                          >
                            No se encontraron categorias con los filtros
                            actuales
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                // Vista de cuadrícula
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                  {currentCategories.map((category) => (
                    <Card
                      key={category.id_cat}
                      className={`${
                        selectedCategories.includes(category.id_cat)
                          ? "ring-2 ring-blue-400"
                          : ""
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center">
                          <button
                            onClick={() =>
                              toggleSelectCategory(category.id_cat)
                            }
                            className="focus:outline-none mr-2"
                          >
                            {selectedCategories.includes(category.id_cat) ? (
                              <CheckSquare
                                size={18}
                                className="text-blue-600"
                              />
                            ) : (
                              <Square size={18} className="text-gray-400" />
                            )}
                          </button>
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-medium ${getInitialsBackgroundColor(
                              category.name
                            )}`}
                          >
                            {getCategoryInitials(category.name)}
                          </div>
                          <div className="ml-3">
                            <h3
                              className="font-medium hover:text-blue-600 cursor-pointer"
                              onClick={() => handleEdit(category)}
                            >
                              {category.name}
                            </h3>
                            <p className="text-xs text-gray-500">
                              ID: {category.id_cat}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {currentCategories.length === 0 && (
                    <div className="col-span-full text-center text-gray-500 py-12">
                      No se encontraron categorias con los filtros actuales
                    </div>
                  )}
                </div>
              )}

              {/* Paginación */}
              {filteredCategories.length > 0 && (
                <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center">
                    <Select
                      value={rowsPerPage.toString()}
                      onValueChange={handleRowsPerPageChange}
                    >
                      <SelectTrigger className="w-20 h-8 border-gray-200">
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
                      Mostrando{" "}
                      <span className="font-medium">
                        {indexOfFirstCategory + 1}-
                        {Math.min(
                          indexOfLastCategory,
                          filteredCategories.length
                        )}
                      </span>{" "}
                      de{" "}
                      <span className="font-medium">
                        {filteredCategories.length}
                      </span>
                    </span>

                    <div className="flex ml-2 gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage === 1}
                        className="h-8 w-8 p-0 border-gray-200 hover:bg-blue-50 hover:border-blue-200"
                      >
                        <ChevronsLeft size={16} />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="h-8 w-8 p-0 border-gray-200 hover:bg-blue-50 hover:border-blue-200"
                      >
                        <ChevronLeft size={16} />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="h-8 w-8 p-0 border-gray-200 hover:bg-blue-50 hover:border-blue-200"
                      >
                        <ChevronRight size={16} />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handlePageChange(totalPages)}
                        disabled={currentPage === totalPages}
                        className="h-8 w-8 p-0 border-gray-200 hover:bg-blue-50 hover:border-blue-200"
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

      {/* Modal para editar categoría */}
      {categoryToEdit && (
        <CategoryModal
          isEdit={true}
          category={categoryToEdit}
          onCategoryUpdated={handleCategoryUpdated}
          onCategoryAdded={handleCategoryAdded}
          externalOpenState={editModalOpen}
          onOpenStateChange={setEditModalOpen}
        />
      )}
    </div>
  );
};

export default CategoriesDashboard;
