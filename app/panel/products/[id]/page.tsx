"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  ChevronLeft,
  RefreshCw,
  AlertTriangle,
  Tag,
  Edit,
  Trash2,
} from "lucide-react";
import Sidebar from "@/components/sidebar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { ProductDetail, ProductData, Product } from "@/types/productTypes";
import ProductFormModal from "@/components/productFormModal";
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

const API_BASE_URL = "http://localhost:3001/api";

// Group details by name
const groupDetailsByName = (details: ProductDetail[]) => {
  const grouped: Record<string, Array<{ desc: string; stock: number }>> = {};

  if (!details || !Array.isArray(details)) {
    return grouped;
  }

  details.forEach((detail) => {
    if (!grouped[detail.detail_name]) {
      grouped[detail.detail_name] = [];
    }
    grouped[detail.detail_name].push({
      desc: detail.detail_desc,
      stock: detail.stock || 0, // Assuming stock is now included in the detail object
    });
  });

  return grouped;
};

// Helper functions for stock display
const getStockLabel = (stock: number): string => {
  if (stock <= 0) return "Agotado";
  if (stock <= 3) return `¡Últimas ${stock} unidades!`;
  if (stock <= 10) return `${stock} disponibles (Bajo)`;
  return `${stock} en stock`;
};

const getStockTextColor = (stock: number): string => {
  if (stock <= 0) return "text-red-600 font-medium";
  if (stock <= 3) return "text-amber-600 font-medium";
  if (stock <= 10) return "text-blue-600";
  return "text-green-600";
};

const getStockBarColor = (stock: number): string => {
  if (stock <= 0) return "bg-red-500";
  if (stock <= 3) return "bg-amber-500";
  if (stock <= 10) return "bg-blue-500";
  return "bg-green-500";
};

const getStockBadgeClass = (stock: number): string => {
  if (stock <= 0) return "bg-red-50 text-red-700 border-red-200";
  if (stock <= 3) return "bg-amber-50 text-amber-700 border-amber-200";
  if (stock <= 10) return "bg-blue-50 text-blue-700 border-blue-200";
  return "bg-green-50 text-green-700 border-green-200";
};

// Check if discount is active
const isDiscountActive = (startDate: string, endDate: string): boolean => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  return now >= start && now <= end;
};

// Calculate the discounted price
const calculateDiscountedPrice = (
  originalPrice: number,
  productDiscounts: ProductData["discount_product"],
  categoryDiscounts: ProductData["discount_category"]
): {
  finalPrice: number;
  highestDiscount: number;
  discountType: "product" | "category" | "none";
  originalPrice: number;
} => {
  let highestDiscount = 0;
  let discountType: "product" | "category" | "none" = "none";

  // Check product-specific discounts
  if (productDiscounts && productDiscounts.length > 0) {
    productDiscounts.forEach((discount) => {
      if (
        isDiscountActive(
          discount.start_date_discount,
          discount.end_date_discount
        ) &&
        discount.percent_discount > highestDiscount
      ) {
        highestDiscount = discount.percent_discount;
        discountType = "product";
      }
    });
  }

  // Check category discounts
  if (categoryDiscounts && categoryDiscounts.length > 0) {
    categoryDiscounts.forEach((discount) => {
      if (
        isDiscountActive(
          discount.start_date_discount,
          discount.end_date_discount
        ) &&
        discount.percent_discount > highestDiscount
      ) {
        highestDiscount = discount.percent_discount;
        discountType = "category";
      }
    });
  }

  // Calculate the discounted price
  const discountAmount = (originalPrice * highestDiscount) / 100;
  const finalPrice = originalPrice - discountAmount;

  return {
    finalPrice,
    highestDiscount,
    discountType,
    originalPrice,
  };
};

