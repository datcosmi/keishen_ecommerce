"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { Plus, X, Upload } from "lucide-react";
import { toast } from "sonner";

// shadcn/ui components
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
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Category {
  id: string;
  name: string;
}

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
  categoryId: string;
  addedDate: string;
}

interface AddProductModalProps {
  onProductAdded: (product: Product) => void;
}

const AddProductModal: React.FC<AddProductModalProps> = ({
  onProductAdded,
}) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState<
    Omit<Product, "id" | "addedDate" | "rating" | "reviews">
  >({
    name: "",
    brand: "",
    description: "",
    price: 0,
    sizes: [],
    colors: [],
    straps: [],
    image: "/images/placeholder-product.png", // Default placeholder image
    inStock: true,
    categoryId: "",
  });

  // Input states for array fields
  const [sizeInput, setSizeInput] = useState("");
  const [colorInput, setColorInput] = useState("#000000");
  const [strapInput, setStrapInput] = useState("");

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" ? Number(value) : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      inStock: checked,
    }));
  };

  // Array field handlers
  const addSize = () => {
    if (sizeInput.trim() !== "" && !formData.sizes.includes(sizeInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        sizes: [...prev.sizes, sizeInput.trim()],
      }));
      setSizeInput("");
    }
  };

  const removeSize = (size: string) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.filter((s) => s !== size),
    }));
  };

  const addColor = () => {
    if (colorInput && !formData.colors.includes(colorInput)) {
      setFormData((prev) => ({
        ...prev,
        colors: [...prev.colors, colorInput],
      }));
      setColorInput("#000000");
    }
  };

  const removeColor = (color: string) => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.filter((c) => c !== color),
    }));
  };

  const addStrap = () => {
    if (
      strapInput.trim() !== "" &&
      !formData.straps.includes(strapInput.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        straps: [...prev.straps, strapInput.trim()],
      }));
      setStrapInput("");
    }
  };

  const removeStrap = (strap: string) => {
    setFormData((prev) => ({
      ...prev,
      straps: prev.straps.filter((s) => s !== strap),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create a new product with generated ID and current date
      const newProduct: Product = {
        ...formData,
        id: uuidv4(),
        addedDate: new Date().toISOString().split("T")[0],
        rating: 0,
        reviews: 0,
      };

      // In a real app, you would post to your API
      // For now, we'll just simulate a successful addition
      setTimeout(() => {
        onProductAdded(newProduct);

        // Show success toast using Sonner
        toast.success("Producto añadido", {
          description: `${newProduct.name} ha sido añadido correctamente.`,
        });

        // Reset form and close modal
        resetForm();
        setOpen(false);
        setIsSubmitting(false);
      }, 1000);
    } catch (error) {
      console.error("Error adding product:", error);
      setIsSubmitting(false);

      // Show error toast using Sonner
      toast.error("Error", {
        description: "Ha ocurrido un error al añadir el producto.",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      brand: "",
      description: "",
      price: 0,
      sizes: [],
      colors: [],
      straps: [],
      image: "/images/placeholder-product.png",
      inStock: true,
      categoryId: "",
    });
    setSizeInput("");
    setColorInput("#000000");
    setStrapInput("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-5 w-5 mr-2" />
          Añadir Producto
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Añadir Nuevo Producto</DialogTitle>
          <DialogDescription>
            Completa el formulario para añadir un nuevo producto al catálogo.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <Tabs defaultValue="basicInfo">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="basicInfo">Información Básica</TabsTrigger>
              <TabsTrigger value="attributes">Atributos</TabsTrigger>
              <TabsTrigger value="variants">Variantes</TabsTrigger>
            </TabsList>

            {/* Basic Information Tab */}
            <TabsContent value="basicInfo" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <Label htmlFor="brand">Marca *</Label>
                  <Input
                    id="brand"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    placeholder="Marca del producto"
                    required
                  />
                </div>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <Label htmlFor="categoryId">Categoría *</Label>
                  <Select
                    name="categoryId"
                    value={formData.categoryId}
                    onValueChange={(value) =>
                      handleSelectChange("categoryId", value)
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="inStock"
                  checked={formData.inStock}
                  onCheckedChange={handleSwitchChange}
                />
                <Label htmlFor="inStock">En existencia</Label>
              </div>
            </TabsContent>

            {/* Attributes Tab */}
            <TabsContent value="attributes" className="space-y-6">
              <div className="space-y-4">
                <Label>Imagen del Producto</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <Upload className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500 mb-2">
                    Arrastra una imagen o haz clic para seleccionar
                  </p>
                  <Button variant="outline" type="button">
                    Seleccionar Imagen
                  </Button>
                  <p className="text-xs text-gray-400 mt-2">
                    Formatos permitidos: PNG, JPG, WEBP. Máximo 2MB.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">URL de la Imagen</Label>
                <Input
                  id="image"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  placeholder="/images/producto.png"
                />
                <p className="text-xs text-gray-500">
                  Si no cargas una imagen, puedes especificar una URL.
                </p>
              </div>
            </TabsContent>

            {/* Variants Tab */}
            <TabsContent value="variants" className="space-y-6">
              {/* Sizes */}
              <div className="space-y-2">
                <Label>Tallas Disponibles</Label>
                <div className="flex gap-2">
                  <Input
                    value={sizeInput}
                    onChange={(e) => setSizeInput(e.target.value)}
                    placeholder="Añadir talla (ej: S, M, L, XL)"
                    className="flex-1"
                  />
                  <Button type="button" onClick={addSize} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.sizes.length > 0 ? (
                    formData.sizes.map((size) => (
                      <Badge
                        key={size}
                        variant="secondary"
                        className="px-3 py-1"
                      >
                        {size}
                        <X
                          className="h-3 w-3 ml-1 cursor-pointer"
                          onClick={() => removeSize(size)}
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
                  {formData.colors.length > 0 ? (
                    formData.colors.map((color) => (
                      <div
                        key={color}
                        className="flex items-center gap-1 px-3 py-1 rounded-md border"
                      >
                        <div
                          className="h-4 w-4 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-sm">{color}</span>
                        <X
                          className="h-3 w-3 ml-1 cursor-pointer"
                          onClick={() => removeColor(color)}
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

              {/* Straps */}
              <div className="space-y-2">
                <Label>Correas Disponibles</Label>
                <div className="flex gap-2">
                  <Input
                    value={strapInput}
                    onChange={(e) => setStrapInput(e.target.value)}
                    placeholder="Añadir tipo de correa"
                    className="flex-1"
                  />
                  <Button type="button" onClick={addStrap} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.straps.length > 0 ? (
                    formData.straps.map((strap) => (
                      <Badge
                        key={strap}
                        variant="secondary"
                        className="px-3 py-1"
                      >
                        {strap}
                        <X
                          className="h-3 w-3 ml-1 cursor-pointer"
                          onClick={() => removeStrap(strap)}
                        />
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">
                      No hay correas añadidas
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
              {isSubmitting ? "Guardando..." : "Guardar Producto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductModal;
