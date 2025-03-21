"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const API_BASE_URL = "http://localhost:3001/api";

interface Category {
  id_cat: number;
  name: string;
}

interface ProductDetail {
  detail_name: string;
  detail_desc: string;
}

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  cat_id: number;
  stock: number;
  colorDetails: ProductDetail[];
  sizeDetails: ProductDetail[];
  tallaSizeDetails: ProductDetail[];
  materialDetails: ProductDetail[];
}

interface ProductFormModalProps {
  onProductAdded: (product: any) => void;
  onProductUpdated?: (product: any) => void;
  product?: any;
  buttonLabel?: string;
  buttonIcon?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({
  onProductAdded,
  product = null,
  onProductUpdated,
  buttonLabel = "Añadir Producto",
  buttonIcon = <Plus className="h-5 w-5 mr-2" />,
  isOpen,
  onOpenChange,
}) => {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = useState(false);
  const controlled = isOpen !== undefined && onOpenChange !== undefined;
  const open = controlled ? isOpen : internalOpen;
  const setOpen = controlled ? onOpenChange : setInternalOpen;
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    price: 0,
    cat_id: 0,
    stock: 0,
    colorDetails: [],
    sizeDetails: [],
    tallaSizeDetails: [],
    materialDetails: [],
  });

  // Input states for product details/variants
  const [colorInput, setColorInput] = useState("#000000");
  const [sizeInput, setSizeInput] = useState("");
  const [tallaInput, setTallaInput] = useState("");
  const [materialInput, setMaterialInput] = useState("");

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/categories`);
        if (!response.ok) {
          throw new Error(`Error fetching categories: ${response.statusText}`);
        }
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Error al cargar categorías");
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        cat_id: product.category?.id_cat || 0,
        stock: product.stock,
        colorDetails: product.details.filter(
          (d: ProductDetail) => d.detail_name === "Color"
        ),
        sizeDetails: product.details.filter(
          (d: ProductDetail) => d.detail_name === "Tamaño"
        ),
        tallaSizeDetails: product.details.filter(
          (d: ProductDetail) => d.detail_name === "Talla"
        ),
        materialDetails: product.details.filter(
          (d: ProductDetail) => d.detail_name === "Material"
        ),
      });
    }
  }, [product]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ["price", "stock", "cat_id"].includes(name)
        ? Number(value)
        : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: Number(value),
    }));
  };

  // Product Details/Variants handlers
  const addColor = () => {
    if (
      colorInput &&
      !formData.colorDetails.some((detail) => detail.detail_desc === colorInput)
    ) {
      setFormData((prev) => ({
        ...prev,
        colorDetails: [
          ...prev.colorDetails,
          { detail_name: "Color", detail_desc: colorInput },
        ],
      }));
      setColorInput("#000000");
    }
  };

  const removeColor = (colorToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      colorDetails: prev.colorDetails.filter(
        (detail) => detail.detail_desc !== colorToRemove
      ),
    }));
  };

  const addSize = () => {
    if (
      sizeInput.trim() &&
      !formData.sizeDetails.some(
        (detail) => detail.detail_desc === sizeInput.trim()
      )
    ) {
      setFormData((prev) => ({
        ...prev,
        sizeDetails: [
          ...prev.sizeDetails,
          { detail_name: "Tamaño", detail_desc: sizeInput.trim() },
        ],
      }));
      setSizeInput("");
    }
  };

  const removeSize = (sizeToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      sizeDetails: prev.sizeDetails.filter(
        (detail) => detail.detail_desc !== sizeToRemove
      ),
    }));
  };

  const addTalla = () => {
    if (
      tallaInput.trim() &&
      !formData.tallaSizeDetails.some(
        (detail) => detail.detail_desc === tallaInput.trim()
      )
    ) {
      setFormData((prev) => ({
        ...prev,
        tallaSizeDetails: [
          ...prev.tallaSizeDetails,
          { detail_name: "Talla", detail_desc: tallaInput.trim() },
        ],
      }));
      setTallaInput("");
    }
  };

  const removeTalla = (tallaToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tallaSizeDetails: prev.tallaSizeDetails.filter(
        (detail) => detail.detail_desc !== tallaToRemove
      ),
    }));
  };

  const addMaterial = () => {
    if (
      materialInput.trim() &&
      !formData.materialDetails.some(
        (detail) => detail.detail_desc === materialInput.trim()
      )
    ) {
      setFormData((prev) => ({
        ...prev,
        materialDetails: [
          ...prev.materialDetails,
          { detail_name: "Material", detail_desc: materialInput.trim() },
        ],
      }));
      setMaterialInput("");
    }
  };

  const removeMaterial = (materialToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      materialDetails: prev.materialDetails.filter(
        (detail) => detail.detail_desc !== materialToRemove
      ),
    }));
  };

  const createProductDetails = async (
    productId: number,
    details: ProductDetail[]
  ) => {
    try {
      const detailsWithProductId = details.map((detail) => ({
        prod_id: productId,
        detail_name: detail.detail_name,
        detail_desc: detail.detail_desc,
      }));

      console.log(
        "Sending details:",
        JSON.stringify(detailsWithProductId, null, 2)
      );

      const response = await fetch(`${API_BASE_URL}/product/detail`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(detailsWithProductId),
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);

      const responseText = await response.text();
      console.log("Response body:", responseText);

      if (!response.ok) {
        throw new Error(
          `Error creating product details: ${response.statusText} (${response.status})`
        );
      }

      if (!responseText.trim()) {
        return { success: true };
      }

      try {
        return JSON.parse(responseText);
      } catch (e) {
        console.warn("Invalid JSON response:", responseText);
        return { success: true, rawResponse: responseText };
      }
    } catch (error) {
      console.error("Error creating product details:", error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        cat_id: formData.cat_id,
        stock: formData.stock,
      };

      let productId;

      if (product) {
        // UPDATE EXISTING PRODUCT
        productId = product.id;
        const updateResponse = await fetch(
          `${API_BASE_URL}/product/${productId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(productData),
          }
        );

        if (!updateResponse.ok) {
          throw new Error(
            `Error updating product: ${updateResponse.statusText}`
          );
        }
      } else {
        // CREATE NEW PRODUCT
        const productResponse = await fetch(`${API_BASE_URL}/product`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(productData),
        });

        if (!productResponse.ok) {
          throw new Error(
            `Error creating product: ${productResponse.statusText}`
          );
        }

        const newProduct = await productResponse.json();
        productId = newProduct.id_prod;
      }

      // Handle product details - this needs special treatment for update
      const allDetails = [
        ...formData.colorDetails,
        ...formData.sizeDetails,
        ...formData.tallaSizeDetails,
        ...formData.materialDetails,
      ];

      if (product) {
        const existingDetails = product.details;

        for (const detail of existingDetails) {
          await fetch(`${API_BASE_URL}/product/${detail.id_pd}/detail`, {
            method: "DELETE",
          });
        }
      }

      // Only send details if there are any
      if (allDetails.length > 0) {
        await createProductDetails(productId, allDetails);
      }

      // Fetch the complete updated product
      const completeProductResponse = await fetch(
        `${API_BASE_URL}/product/${productId}/details-images`
      );

      if (!completeProductResponse.ok) {
        throw new Error(
          `Error fetching complete product: ${completeProductResponse.statusText}`
        );
      }

      const completeProduct = await completeProductResponse.json();

      // Call the appropriate callback
      if (product) {
        if (onProductUpdated) onProductUpdated(completeProduct);
        toast.success("Producto actualizado", {
          description: `${formData.name} ha sido actualizado correctamente.`,
        });
      } else {
        onProductAdded(completeProduct);
        toast.success("Producto añadido", {
          description: `${formData.name} ha sido añadido correctamente.`,
        });
      }

      // Reset form and close modal
      resetForm();
      setOpen(false);
    } catch (error) {
      console.error("Error processing product:", error);
      toast.error(
        product ? "Error al actualizar producto" : "Error al añadir producto",
        {
          description: "Ha ocurrido un error al procesar el producto.",
        }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: 0,
      cat_id: 0,
      stock: 0,
      colorDetails: [],
      sizeDetails: [],
      tallaSizeDetails: [],
      materialDetails: [],
    });
    setColorInput("#000000");
    setSizeInput("");
    setTallaInput("");
    setMaterialInput("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!controlled && (
        <DialogTrigger asChild>
          <Button>
            {buttonIcon}
            {buttonLabel}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product ? "Editar Producto" : "Añadir Nuevo Producto"}
          </DialogTitle>
          <DialogDescription>
            Completa el formulario para añadir un nuevo producto al catálogo.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <Tabs defaultValue="basicInfo">
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="basicInfo">Información Básica</TabsTrigger>
              <TabsTrigger value="variants">Variantes</TabsTrigger>
            </TabsList>

            {/* Basic Information Tab */}
            <TabsContent value="basicInfo" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del Producto *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Nombre del producto"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe el producto"
                  required
                  className="min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Precio *</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price || ""}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stock">Stock *</Label>
                  <Input
                    id="stock"
                    name="stock"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.stock || ""}
                    onChange={handleInputChange}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cat_id">Categoría *</Label>
                  <Select
                    value={formData.cat_id ? formData.cat_id.toString() : ""}
                    onValueChange={(value) =>
                      handleSelectChange("cat_id", value)
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem
                          key={category.id_cat}
                          value={category.id_cat.toString()}
                        >
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            {/* Variants Tab */}
            <TabsContent value="variants" className="space-y-6">
              {/* Colors */}
              <div className="space-y-2">
                <Label>Colores Disponibles</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={colorInput}
                    onChange={(e) => setColorInput(e.target.value)}
                    className="w-16"
                  />
                  <Button
                    type="button"
                    onClick={addColor}
                    variant="outline"
                    className="flex-1"
                  >
                    Añadir Color
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.colorDetails.length > 0 ? (
                    formData.colorDetails.map((detail) => (
                      <div
                        key={detail.detail_desc}
                        className="flex items-center gap-1 px-3 py-1 rounded-md border"
                      >
                        <div
                          className="h-4 w-4 rounded-full"
                          style={{ backgroundColor: detail.detail_desc }}
                        />
                        <span className="text-sm">{detail.detail_desc}</span>
                        <X
                          className="h-3 w-3 ml-1 cursor-pointer"
                          onClick={() => removeColor(detail.detail_desc)}
                        />
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">
                      No hay colores añadidos
                    </p>
                  )}
                </div>
              </div>

              {/* Sizes */}
              <div className="space-y-2">
                <Label>Tamaños Disponibles</Label>
                <div className="flex gap-2">
                  <Input
                    value={sizeInput}
                    onChange={(e) => setSizeInput(e.target.value)}
                    placeholder="Añadir tamaño (ej: 10cm x 15cm)"
                    className="flex-1"
                  />
                  <Button type="button" onClick={addSize} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.sizeDetails.length > 0 ? (
                    formData.sizeDetails.map((detail) => (
                      <Badge
                        key={detail.detail_desc}
                        variant="secondary"
                        className="px-3 py-1"
                      >
                        {detail.detail_desc}
                        <X
                          className="h-3 w-3 ml-1 cursor-pointer"
                          onClick={() => removeSize(detail.detail_desc)}
                        />
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">
                      No hay tamaños añadidos
                    </p>
                  )}
                </div>
              </div>

              {/* Tallas */}
              <div className="space-y-2">
                <Label>Tallas Disponibles</Label>
                <div className="flex gap-2">
                  <Input
                    value={tallaInput}
                    onChange={(e) => setTallaInput(e.target.value)}
                    placeholder="Añadir talla (ej: S, M, L, XL)"
                    className="flex-1"
                  />
                  <Button type="button" onClick={addTalla} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tallaSizeDetails.length > 0 ? (
                    formData.tallaSizeDetails.map((detail) => (
                      <Badge
                        key={detail.detail_desc}
                        variant="secondary"
                        className="px-3 py-1"
                      >
                        {detail.detail_desc}
                        <X
                          className="h-3 w-3 ml-1 cursor-pointer"
                          onClick={() => removeTalla(detail.detail_desc)}
                        />
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">
                      No hay tallas añadidas
                    </p>
                  )}
                </div>
              </div>

              {/* Materials */}
              <div className="space-y-2">
                <Label>Materiales Disponibles</Label>
                <div className="flex gap-2">
                  <Input
                    value={materialInput}
                    onChange={(e) => setMaterialInput(e.target.value)}
                    placeholder="Añadir material (ej: Algodón, Poliéster)"
                    className="flex-1"
                  />
                  <Button type="button" onClick={addMaterial} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.materialDetails.length > 0 ? (
                    formData.materialDetails.map((detail) => (
                      <Badge
                        key={detail.detail_desc}
                        variant="secondary"
                        className="px-3 py-1"
                      >
                        {detail.detail_desc}
                        <X
                          className="h-3 w-3 ml-1 cursor-pointer"
                          onClick={() => removeMaterial(detail.detail_desc)}
                        />
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">
                      No hay materiales añadidos
                    </p>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? product
                  ? "Actualizando..."
                  : "Guardando..."
                : product
                ? "Actualizar Producto"
                : "Guardar Producto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductFormModal;
