"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
  Plus,
  CheckSquare,
  Square,
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
import ProductFormModal from "@/components/productFormModal";
import { Product, ProductData } from "@/types/productTypes";

type SortField = "name" | "price" | "stock" | "inStock";
type SortDirection = "asc" | "desc";

const API_BASE_URL = "http://localhost:3001/api";

const ProductDashboard: React.FC = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Todos");
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Estado para productos seleccionados
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [totalPages, setTotalPages] = useState(1);

  // Ordenamiento
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  // Vista
  const [isGridView, setIsGridView] = useState(false);

  // Transformar los datos de la API al formato que espera el componente
  const transformProductData = (data: ProductData[]): Product[] => {
    return data.map((item) => ({
      id: item.id_product,
      name: item.product_name,
      description: item.description,
      price: item.price,
      stock: item.stock,
      category: item.category,
      details: item.product_details,
      images: item.product_images.map((img) => img.image_url),
      inStock: item.stock > 0,
    }));
  };

  // Cargar los productos desde la API
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/products/full-details`);
      if (!response.ok) {
        throw new Error(`Error fetching products: ${response.statusText}`);
      }
      const data = await response.json();
      const transformedProducts = transformProductData(data);
      setProducts(transformedProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleRefresh = () => {
    fetchProducts();
  };

  const handleProductAdded = (newProduct: Product) => {
    setProducts([newProduct, ...products]);
    handleRefresh();
  };

  // Manejadores para selección de productos
  const handleProductSelect = (id: number) => {
    setSelectedProducts((prev) => {
      if (prev.includes(id)) {
        return prev.filter((productId) => productId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === currentProducts.length) {
      // Deseleccionar todos
      setSelectedProducts([]);
    } else {
      // Seleccionar todos los productos visibles
      setSelectedProducts(currentProducts.map((product) => product.id));
    }
  };

  const handleProductClick = (productId: number) => {
    router.push(`/panel/products/${productId}`);
  };

  // Manejador para editar el producto seleccionado
  const handleEdit = () => {
    if (selectedProducts.length === 1) {
      const productToEdit = products.find((p) => p.id === selectedProducts[0]);
      if (productToEdit) {
        setEditingProduct(productToEdit);
        setEditModalOpen(true);
      }
    }
  };

  const handleProductUpdated = (updatedProduct: Product) => {
    setProducts(
      products.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
    );
    setEditingProduct(null);
    setEditModalOpen(false);
    setSelectedProducts([]);
    toast.success("Producto actualizado correctamente");
    handleRefresh();
  };

  // Manejador para eliminar productos
  const handleDelete = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/product`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids: selectedProducts }),
      });

      if (!response.ok) {
        throw new Error(`Error eliminando productos: ${response.statusText}`);
      }

      // Actualizar la lista de productos después de eliminar
      setProducts(
        products.filter((product) => !selectedProducts.includes(product.id))
      );
      setSelectedProducts([]);
    } catch (error) {
      console.error("Error eliminando productos:", error);
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  // Calcular las cantidades para los filtros
  const inStockCount = products.filter((p) => p.inStock).length;
  const outOfStockCount = products.filter((p) => !p.inStock).length;

  const statusOptions = [
    { id: "todos", label: "Todos", count: products.length },
    { id: "existencia", label: "En existencia", count: inStockCount },
    { id: "agotados", label: "Agotados", count: outOfStockCount },
  ];

  // Aplicar los filtros por búsqueda y estado
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase());

    // Aplicar filtro por estado
    if (selectedStatus === "En existencia" && !product.inStock) return false;
    if (selectedStatus === "Agotados" && product.inStock) return false;

    return matchesSearch;
  });

  // Ordenar los productos
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortField === "name") {
      return sortDirection === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    } else if (sortField === "price") {
      return sortDirection === "asc" ? a.price - b.price : b.price - a.price;
    } else if (sortField === "stock") {
      return sortDirection === "asc" ? a.stock - b.stock : b.stock - a.stock;
    } else if (sortField === "inStock") {
      if (sortDirection === "asc") {
        return a.inStock === b.inStock ? 0 : a.inStock ? -1 : 1;
      } else {
        return a.inStock === b.inStock ? 0 : a.inStock ? 1 : -1;
      }
    }
    return 0;
  });

  // Actualizar el total de páginas cuando los productos filtrados cambian
  useEffect(() => {
    setTotalPages(
      Math.max(1, Math.ceil(filteredProducts.length / rowsPerPage))
    );
    setCurrentPage(1); // Resetear a la primera página cuando cambian los filtros
  }, [filteredProducts.length, rowsPerPage]);

  // Paginación
  const indexOfLastProduct = currentPage * rowsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - rowsPerPage;
  const currentProducts = sortedProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

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

  // Obtener detalles por nombre
  const getDetailValues = (product: Product, detailName: string) => {
    const details = product.details.filter((d) => d.detail_name === detailName);
    if (details.length === 0) return [];
    return details.map((detail) => detail.detail_desc);
  };

  // Obtener colores del producto
  const getProductColors = (product: Product) => {
    const colorDetails = product.details.filter(
      (d) => d.detail_name === "Color"
    );
    if (colorDetails.length === 0) return [];

    return colorDetails.map((detail) => detail.detail_desc);
  };

  // Renderizar círculos de colores con límite
  const renderColorCircles = (colors: string[], limit = 3) => {
    if (colors.length === 0) return <span className="text-gray-500">N/A</span>;

    const displayColors = colors.slice(0, limit);
    const hasMore = colors.length > limit;

    return (
      <div className="flex flex-wrap gap-1 items-center">
        {displayColors.map((color, index) => (
          <div
            key={index}
            className="w-6 h-6 rounded-full border border-gray-200"
            style={{ backgroundColor: color }}
            title={color}
          ></div>
        ))}
        {hasMore && (
          <div
            className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center bg-gray-100 text-xs font-medium"
            title={colors.slice(limit).join(", ")}
          >
            +{colors.length - limit}
          </div>
        )}
      </div>
    );
  };

  // Renderizar badges para todos los tipos de detalles
  const renderDetailBadges = (values: string[], limit = 2) => {
    if (values.length === 0) return <span className="text-gray-500">N/A</span>;

    const displayValues = values.slice(0, limit);
    const hasMore = values.length > limit;

    return (
      <div className="flex flex-wrap gap-1 items-center">
        {displayValues.map((value, index) => (
          <Badge key={index} variant="outline" className="bg-gray-100">
            {value}
          </Badge>
        ))}
        {hasMore && (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-600 hover:bg-blue-100 cursor-help"
            title={values.join(", ")}
          >
            +{values.length - limit}
          </Badge>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col md:flex-row gap-2 min-h-screen bg-[#eaeef6]">
      <Sidebar />
      <div className="p-6 flex-1">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Productos</h1>
            <p className="text-sm text-gray-500">
              Aquí tienes una lista de todos los productos disponibles
            </p>
          </div>
          <div className="flex items-center gap-2">
            {selectedProducts.length > 0 && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setSelectedProducts([])}
                  className="text-gray-600"
                >
                  Cancelar ({selectedProducts.length})
                </Button>

                {selectedProducts.length === 1 && (
                  <Button
                    variant="outline"
                    onClick={handleEdit}
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
                      {selectedProducts.length > 1
                        ? `(${selectedProducts.length})`
                        : ""}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmar eliminación</AlertDialogTitle>
                      <AlertDialogDescription>
                        {selectedProducts.length === 1
                          ? "¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer."
                          : `¿Estás seguro de que deseas eliminar estos ${selectedProducts.length} productos? Esta acción no se puede deshacer.`}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
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

            <ProductFormModal
              onProductAdded={handleProductAdded}
              onProductUpdated={handleProductUpdated}
              buttonLabel="Añadir Producto"
              buttonIcon={<Plus className="h-5 w-5 mr-2" />}
            />

            {/* Edit Modal */}
            <ProductFormModal
              onProductAdded={handleProductAdded}
              onProductUpdated={handleProductUpdated}
              product={editingProduct}
              buttonLabel="Editar Producto"
              buttonIcon={<Edit className="h-5 w-5 mr-2" />}
              isOpen={editModalOpen}
              onOpenChange={setEditModalOpen}
            />
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
              placeholder="Buscar productos..."
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

        {/* Estado para cargar los productos */}
        {loading ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p>Cargando productos...</p>
            </CardContent>
          </Card>
        ) : (
          /* Tabla de productos */
          <Card>
            <CardContent className="p-0">
              {!isGridView ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10">
                          <button
                            onClick={handleSelectAll}
                            className="focus:outline-none"
                          >
                            {selectedProducts.length ===
                              currentProducts.length &&
                            currentProducts.length > 0 ? (
                              <CheckSquare
                                size={18}
                                className="text-blue-600"
                              />
                            ) : (
                              <Square size={18} className="text-gray-400" />
                            )}
                          </button>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer"
                          onClick={() => handleSort("name")}
                        >
                          <div className="flex items-center">
                            Producto
                            {renderSortIndicator("name")}
                          </div>
                        </TableHead>
                        <TableHead>
                          <div className="flex items-center">Categoria</div>
                        </TableHead>
                        <TableHead>
                          <div className="flex items-center">Materiales</div>
                        </TableHead>
                        <TableHead>
                          <div className="flex items-center">Colores</div>
                        </TableHead>
                        <TableHead>
                          <div className="flex items-center">Tallas</div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer"
                          onClick={() => handleSort("price")}
                        >
                          <div className="flex items-center">
                            Precio
                            {renderSortIndicator("price")}
                          </div>
                        </TableHead>
                        <TableHead>
                          <div className="flex items-center">Tamaños</div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer"
                          onClick={() => handleSort("inStock")}
                        >
                          <div className="flex items-center">
                            Estado
                            {renderSortIndicator("inStock")}
                          </div>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentProducts.map((product) => (
                        <TableRow
                          key={product.id}
                          className={`hover:bg-gray-50 ${
                            selectedProducts.includes(product.id)
                              ? "bg-blue-50"
                              : ""
                          }`}
                        >
                          <TableCell className="p-2">
                            <button
                              onClick={() => handleProductSelect(product.id)}
                              className="focus:outline-none"
                            >
                              {selectedProducts.includes(product.id) ? (
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
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100">
                                <div className="w-6 h-6 relative">
                                  {product.images.length > 0 ? (
                                    <Image
                                      src={product.images[0]}
                                      alt={product.name}
                                      fill
                                      style={{ objectFit: "contain" }}
                                      sizes="30px"
                                    />
                                  ) : (
                                    <div className="w-6 h-6 flex items-center justify-center text-xs">
                                      N/A
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="ml-4">
                                <div
                                  className="text-sm font-medium text-gray-900 hover:text-blue-600 cursor-pointer"
                                  onClick={() => handleProductClick(product.id)}
                                >
                                  {product.name}
                                </div>
                                <div className="text-xs text-gray-500 max-w-xs truncate">
                                  {product.description}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-600">
                              {product.category}
                            </div>
                          </TableCell>
                          <TableCell>
                            {renderDetailBadges(
                              getDetailValues(product, "Material"),
                              1
                            )}
                          </TableCell>
                          <TableCell>
                            {renderColorCircles(getProductColors(product), 3)}
                          </TableCell>
                          <TableCell>
                            {renderDetailBadges(
                              getDetailValues(product, "Talla"),
                              2
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm font-medium text-gray-900">
                              ${product.price.toLocaleString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            {renderDetailBadges(
                              getDetailValues(product, "Tamaño"),
                              1
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`${
                                product.inStock
                                  ? "bg-green-50 text-green-600 border-green-300"
                                  : "bg-red-50 text-red-600 border-red-300"
                              }`}
                            >
                              {product.inStock ? "En existencia" : "Agotado"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}

                      {currentProducts.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={9}
                            className="text-center text-gray-500 h-32"
                          >
                            No se encontraron productos con los filtros actuales
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                // Vista de cuadrícula
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                  {currentProducts.map((product) => (
                    <Card
                      key={product.id}
                      className={
                        selectedProducts.includes(product.id)
                          ? "border-blue-300 bg-blue-50"
                          : ""
                      }
                      style={{ cursor: "pointer" }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center mb-3">
                          <button
                            onClick={() => handleProductSelect(product.id)}
                            className="focus:outline-none mr-2"
                          >
                            {selectedProducts.includes(product.id) ? (
                              <CheckSquare
                                size={18}
                                className="text-blue-600"
                              />
                            ) : (
                              <Square size={18} className="text-gray-400" />
                            )}
                          </button>
                          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-100">
                            <div className="w-8 h-8 relative">
                              {product.images.length > 0 ? (
                                <Image
                                  src={product.images[0]}
                                  alt={product.name}
                                  layout="fill"
                                  objectFit="contain"
                                />
                              ) : (
                                <div className="w-8 h-8 flex items-center justify-center text-xs">
                                  N/A
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="ml-2 flex items-center gap-1">
                            <span
                              onClick={() => handleProductClick(product.id)}
                              className="font-semibold hover:text-blue-600 cursor-pointer"
                            >
                              {product.name}
                            </span>
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {product.description}
                        </p>

                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold">
                            ${product.price.toLocaleString()}
                          </span>
                          <Badge
                            variant="outline"
                            className={`${
                              product.inStock
                                ? "bg-green-50 text-green-600 border-green-300"
                                : "bg-red-50 text-red-600 border-red-300"
                            }`}
                          >
                            {product.inStock ? "En existencia" : "Agotado"}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-3">
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-500">
                              Tamaños:
                            </span>
                            {renderDetailBadges(
                              getDetailValues(product, "Tamaño"),
                              2
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-500">
                              Tallas:
                            </span>
                            {renderDetailBadges(
                              getDetailValues(product, "Talla"),
                              2
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-500">
                              Materiales:
                            </span>
                            {renderDetailBadges(
                              getDetailValues(product, "Material"),
                              1
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-500">
                              Colores:
                            </span>
                            {renderColorCircles(getProductColors(product), 3)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {currentProducts.length === 0 && (
                    <div className="col-span-full text-center text-gray-500 py-12">
                      No se encontraron productos con los filtros actuales
                    </div>
                  )}
                </div>
              )}

              {/* Paginación */}
              {filteredProducts.length > 0 && (
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

export default ProductDashboard;
