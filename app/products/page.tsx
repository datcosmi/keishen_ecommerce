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
} from "lucide-react";
import Sidebar from "../components/admins/sidebar";

// Importaciones de shadcn/ui
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
import { Checkbox } from "@/components/ui/checkbox";
import AddProductModal from "../components/addProductModal";

// Actualizado para reflejar la estructura real de la API
interface ProductDetail {
  id_pd: number;
  prod_id: number;
  detail_name: string;
  detail_desc: string;
}

interface ProductImage {
  id_image: number;
  prod_id: number;
  url_image: string;
}

interface ProductData {
  product: {
    id_prod: number;
    name: string;
    description: string;
    price: number;
    cat_id: number;
    stock: number;
  };
  product_details: ProductDetail[];
  product_images: ProductImage[];
}

// Interface simplificada para usar en la interfaz
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  details: ProductDetail[];
  images: string[];
  inStock: boolean;
  category: number;
}

type SortField = "name" | "price" | "stock" | "inStock";
type SortDirection = "asc" | "desc";

const API_BASE_URL = "http://localhost:3001/api";

const ProductDashboard: React.FC = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Todos");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

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
      id: item.product.id_prod,
      name: item.product.name,
      description: item.product.description,
      price: item.product.price,
      stock: item.product.stock,
      details: item.product_details,
      images: item.product_images.map((img) => img.url_image),
      inStock: item.product.stock > 0,
      category: item.product.cat_id,
    }));
  };

  // Cargar los productos desde la API
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/products/details-images`);
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

  // Manejador para editar el producto seleccionado
  const handleEdit = () => {
    if (selectedProducts.length === 1) {
      router.push(`/products/${selectedProducts[0]}`);
    }
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
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

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
  const getDetailValue = (product: Product, detailName: string) => {
    const detail = product.details.find((d) => d.detail_name === detailName);
    return detail ? detail.detail_desc : "N/A";
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

            <AddProductModal onProductAdded={handleProductAdded} />
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
                          <Checkbox
                            checked={
                              currentProducts.length > 0 &&
                              currentProducts.every((product) =>
                                selectedProducts.includes(product.id)
                              )
                            }
                            onCheckedChange={handleSelectAll}
                            aria-label="Seleccionar todos"
                          />
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
                          <div className="flex items-center">Material</div>
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
                          <div className="flex items-center">Tamaño</div>
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
                            <Checkbox
                              checked={selectedProducts.includes(product.id)}
                              onCheckedChange={() =>
                                handleProductSelect(product.id)
                              }
                              aria-label={`Seleccionar ${product.name}`}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100">
                                <div className="w-6 h-6 relative">
                                  {product.images.length > 0 ? (
                                    <Image
                                      src={product.images[0]}
                                      alt={product.name}
                                      layout="fill"
                                      objectFit="contain"
                                    />
                                  ) : (
                                    <div className="w-6 h-6 bg-gray-200 flex items-center justify-center text-xs">
                                      N/A
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="ml-4">
                                <div
                                  className="text-sm font-medium text-gray-900 hover:text-blue-600 cursor-pointer"
                                  onClick={() =>
                                    handleProductSelect(product.id)
                                  }
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
                              {getDetailValue(product, "Material")}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm font-medium text-gray-900">
                              ${product.price.toLocaleString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              <Badge variant="outline" className="bg-gray-100">
                                {getDetailValue(product, "Tamaño")}
                              </Badge>
                            </div>
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
                            colSpan={6}
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
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center mb-3">
                          <Checkbox
                            checked={selectedProducts.includes(product.id)}
                            onCheckedChange={() =>
                              handleProductSelect(product.id)
                            }
                            aria-label={`Seleccionar ${product.name}`}
                            className="mr-2"
                          />
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
                                <div className="w-8 h-8 bg-gray-200 flex items-center justify-center text-xs">
                                  N/A
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="ml-3">
                            <h3
                              className="font-medium hover:text-blue-600 cursor-pointer"
                              onClick={() => handleProductSelect(product.id)}
                            >
                              {product.name}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {getDetailValue(product, "Material")}
                            </p>
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

                        <div className="flex flex-wrap gap-1 mb-3">
                          <Badge variant="outline" className="bg-gray-100">
                            {getDetailValue(product, "Tamaño")}
                          </Badge>
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
