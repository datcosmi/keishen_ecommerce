"use client";
import React, { useState, useEffect } from "react";
import { CalendarIcon, Plus, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const API_BASE_URL = "http://localhost:3001/api";

interface Category {
  id_cat: number;
  name: string;
}

interface Product {
  id_prod: number;
  name: string;
  description: string;
  price: number;
  cat_id: number;
  stock: number;
}

interface ProductDetails {
  product: Product;
  category: Category;
  product_details: any[];
  product_images: any[];
}

interface DiscountFormData {
  cat_id?: number;
  prod_id?: number;
  percent: number;
  start_date: Date;
  end_date: Date;
}

interface DiscountFormModalProps {
  onDiscountAdded: (discount: any) => void;
  onDiscountUpdated?: (discount: any) => void;
  discount?: any;
  buttonLabel?: string;
  buttonIcon?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const DiscountFormModal: React.FC<DiscountFormModalProps> = ({
  onDiscountAdded,
  discount = null,
  onDiscountUpdated,
  buttonLabel = "Añadir Descuento",
  buttonIcon = <Plus className="h-5 w-5 mr-2" />,
  isOpen,
  onOpenChange,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const controlled = isOpen !== undefined && onOpenChange !== undefined;
  const open = controlled ? isOpen : internalOpen;
  const setOpen = controlled ? onOpenChange : setInternalOpen;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [discountType, setDiscountType] = useState<"category" | "product">(
    "category"
  );

  // Data fetching states
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<ProductDetails[]>([]);

  // Form state
  const [formData, setFormData] = useState<DiscountFormData>({
    percent: 0,
    start_date: new Date(),
    end_date: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000), // Default to one week from now
  });

  // Fetch categories and products on component mount
  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  // Initialize form if editing an existing discount
  // In DiscountFormModal.tsx
  useEffect(() => {
    if (discount) {
      const discountType = discount.cat_id ? "category" : "product";
      setDiscountType(discountType);

      setFormData({
        cat_id: discount.cat_id || undefined,
        prod_id: discount.prod_id || undefined,
        percent: discount.percent,
        start_date: new Date(discount.start_date),
        end_date: new Date(discount.end_date),
      });
    }
  }, [discount]);

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

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/details-images`);
      if (!response.ok) {
        throw new Error(`Error fetching products: ${response.statusText}`);
      }
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Error al cargar productos");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "percent" ? Number(value) : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: Number(value),
    }));
  };

  const handleDateChange = (name: string, date: Date | undefined) => {
    if (date) {
      setFormData((prev) => ({
        ...prev,
        [name]: date,
      }));
    }
  };

  const handleTabChange = (value: string) => {
    setDiscountType(value as "category" | "product");
    // Reset the selected item when changing tabs
    setFormData((prev) => ({
      ...prev,
      cat_id: undefined,
      prod_id: undefined,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (discountType === "category" && !formData.cat_id) {
      toast.error("Debe seleccionar una categoría");
      return;
    }

    if (discountType === "product" && !formData.prod_id) {
      toast.error("Debe seleccionar un producto");
      return;
    }

    if (formData.percent <= 0 || formData.percent > 100) {
      toast.error("El porcentaje debe estar entre 1 y 100");
      return;
    }

    if (formData.start_date >= formData.end_date) {
      toast.error("La fecha de fin debe ser posterior a la fecha de inicio");
      return;
    }

    setIsSubmitting(true);

    try {
      const endpoint = `${API_BASE_URL}/descuentos/${discountType}`;

      const discountData = {
        ...(discountType === "category"
          ? { cat_id: formData.cat_id }
          : { prod_id: formData.prod_id }),
        percent: formData.percent,
        start_date: formData.start_date.toISOString(),
        end_date: formData.end_date.toISOString(),
      };

      let response;

      if (discount) {
        // Update existing discount
        response = await fetch(`${endpoint}/${discount.id_desc}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(discountData),
        });
      } else {
        // Create new discount
        response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(discountData),
        });
      }

      if (!response.ok) {
        throw new Error(
          `Error ${discount ? "updating" : "creating"} discount: ${
            response.statusText
          }`
        );
      }

      const result = await response.json();

      // Call the appropriate callback
      if (discount) {
        if (onDiscountUpdated) onDiscountUpdated(result);
        toast.success("Descuento actualizado correctamente");
      } else {
        onDiscountAdded(result);
        toast.success("Descuento añadido correctamente");
      }

      // Reset form and close modal
      resetForm();
      setOpen(false);
    } catch (error) {
      console.error("Error processing discount:", error);
      toast.error(
        discount ? "Error al actualizar descuento" : "Error al añadir descuento"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      percent: 0,
      start_date: new Date(),
      end_date: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
    });
    setDiscountType("category");
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
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {discount ? "Editar Descuento" : "Añadir Nuevo Descuento"}
          </DialogTitle>
          <DialogDescription>
            Completa el formulario para{" "}
            {discount ? "editar el" : "añadir un nuevo"} descuento.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <Tabs defaultValue={discountType} onValueChange={handleTabChange}>
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="category">Por Categoría</TabsTrigger>
              <TabsTrigger value="product">Por Producto</TabsTrigger>
            </TabsList>

            {/* Category Discount Tab */}
            <TabsContent value="category" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cat_id">Categoría *</Label>
                <Select
                  value={formData.cat_id?.toString() || ""}
                  onValueChange={(value) => handleSelectChange("cat_id", value)}
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
            </TabsContent>

            {/* Product Discount Tab */}
            <TabsContent value="product" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="prod_id">Producto *</Label>
                <Select
                  value={formData.prod_id?.toString() || ""}
                  onValueChange={(value) =>
                    handleSelectChange("prod_id", value)
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un producto" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((productItem) => (
                      <SelectItem
                        key={productItem.product.id_prod}
                        value={productItem.product.id_prod.toString()}
                      >
                        {productItem.product.name} - $
                        {productItem.product.price}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
          </Tabs>

          {/* Common fields for both discount types */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="percent">Porcentaje de Descuento *</Label>
              <div className="flex items-center">
                <Input
                  id="percent"
                  name="percent"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.percent || ""}
                  onChange={handleInputChange}
                  placeholder="0"
                  required
                  className="flex-1"
                />
                <span className="ml-2 text-lg">%</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Start Date */}
              <div className="space-y-2">
                <Label htmlFor="start_date">Fecha de Inicio *</Label>
                <div className="flex items-center">
                  <Input
                    id="start_date"
                    type="date"
                    value={
                      formData.start_date
                        ? format(formData.start_date, "yyyy-MM-dd")
                        : ""
                    }
                    onChange={(e) => {
                      if (e.target.value) {
                        const newDate = new Date(e.target.value);
                        handleDateChange("start_date", newDate);
                      }
                    }}
                    className="w-full"
                    required
                  />
                </div>
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <Label htmlFor="end_date">Fecha de Fin *</Label>
                <div className="flex items-center">
                  <Input
                    id="end_date"
                    type="date"
                    value={
                      formData.end_date
                        ? format(formData.end_date, "yyyy-MM-dd")
                        : ""
                    }
                    onChange={(e) => {
                      if (e.target.value) {
                        const newDate = new Date(e.target.value);
                        handleDateChange("end_date", newDate);
                      }
                    }}
                    className="w-full"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

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
                ? discount
                  ? "Actualizando..."
                  : "Guardando..."
                : discount
                ? "Actualizar Descuento"
                : "Guardar Descuento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DiscountFormModal;