const AdminProductDetailPage: React.FC = () => {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [productData, setProductData] = useState<ProductData | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [priceInfo, setPriceInfo] = useState<{
    finalPrice: number;
    highestDiscount: number;
    discountType: "product" | "category" | "none";
    originalPrice: number;
  } | null>(null);

  const fetchProductDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/product/${params.id}/full-details`
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Handle the case where the API returns an array with one object
      const formattedData: ProductData =
        Array.isArray(data) && data.length > 0 ? data[0] : data;

      setProductData(formattedData);

      // Calculate discounted price
      const discountInfo = calculateDiscountedPrice(
        formattedData.price,
        formattedData.discount_product || [],
        formattedData.discount_category || []
      );

      setPriceInfo(discountInfo);
    } catch (err) {
      console.error("Error fetching product details:", err);
      setError("No se pudo cargar la información del producto.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      fetchProductDetails();
    }
  }, [params.id]);

  const handleRefresh = () => {
    fetchProductDetails();
  };

  const transformProductData = (data: ProductData): Product => {
    return {
      id: data.id_product,
      name: data.product_name,
      description: data.description,
      id_cat: data.category_id,
      price: data.price,
      stock: data.stock,
      category: data.category,
      details: data.product_details,
      images: data.product_images.map((img) => ({
        image_id: img.image_id,
        image_url: img.image_url,
      })),
      inStock: data.stock > 0,
    };
  };

  const handleProductAdded = () => {
    console.log("Product added successfully!");
  };

  const handleEdit = () => {
    const productToEdit = transformProductData(productData!);
    if (productToEdit) {
      setEditingProduct(productToEdit);
      setEditModalOpen(true);
    }
  };

  const handleProductUpdated = (updatedProduct: ProductData) => {
    setProductData(updatedProduct);
    setEditingProduct(null);
    setEditModalOpen(false);
    toast.success("Producto actualizado correctamente");
    handleRefresh();
  };

  if (loading) {
    return (
      <div className="flex flex-col md:flex-row gap-2 min-h-screen bg-[#eaeef6]">
        <Sidebar />
        <div className="p-6 flex-1 flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="h-10 w-10 text-gray-400 animate-spin mx-auto mb-4" />
            <p>Cargando detalles del producto...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !productData) {
    return (
      <div className="flex flex-col md:flex-row gap-2 min-h-screen bg-[#eaeef6]">
        <Sidebar />
        <div className="p-6 flex-1">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Volver
          </Button>
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-red-500">
                {error || "No se encontró el producto"}
              </p>
              <Button
                variant="outline"
                onClick={() => router.push("/admin/products")}
                className="mt-4"
              >
                Ver todos los productos
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Use default empty arrays if properties are undefined
  const product = productData;
  const product_details = productData.product_details || [];
  const product_images = productData.product_images || [];
  const groupedDetails = groupDetailsByName(product_details);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/product`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids: [product.id_product] }),
      });

      if (!response.ok) {
        throw new Error(`Error eliminando producto: ${response.statusText}`);
      }
      toast.success("Producto eliminado correctamente");
    } catch (error) {
      console.error("Error eliminando productos:", error);
      toast.error("Error al eliminar el producto");
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      router.push(`/panel/products`);
    }
  };

  const stockStatus = () => {
    if (product.stock <= 0) {
      return {
        color: "red",
        text: "Agotado",
        icon: <AlertTriangle className="h-4 w-4 mr-1" />,
      };
    } else if (product.stock < 10) {
      return {
        color: "amber",
        text: "Bajo inventario",
        icon: <AlertTriangle className="h-4 w-4 mr-1" />,
      };
    } else {
      return { color: "green", text: "En existencia", icon: null };
    }
  };

  const status = stockStatus();

  return (
    <div className="flex flex-col md:flex-row gap-2 min-h-screen bg-[#eaeef6]">
      <Sidebar />
      <div className="p-6 flex-1">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="mr-2"
            >
              <ChevronLeft className="mr-2 h-4 w-4" /> Volver
            </Button>
            <h1 className="text-2xl font-bold ml-2">Detalle de Producto</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="ml-2"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw
                className={`h-5 w-5 ${loading ? "animate-spin" : ""}`}
              />
              <span className="ml-2">Actualizar</span>
            </Button>
            <Button
              variant="outline"
              onClick={handleEdit}
              className="bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"
            >
              <Edit size={16} className="mr-1" />
              Editar
            </Button>

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
                  Eliminar
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmar eliminación</AlertDialogTitle>
                  <AlertDialogDescription>
                    ¿Estás seguro de que deseas eliminar este producto? Esta
                    acción no se puede deshacer.
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
          </div>

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Product Images */}
          <Card className="lg:col-span-1 overflow-hidden max-h-[90vh]">
            <CardHeader>
              <CardTitle>Imágenes del Producto</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="relative aspect-square w-full bg-gray-100">
                {product_images.length > 0 ? (
                  <Image
                    src={`http://localhost:3001${product_images[selectedImage].image_url}`}
                    alt={product.product_name}
                    fill
                    sizes="20vw"
                    priority
                    unoptimized
                    className="object-contain p-4"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-400">No hay imagen disponible</p>
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {product_images.length > 1 && (
                <div className="flex overflow-x-auto p-4 gap-2">
                  {product_images.map((image, index) => (
                    <div
                      key={`image-${index}`}
                      className={`w-16 h-16 relative flex-shrink-0 cursor-pointer border-2 ${
                        selectedImage === index
                          ? "border-blue-500"
                          : "border-transparent"
                      }`}
                      onClick={() => setSelectedImage(index)}
                    >
                      <Image
                        src={`http://localhost:3001${image.image_url}`}
                        alt={`http://localhost:3001${
                          product.product_name
                        } - vista ${index + 1}`}
                        fill
                        sizes="5vw"
                        priority
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter className="p-4 flex justify-between">
              <p className="text-sm text-gray-500">
                {product_images.length === 0
                  ? "Sin imágenes"
                  : `${product_images.length} ${
                      product_images.length === 1 ? "imagen" : "imágenes"
                    }`}
              </p>
              <Button variant="outline" size="sm">
                Gestionar Imágenes
              </Button>
            </CardFooter>
          </Card>

          {/* Product Info */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Información del Producto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2 mb-2">
                  <Badge variant="outline" className="bg-gray-100">
                    ID: {product.id_product}
                  </Badge>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    {product.category}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`bg-${status.color}-50 text-${status.color}-700 flex items-center`}
                  >
                    {status.icon}
                    {status.text} ({product.stock})
                  </Badge>

                  {/* Show discount badge if applicable */}
                  {priceInfo && priceInfo.discountType !== "none" && (
                    <Badge className="bg-red-100 text-red-700 flex items-center">
                      <Tag className="h-4 w-4 mr-1" />
                      {priceInfo.highestDiscount}% Descuento
                    </Badge>
                  )}
                </div>

                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium w-1/3">
                        Nombre
                      </TableCell>
                      <TableCell>{product.product_name}</TableCell>
                    </TableRow>

                    {/* Price row with discount information */}
                    <TableRow>
                      <TableCell className="font-medium">Precio</TableCell>
                      <TableCell>
                        {priceInfo && priceInfo.discountType !== "none" ? (
                          <div>
                            <span className="text-gray-500 line-through mr-2">
                              ${priceInfo.originalPrice.toLocaleString()}
                            </span>
                            <span className="font-bold text-red-600">
                              ${priceInfo.finalPrice.toLocaleString()}
                            </span>
                            <div className="text-xs text-gray-600 mt-1">
                              {priceInfo.discountType === "product"
                                ? "Descuento de producto"
                                : "Descuento de categoría"}
                            </div>
                          </div>
                        ) : (
                          <span>${product.price.toLocaleString()}</span>
                        )}
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell className="font-medium">Categoría</TableCell>
                      <TableCell>{product.category}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Inventario</TableCell>
                      <TableCell>{product.stock} unidades</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Descripción</TableCell>
                      <TableCell className="whitespace-normal">
                        {product.description}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>

            {/* Discount Section */}
            {(product.discount_product?.length > 0 ||
              product.discount_category?.length > 0) && (
              <>
                <CardHeader>
                  <CardTitle>Descuentos Aplicables</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Descuento</TableHead>
                        <TableHead>Vigencia</TableHead>
                        <TableHead>Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {product.discount_product?.map((discount, index) => {
                        const isActive = isDiscountActive(
                          discount.start_date_discount,
                          discount.end_date_discount
                        );
                        return (
                          <TableRow key={`product-discount-${index}`}>
                            <TableCell>Producto</TableCell>
                            <TableCell>{discount.percent_discount}%</TableCell>
                            <TableCell>
                              {new Date(
                                discount.start_date_discount
                              ).toLocaleDateString()}{" "}
                              -{" "}
                              {new Date(
                                discount.end_date_discount
                              ).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  isActive
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-100 text-gray-700"
                                }
                              >
                                {isActive ? "Activo" : "Inactivo"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      {product.discount_category?.map((discount, index) => {
                        const isActive = isDiscountActive(
                          discount.start_date_discount,
                          discount.end_date_discount
                        );
                        return (
                          <TableRow key={`category-discount-${index}`}>
                            <TableCell>Categoría</TableCell>
                            <TableCell>{discount.percent_discount}%</TableCell>
                            <TableCell>
                              {new Date(
                                discount.start_date_discount
                              ).toLocaleDateString()}{" "}
                              -{" "}
                              {new Date(
                                discount.end_date_discount
                              ).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  isActive
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-100 text-gray-700"
                                }
                              >
                                {isActive ? "Activo" : "Inactivo"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </>
            )}

            <CardHeader>
              <CardTitle>Detalles y Especificaciones</CardTitle>
            </CardHeader>
            <CardContent>
              {Object.entries(groupedDetails).length > 0 ? (
                <div className="space-y-6">
                  {Object.entries(groupedDetails).map(([name, values]) => (
                    <div
                      key={name}
                      className="bg-white rounded-lg shadow-sm border p-4"
                    >
                      <h3 className="text-md font-medium mb-3 pb-2 border-b">
                        {name}
                      </h3>

                      {name === "Color" ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                          {values.map((value, i) => (
                            <div
                              key={i}
                              className="flex items-center p-3 bg-gray-50 rounded-lg transition-all hover:shadow-md"
                            >
                              <div
                                className="w-10 h-10 rounded-full border shadow-sm mr-3 flex-shrink-0"
                                style={{ backgroundColor: value.desc }}
                              />
                              <div>
                                <div className="font-medium text-sm">
                                  {value.desc}
                                </div>
                                <div
                                  className={`text-sm ${getStockTextColor(
                                    value.stock
                                  )}`}
                                >
                                  {getStockLabel(value.stock)}
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                                  <div
                                    className={`h-1.5 rounded-full ${getStockBarColor(
                                      value.stock
                                    )}`}
                                    style={{
                                      width: `${Math.min(
                                        100,
                                        (value.stock / 20) * 100
                                      )}%`,
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {values.map((value, i) => (
                            <div
                              key={i}
                              className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all"
                            >
                              <span className="font-medium">{value.desc}</span>
                              <Badge
                                className={getStockBadgeClass(value.stock)}
                              >
                                {getStockLabel(value.stock)}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">
                    No hay detalles disponibles para este producto
                  </p>
                </div>
              )}
            </CardContent>

            <CardHeader>
              <CardTitle>Inventario y Estado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-2">
                    Estado de Inventario
                  </h3>
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mr-4">
                      <div
                        className={`h-2.5 rounded-full ${
                          product.stock <= 0
                            ? "bg-red-500"
                            : product.stock < 10
                            ? "bg-amber-500"
                            : "bg-green-500"
                        }`}
                        style={{
                          width: `${Math.min(
                            100,
                            (product.stock / 100) * 100
                          )}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium">
                      {product.stock} unidades
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminProductDetailPage;
