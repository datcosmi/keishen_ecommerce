"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronLeft, RefreshCw, AlertTriangle } from "lucide-react";
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
import { ProductDetail, ProductData } from "@/types/productTypes";

// Group details by name
const groupDetailsByName = (details: ProductDetail[]) => {
  const grouped: Record<string, string[]> = {};

  if (!details || !Array.isArray(details)) {
    return grouped;
  }

  details.forEach((detail) => {
    if (!grouped[detail.detail_name]) {
      grouped[detail.detail_name] = [];
    }
    grouped[detail.detail_name].push(detail.detail_desc);
  });

  return grouped;
};

const AdminProductDetailPage: React.FC = () => {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [productData, setProductData] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const fetchProductDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3001/api/product/${params.id}/full-details`
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Handle the case where the API returns an array with one object
      const formattedData: ProductData =
        Array.isArray(data) && data.length > 0 ? data[0] : data;

      setProductData(formattedData);
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

  const handleEdit = () => {
    router.push(`/admin/products/edit/${params.id}`);
  };

  const handleDelete = () => {
    // This would typically show a confirmation dialog
    alert("Esta función eliminaría el producto (implementación pendiente)");
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Product Images */}
          <Card className="lg:col-span-1 overflow-hidden">
            <CardHeader>
              <CardTitle>Imágenes del Producto</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="relative aspect-square w-full bg-gray-100">
                {product_images.length > 0 ? (
                  <Image
                    src={product_images[selectedImage].image_url}
                    alt={product.product_name}
                    fill
                    sizes="20vw"
                    priority
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
                        src={image.image_url}
                        alt={`${product.product_name} - vista ${index + 1}`}
                        fill
                        sizes="5vw"
                        priority
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
                </div>

                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium w-1/3">
                        Nombre
                      </TableCell>
                      <TableCell>{product.product_name}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Precio</TableCell>
                      <TableCell>${product.price.toLocaleString()}</TableCell>
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
            <CardHeader>
              <CardTitle>Detalles y Especificaciones</CardTitle>
            </CardHeader>
            <CardContent>
              {Object.entries(groupedDetails).length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Atributo</TableHead>
                      <TableHead>Valores</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(groupedDetails).map(([name, values]) => (
                      <TableRow key={name}>
                        <TableCell className="font-medium">{name}</TableCell>
                        <TableCell>
                          {name === "Color" ? (
                            <div className="flex flex-wrap gap-1">
                              {values.map((color, i) => (
                                <div
                                  key={i}
                                  className="w-6 h-6 rounded-full border border-gray-300"
                                  style={{ backgroundColor: color }}
                                  title={color}
                                />
                              ))}
                            </div>
                          ) : (
                            values.join(", ")
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500">No hay detalles disponibles</p>
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
