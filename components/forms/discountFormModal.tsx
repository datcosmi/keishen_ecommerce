"use client";
import React, { useState, useEffect } from "react";
import { CalendarIcon, Plus, X, Search, Check } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

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

  // Filter states
  const [categoryFilter, setCategoryFilter] = useState("");
  const [productFilter, setProductFilter] = useState("");

  // Selected item display names
  const [selectedCategoryName, setSelectedCategoryName] = useState("");
  const [selectedProductName, setSelectedProductName] = useState("");

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

  // Update selected names when data is loaded
  useEffect(() => {
    if (formData.cat_id && categories.length > 0) {
      const category = categories.find((c) => c.id_cat === formData.cat_id);
      if (category) {
        setSelectedCategoryName(category.name);
      }
    }

    if (formData.prod_id && products.length > 0) {
      const product = products.find(
        (p) => p.product.id_prod === formData.prod_id
      );
      if (product) {
        setSelectedProductName(
          `${product.product.name} - $${product.product.price}`
        );
      }
    }
  }, [formData.cat_id, formData.prod_id, categories, products]);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/categories`);
      if (!response.ok) {
        throw new Error(`Error fetching categories: ${response.statusText}`);
      }
      const data = await response.json();
      setCategories(data);

      // Update selected category name if in edit mode
      if (discount?.cat_id) {
        const category = data.find(
          (c: Category) => c.id_cat === discount.cat_id
        );
        if (category) {
          setSelectedCategoryName(category.name);
        }
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Error al cargar categorías");
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/products/details-images`
      );
      if (!response.ok) {
        throw new Error(`Error fetching products: ${response.statusText}`);
      }
      const data = await response.json();
      setProducts(data);

      // Update selected product name if in edit mode
      if (discount?.prod_id) {
        const product = data.find(
          (p: ProductDetails) => p.product.id_prod === discount.prod_id
        );
        if (product) {
          setSelectedProductName(
            `${product.product.name} - $${product.product.price}`
          );
        }
      }
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
    setSelectedCategoryName("");
    setSelectedProductName("");
  };

  const handleCategoryFilterChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCategoryFilter(e.target.value);
  };

  const handleProductFilterChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setProductFilter(e.target.value);
  };

  const handleCategorySelect = (category: Category) => {
    setFormData((prev) => ({
      ...prev,
      cat_id: category.id_cat,
    }));
    setSelectedCategoryName(category.name);
    setCategoryFilter("");
  };

  const handleProductSelect = (product: ProductDetails) => {
    setFormData((prev) => ({
      ...prev,
      prod_id: product.product.id_prod,
    }));
    setSelectedProductName(
      `${product.product.name} - $${product.product.price}`
    );
    setProductFilter("");
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
      const endpoint = `${API_BASE_URL}/api/descuentos/${discountType}`;

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
    setSelectedCategoryName("");
    setSelectedProductName("");
    setCategoryFilter("");
    setProductFilter("");
  };

  // Filter categories and products based on search input
  const filteredCategories = categoryFilter
    ? categories.filter((c) =>
        c.name.toLowerCase().includes(categoryFilter.toLowerCase())
      )
    : categories;

  const filteredProducts = productFilter
    ? products.filter((p) =>
        p.product.name.toLowerCase().includes(productFilter.toLowerCase())
      )
    : products;

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
                <div className="relative">
                  <div className="flex space-x-2">
                    <div className="relative flex-1">
                      <Input
                        type="text"
                        placeholder="Buscar categoría..."
                        value={categoryFilter}
                        onChange={handleCategoryFilterChange}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full pr-8"
                      />
                      <Search className="absolute right-2 top-2.5 h-4 w-4 text-gray-400" />
                    </div>
                    {selectedCategoryName && (
                      <div className="flex h-10 items-center rounded-md border border-input bg-background px-3 py-2">
                        <span className="text-sm text-foreground">
                          {selectedCategoryName}
                        </span>
                      </div>
                    )}
                  </div>

                  {categoryFilter.length > 0 ||
                  document.activeElement ===
                    document.getElementById("category-search") ? (
                    <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-auto">
                      {filteredCategories.length > 0 ? (
                        filteredCategories.map((category) => (
                          <div
                            key={category.id_cat}
                            className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-accent"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCategorySelect(category);
                            }}
                          >
                            <span>{category.name}</span>
                            {formData.cat_id === category.id_cat && (
                              <Check className="h-4 w-4 text-primary" />
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-sm text-muted-foreground">
                          No se encontraron categorías
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              </div>
            </TabsContent>

            {/* Product Discount Tab */}
            <TabsContent value="product" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="prod_id">Producto *</Label>
                <div className="relative">
                  <div className="flex space-x-2">
                    <div className="relative flex-1">
                      <Input
                        type="text"
                        placeholder="Buscar producto..."
                        value={productFilter}
                        onChange={handleProductFilterChange}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full pr-8"
                      />
                      <Search className="absolute right-2 top-2.5 h-4 w-4 text-gray-400" />
                    </div>
                    {selectedProductName && (
                      <div className="flex h-10 items-center rounded-md border border-input bg-background px-3 py-2">
                        <span className="text-sm text-foreground">
                          {selectedProductName}
                        </span>
                      </div>
                    )}
                  </div>

                  {productFilter.length > 0 ||
                  document.activeElement ===
                    document.getElementById("product-search") ? (
                    <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-auto">
                      {filteredProducts.length > 0 ? (
                        filteredProducts.map((product) => (
                          <div
                            key={product.product.id_prod}
                            className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-accent"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleProductSelect(product);
                            }}
                          >
                            <span>
                              {product.product.name} - ${product.product.price}
                            </span>
                            {formData.prod_id === product.product.id_prod && (
                              <Check className="h-4 w-4 text-primary" />
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-sm text-muted-foreground">
                          No se encontraron productos
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
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
