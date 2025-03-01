"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Trash2, Plus, X } from "lucide-react";
import Sidebar from "../../components/admins/sidebar";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface Product {
  id: string;
  name: string;
  brand: string;
  description: string;
  price: number;
  rating: number;
  reviews: number;
  sizes: string[];
  colors: string[];
  straps: string[];
  image: string;
  inStock: boolean;
}

const ProductDetail = () => {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [newSize, setNewSize] = useState("");
  const [newColor, setNewColor] = useState("");
  const [newStrap, setNewStrap] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${productId}`);
        const data = await response.json();
        setProduct(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching product:", error);
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleGoBack = () => {
    router.back();
  };

  const handleAddSize = () => {
    if (newSize && product) {
      setProduct({
        ...product,
        sizes: [...product.sizes, newSize],
      });
      setNewSize("");
    }
  };

  const handleRemoveSize = (sizeToRemove: string) => {
    if (product) {
      setProduct({
        ...product,
        sizes: product.sizes.filter((size) => size !== sizeToRemove),
      });
    }
  };

  const handleAddColor = () => {
    if (newColor && product) {
      setProduct({
        ...product,
        colors: [...product.colors, newColor],
      });
      setNewColor("");
    }
  };

  const handleRemoveColor = (colorToRemove: string) => {
    if (product) {
      setProduct({
        ...product,
        colors: product.colors.filter((color) => color !== colorToRemove),
      });
    }
  };

  const handleAddStrap = () => {
    if (newStrap && product) {
      setProduct({
        ...product,
        straps: [...product.straps, newStrap],
      });
      setNewStrap("");
    }
  };

  const handleRemoveStrap = (strapToRemove: string) => {
    if (product) {
      setProduct({
        ...product,
        straps: product.straps.filter((strap) => strap !== strapToRemove),
      });
    }
  };

  const handleSaveProduct = () => {
    alert("Producto guardado exitosamente");
  };

  const handleDeleteProduct = () => {
    router.push("/admin/products");
  };

  const handleToggleStock = (checked: boolean) => {
    if (product) {
      setProduct({
        ...product,
        inStock: checked,
      });
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (product) {
      const { name, value } = e.target;
      setProduct({
        ...product,
        [name]: name === "price" ? parseFloat(value) || 0 : value,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col md:flex-row gap-2 min-h-screen bg-[#eaeef6]">
        <Sidebar />
        <div className="p-6 flex-1">
          <Card>
            <CardContent className="p-6 text-center">
              <p>Cargando información del producto...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col md:flex-row gap-2 min-h-screen bg-[#eaeef6]">
        <Sidebar />
        <div className="p-6 flex-1">
          <Card>
            <CardContent className="p-6 text-center">
              <p>No se encontró el producto</p>
              <Button onClick={handleGoBack} className="mt-4">
                Volver al listado
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-2 min-h-screen bg-[#eaeef6]">
      <Sidebar />
      <div className="p-6 flex-1">
        <div className="mb-6 flex justify-between items-center">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleGoBack}
              className="mr-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">
                Detalles del producto
              </h1>
              <p className="text-sm text-gray-500">ID: {product.id}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="text-red-600 border-red-300"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
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
                    onClick={handleDeleteProduct}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button onClick={handleSaveProduct}>
              <Save className="h-4 w-4 mr-2" />
              Guardar
            </Button>
          </div>
        </div>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="details">Detalles generales</TabsTrigger>
            <TabsTrigger value="variants">Variantes</TabsTrigger>
            <TabsTrigger value="images">Imágenes</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Información básica</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre del producto</Label>
                    <Input
                      id="name"
                      name="name"
                      value={product.name}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="brand">Marca</Label>
                    <Input
                      id="brand"
                      name="brand"
                      value={product.brand}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={product.description}
                    onChange={handleInputChange}
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Precio (MXN)</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      value={product.price.toString()}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="inStock">Disponibilidad</Label>
                    <div className="flex items-center space-x-2 pt-2">
                      <Switch
                        id="inStock"
                        checked={product.inStock}
                        onCheckedChange={handleToggleStock}
                      />
                      <Label htmlFor="inStock" className="font-normal">
                        {product.inStock ? "En existencia" : "Agotado"}
                      </Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="variants" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Tallas disponibles</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {product.sizes.map((size, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="flex items-center gap-1 px-3 py-1"
                      >
                        {size}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveSize(size)}
                          className="h-4 w-4 ml-1 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}

                    {product.sizes.length === 0 && (
                      <p className="text-sm text-gray-500">
                        No hay tallas agregadas
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Input
                      placeholder="Nueva talla"
                      value={newSize}
                      onChange={(e) => setNewSize(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleAddSize}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Colores disponibles</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {product.colors.map((color, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="flex items-center gap-1 px-3 py-1"
                      >
                        {color}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveColor(color)}
                          className="h-4 w-4 ml-1 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}

                    {product.colors.length === 0 && (
                      <p className="text-sm text-gray-500">
                        No hay colores agregados
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Input
                      placeholder="Nuevo color"
                      value={newColor}
                      onChange={(e) => setNewColor(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleAddColor}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tipos de correa</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {product.straps.map((strap, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="flex items-center gap-1 px-3 py-1"
                      >
                        {strap}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveStrap(strap)}
                          className="h-4 w-4 ml-1 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}

                    {product.straps.length === 0 && (
                      <p className="text-sm text-gray-500">
                        No hay tipos de correa agregados
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Input
                      placeholder="Nuevo tipo de correa"
                      value={newStrap}
                      onChange={(e) => setNewStrap(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleAddStrap}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="images" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Imágenes del producto</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-md p-6 mb-4">
                  <div className="w-32 h-32 mb-4 relative bg-gray-100 rounded-md flex items-center justify-center">
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.name}
                        layout="fill"
                        objectFit="contain"
                        className="rounded-md"
                      />
                    ) : (
                      <p className="text-gray-400">Sin imagen</p>
                    )}
                  </div>
                  <Button variant="outline">Subir nueva imagen</Button>
                </div>

                <p className="text-sm text-gray-500 text-center">
                  Se recomienda usar imágenes de al menos 800x800 píxeles con
                  fondo blanco.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProductDetail;
