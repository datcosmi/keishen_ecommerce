"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Category } from "@/types/categoryTypes";
import {
  ProductDetail,
  ProductFormData,
  ProductFormModalProps,
} from "@/types/productFormTypes";
import BasicInfoTab from "./form-components/basicInfoTab";
import ImagesTab from "./form-components/imagesTab";
import VariantsTab from "./form-components/variantsTab";
import { useSession } from "next-auth/react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const IMAGES_BASE_URL =
  process.env.NEXT_PUBLIC_IMAGES_URL || "https://keishen.com.mx";

const ProductFormModal: React.FC<ProductFormModalProps> = ({
  onProductAdded,
  product = null,
  onProductUpdated,
  buttonLabel = "Añadir Producto",
  buttonIcon = <Plus className="h-5 w-5 mr-2" />,
  isOpen,
  onOpenChange,
  existingProducts,
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
    customDetails: [],
  });

  // Input states for product details/variants
  const [colorInput, setColorInput] = useState("#000000");
  const [colorStockInput, setColorStockInput] = useState<string>("");
  const [sizeInput, setSizeInput] = useState("");
  const [sizeStockInput, setSizeStockInput] = useState<string>("");
  const [tallaInput, setTallaInput] = useState("");
  const [tallaStockInput, setTallaStockInput] = useState<string>("");
  const [materialInput, setMaterialInput] = useState("");
  const [materialStockInput, setMaterialStockInput] = useState<string>("");
  const [detailsToUpdate, setDetailsToUpdate] = useState<
    Array<{ id_pd: number; data: { stock: number } }>
  >([]);

  const [customTypeInput, setCustomTypeInput] = useState("");
  const [customValueInput, setCustomValueInput] = useState("");
  const [customStockInput, setCustomStockInput] = useState<string>("");

  // Image states
  const [images, setImages] = useState<File[]>([]);
  const [productImages, setProductImages] = useState<any[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<number[]>([]);

  // Get token from session
  const { data: session } = useSession();
  const token = session?.accessToken;

  const calculateTotalVariantStock = () => {
    const colorStock = formData.colorDetails.reduce(
      (sum, detail) => sum + (detail.stock || 0),
      0
    );
    const sizeStock = formData.sizeDetails.reduce(
      (sum, detail) => sum + (detail.stock || 0),
      0
    );
    const tallaStock = formData.tallaSizeDetails.reduce(
      (sum, detail) => sum + (detail.stock || 0),
      0
    );
    const materialStock = formData.materialDetails.reduce(
      (sum, detail) => sum + (detail.stock || 0),
      0
    );

    console.log("Current stocks:", {
      colorStock,
      sizeStock,
      tallaStock,
      materialStock,
    });
    return colorStock + sizeStock + tallaStock + materialStock;
  };

  // Fetch categories on component mount
  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/categories`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
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

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    console.log("Current formData.materialDetails:", formData.materialDetails);
  }, [formData.materialDetails]);

  useEffect(() => {
    // Check each variant type individually
    const colorStock = formData.colorDetails.reduce(
      (sum, detail) => sum + (detail.stock || 0),
      0
    );
    const sizeStock = formData.sizeDetails.reduce(
      (sum, detail) => sum + (detail.stock || 0),
      0
    );
    const tallaStock = formData.tallaSizeDetails.reduce(
      (sum, detail) => sum + (detail.stock || 0),
      0
    );
    const materialStock = formData.materialDetails.reduce(
      (sum, detail) => sum + (detail.stock || 0),
      0
    );

    if (
      (colorStock > formData.stock ||
        sizeStock > formData.stock ||
        tallaStock > formData.stock ||
        materialStock > formData.stock) &&
      formData.stock > 0
    ) {
      toast.warning(
        "Atención: El stock de alguna variante supera el stock total del producto"
      );
    }
  }, [
    formData.stock,
    formData.colorDetails,
    formData.sizeDetails,
    formData.tallaSizeDetails,
    formData.materialDetails,
  ]);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        cat_id: product.id_cat || 0,
        stock: product.stock,
        colorDetails: product.details
          .filter((d: any) => d.detail_name === "Color" && !d.is_deleted)
          .map((d: any) => ({ ...d })),
        sizeDetails: product.details
          .filter((d: any) => d.detail_name === "Tamaño" && !d.is_deleted)
          .map((d: any) => ({ ...d })),
        tallaSizeDetails: product.details
          .filter((d: any) => d.detail_name === "Talla" && !d.is_deleted)
          .map((d: any) => ({ ...d })),
        materialDetails: product.details
          .filter((d: any) => d.detail_name === "Material" && !d.is_deleted)
          .map((d: any) => ({ ...d })),
        // Add this block to load custom details
        customDetails: product.details
          .filter(
            (d: any) =>
              !["Color", "Tamaño", "Talla", "Material"].includes(
                d.detail_name
              ) && !d.is_deleted
          )
          .map((d: any) => ({ ...d })),
      });
      if (product.images && product.images.length > 0) {
        setProductImages(product.images);
      }
    }
  }, [product]);

  // Manejador para seleccionar imágenes
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setImages((prev) => [...prev, ...newFiles]);
    }
  };

  // Manejador para eliminar una imagen seleccionada (no subida aún)
  const removeSelectedImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Manejador para marcar imágenes existentes para eliminar
  const handleImageDelete = (imageId: number) => {
    setImagesToDelete((prev) => [...prev, imageId]);
    setProductImages((prev) => prev.filter((img) => img.image_id !== imageId));
  };

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
      const stockValue = parseInt(colorStockInput) || 0;

      // Calculate current color stock only
      const currentColorStock = formData.colorDetails.reduce(
        (sum, detail) => sum + (detail.stock || 0),
        0
      );

      const newColorTotal = currentColorStock + stockValue;

      if (newColorTotal > formData.stock) {
        toast.error(
          "La suma del stock de colores no puede superar el stock total del producto."
        );
        return;
      }

      setFormData((prev) => ({
        ...prev,
        colorDetails: [
          ...prev.colorDetails,
          {
            detail_name: "Color",
            detail_desc: colorInput,
            stock: stockValue,
          },
        ],
      }));
      setColorInput("#000000");
      setColorStockInput("");
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

  const editColorStock = (detail: any, newStock: number) => {
    // Make sure we have an id_pd to work with
    if (detail.detail_id) {
      // Add to the update queue
      setDetailsToUpdate((prev) => {
        // Remove if already in queue
        const filtered = prev.filter((item) => item.id_pd !== detail.detail_id);
        // Add updated version
        return [
          ...filtered,
          { id_pd: detail.detail_id as number, data: { stock: newStock } },
        ];
      });
    }

    // Update local state
    setFormData((prev) => ({
      ...prev,
      colorDetails: prev.colorDetails.map((d) =>
        d.detail_desc === detail.detail_desc ? { ...d, stock: newStock } : d
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
      const stockValue = parseInt(sizeStockInput) || 0;

      // Calculate current size stock only
      const currentSizeStock = formData.sizeDetails.reduce(
        (sum, detail) => sum + (detail.stock || 0),
        0
      );

      const newSizeTotal = currentSizeStock + stockValue;

      if (newSizeTotal > formData.stock) {
        toast.error(
          "La suma del stock de tamaños no puede superar el stock total del producto."
        );
        return;
      }

      setFormData((prev) => ({
        ...prev,
        sizeDetails: [
          ...prev.sizeDetails,
          {
            detail_name: "Tamaño",
            detail_desc: sizeInput.trim(),
            stock: stockValue,
          },
        ],
      }));
      setSizeInput("");
      setSizeStockInput("");
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

  const editSizeStock = (detail: any, newStock: number) => {
    if (detail.detail_id) {
      setDetailsToUpdate((prev) => {
        const filtered = prev.filter((item) => item.id_pd !== detail.detail_id);
        return [
          ...filtered,
          { id_pd: detail.detail_id as number, data: { stock: newStock } },
        ];
      });
    }

    setFormData((prev) => ({
      ...prev,
      sizeDetails: prev.sizeDetails.map((d) =>
        d.detail_desc === detail.detail_desc ? { ...d, stock: newStock } : d
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
      const stockValue = parseInt(tallaStockInput) || 0;

      // Calculate current talla stock only
      const currentTallaStock = formData.tallaSizeDetails.reduce(
        (sum, detail) => sum + (detail.stock || 0),
        0
      );

      const newTallaTotal = currentTallaStock + stockValue;

      if (newTallaTotal > formData.stock) {
        toast.error(
          "La suma del stock de tallas no puede superar el stock total del producto."
        );
        return;
      }

      setFormData((prev) => ({
        ...prev,
        tallaSizeDetails: [
          ...prev.tallaSizeDetails,
          {
            detail_name: "Talla",
            detail_desc: tallaInput.trim(),
            stock: stockValue,
          },
        ],
      }));
      setTallaInput("");
      setTallaStockInput("");
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

  const editTallaStock = (detail: any, newStock: number) => {
    if (detail.detail_id) {
      setDetailsToUpdate((prev) => {
        const filtered = prev.filter((item) => item.id_pd !== detail.detail_id);
        return [
          ...filtered,
          { id_pd: detail.detail_id as number, data: { stock: newStock } },
        ];
      });
    }

    setFormData((prev) => ({
      ...prev,
      tallaSizeDetails: prev.tallaSizeDetails.map((d) =>
        d.detail_desc === detail.detail_desc ? { ...d, stock: newStock } : d
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
      // Calculate stock only for the material type
      const stockValue = parseInt(materialStockInput) || 0;

      // Calculate current material stock only
      const currentMaterialStock = formData.materialDetails.reduce(
        (sum, detail) => sum + (detail.stock || 0),
        0
      );

      const newMaterialTotal = currentMaterialStock + stockValue;

      if (newMaterialTotal > formData.stock) {
        toast.error(
          "La suma del stock de materiales no puede superar el stock total del producto."
        );
        return;
      }

      setFormData((prev) => ({
        ...prev,
        materialDetails: [
          ...prev.materialDetails,
          {
            detail_name: "Material",
            detail_desc: materialInput.trim(),
            stock: stockValue,
          },
        ],
      }));
      setMaterialInput("");
      setMaterialStockInput("");
    }
  };

  const removeMaterial = (materialToRemove: string) => {
    console.log("Removing material:", materialToRemove);
    console.log("Before removal:", formData.materialDetails);

    setFormData((prev) => {
      const updatedDetails = prev.materialDetails.filter(
        (detail) => detail.detail_desc !== materialToRemove
      );
      console.log("After removal:", updatedDetails);
      return {
        ...prev,
        materialDetails: updatedDetails,
      };
    });
  };

  const editMaterialStock = (detail: any, newStock: number) => {
    if (detail.detail_id) {
      setDetailsToUpdate((prev) => {
        const filtered = prev.filter((item) => item.id_pd !== detail.detail_id);
        return [
          ...filtered,
          { id_pd: detail.detail_id as number, data: { stock: newStock } },
        ];
      });
    }

    setFormData((prev) => ({
      ...prev,
      materialDetails: prev.materialDetails.map((d) =>
        d.detail_desc === detail.detail_desc ? { ...d, stock: newStock } : d
      ),
    }));
  };

  const addCustomDetail = () => {
    if (
      customTypeInput.trim() &&
      customValueInput.trim() &&
      !formData.customDetails.some(
        (detail) =>
          detail.detail_name === customTypeInput.trim() &&
          detail.detail_desc === customValueInput.trim()
      )
    ) {
      const stockValue = parseInt(customStockInput) || 0;

      // Calculate current custom detail stock only
      const currentCustomStock = formData.customDetails
        .filter((detail) => detail.detail_name === customTypeInput.trim())
        .reduce((sum, detail) => sum + (detail.stock || 0), 0);

      const newCustomTotal = currentCustomStock + stockValue;

      if (newCustomTotal > formData.stock) {
        toast.error(
          "La suma del stock de este tipo de variante no puede superar el stock total del producto."
        );
        return;
      }

      setFormData((prev) => ({
        ...prev,
        customDetails: [
          ...prev.customDetails,
          {
            detail_name: customTypeInput.trim(),
            detail_desc: customValueInput.trim(),
            stock: stockValue,
          },
        ],
      }));

      // Clear inputs but keep the custom type
      setCustomValueInput("");
      setCustomStockInput("");
    }
  };

  const removeCustomDetail = (detailName: string, detailDesc: string) => {
    setFormData((prev) => ({
      ...prev,
      customDetails: prev.customDetails.filter(
        (detail) =>
          !(
            detail.detail_name === detailName &&
            detail.detail_desc === detailDesc
          )
      ),
    }));
  };

  const editCustomDetailStock = (detail: any, newStock: number) => {
    if (detail.detail_id) {
      setDetailsToUpdate((prev) => {
        const filtered = prev.filter((item) => item.id_pd !== detail.detail_id);
        return [
          ...filtered,
          { id_pd: detail.detail_id as number, data: { stock: newStock } },
        ];
      });
    }

    setFormData((prev) => ({
      ...prev,
      customDetails: prev.customDetails.map((d) =>
        d.detail_name === detail.detail_name &&
        d.detail_desc === detail.detail_desc
          ? { ...d, stock: newStock }
          : d
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
        stock: detail.stock || 0,
      }));

      console.log(
        "Sending details:",
        JSON.stringify(detailsWithProductId, null, 2)
      );

      const response = await fetch(`${API_BASE_URL}/api/product/detail`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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

  const bulkUpdateProductDetails = async (
    details: Array<{ id_pd: number; data: { stock: number } }>
  ) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/products/details/bulk-update`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(details),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Error updating product details: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating product details:", error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check each variant type separately
    const colorStock = formData.colorDetails.reduce(
      (sum, detail) => sum + (detail.stock || 0),
      0
    );
    const sizeStock = formData.sizeDetails.reduce(
      (sum, detail) => sum + (detail.stock || 0),
      0
    );
    const tallaStock = formData.tallaSizeDetails.reduce(
      (sum, detail) => sum + (detail.stock || 0),
      0
    );
    const materialStock = formData.materialDetails.reduce(
      (sum, detail) => sum + (detail.stock || 0),
      0
    );

    if (
      colorStock > formData.stock ||
      sizeStock > formData.stock ||
      tallaStock > formData.stock ||
      materialStock > formData.stock
    ) {
      toast.error(
        "La suma del stock de cada tipo de variante no puede superar el stock total del producto"
      );
      return;
    }

    // Check for duplicate product names
    if (!product && existingProducts) {
      // Only check when adding new products, not when editing
      const isDuplicate = existingProducts.some(
        (existingProduct) =>
          existingProduct.name.toLowerCase() === formData.name.toLowerCase()
      );

      if (isDuplicate) {
        toast.error("Ya existe un producto con este nombre");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        cat_id: formData.cat_id,
        stock: formData.stock,
      };

      if (product && detailsToUpdate.length > 0) {
        // Call the bulk update endpoint
        await bulkUpdateProductDetails(detailsToUpdate);
      }

      let productId;

      if (product) {
        // UPDATE EXISTING PRODUCT
        productId = product.id;
        const updateResponse = await fetch(
          `${API_BASE_URL}/api/product/${productId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
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
        const productResponse = await fetch(`${API_BASE_URL}/api/product`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
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
        ...formData.customDetails,
      ];

      if (product) {
        // Track existing detail IDs
        const existingDetailIds = new Set(
          product.details.map((detail: any) => detail.id_pd)
        );

        const detailsByType: Record<string, Set<string>> = {
          Color: new Set(
            product.details
              .filter((d: any) => d.detail_name === "Color")
              .map((d: any) => d.detail_desc)
          ),
          Tamaño: new Set(
            product.details
              .filter((d: any) => d.detail_name === "Tamaño")
              .map((d: any) => d.detail_desc)
          ),
          Talla: new Set(
            product.details
              .filter((d: any) => d.detail_name === "Talla")
              .map((d: any) => d.detail_desc)
          ),
          Material: new Set(
            product.details
              .filter((d: any) => d.detail_name === "Material")
              .map((d: any) => d.detail_desc)
          ),
          // Dynamic mapping for custom details
          ...product.details
            .filter(
              (d: any) =>
                !["Color", "Tamaño", "Talla", "Material"].includes(
                  d.detail_name
                )
            )
            .reduce((acc: Record<string, Set<string>>, curr: any) => {
              if (!acc[curr.detail_name]) {
                acc[curr.detail_name] = new Set();
              }
              acc[curr.detail_name].add(curr.detail_desc);
              return acc;
            }, {}),
        };

        // Find details to delete (ones that exist in original but not in form)
        const detailsToDelete = product.details.filter((detail: any) => {
          if (detail.detail_name === "Color") {
            return !formData.colorDetails.some(
              (d: ProductDetail) => d.detail_desc === detail.detail_desc
            );
          } else if (detail.detail_name === "Tamaño") {
            return !formData.sizeDetails.some(
              (d: ProductDetail) => d.detail_desc === detail.detail_desc
            );
          } else if (detail.detail_name === "Talla") {
            return !formData.tallaSizeDetails.some(
              (d: ProductDetail) => d.detail_desc === detail.detail_desc
            );
          } else if (detail.detail_name === "Material") {
            return !formData.materialDetails.some(
              (d: ProductDetail) => d.detail_desc === detail.detail_desc
            );
          } else {
            // Handle custom detail types
            return !formData.customDetails.some(
              (d: ProductDetail) =>
                d.detail_name === detail.detail_name &&
                d.detail_desc === detail.detail_desc
            );
          }
        });

        // Soft delete removed details using bulk update
        if (detailsToDelete.length > 0) {
          const detailsToSoftDelete = detailsToDelete.map((detail: any) => ({
            id_pd: detail.detail_id,
            data: { is_deleted: true },
          }));

          console.log("Soft deleting details:", detailsToSoftDelete);

          const softDeleteResponse = await fetch(
            `${API_BASE_URL}/api/products/details/bulk-update`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(detailsToSoftDelete),
            }
          );

          if (!softDeleteResponse.ok) {
            throw new Error(
              `Error soft deleting product details: ${softDeleteResponse.statusText}`
            );
          }
        }

        // Only add new details
        const newDetails = [
          ...formData.colorDetails.filter(
            (d: ProductDetail) => !detailsByType["Color"].has(d.detail_desc)
          ),
          ...formData.sizeDetails.filter(
            (d: ProductDetail) => !detailsByType["Tamaño"].has(d.detail_desc)
          ),
          ...formData.tallaSizeDetails.filter(
            (d: ProductDetail) => !detailsByType["Talla"].has(d.detail_desc)
          ),
          ...formData.materialDetails.filter(
            (d: ProductDetail) => !detailsByType["Material"].has(d.detail_desc)
          ),
          // Add custom details
          ...formData.customDetails.filter(
            (d: ProductDetail) =>
              !detailsByType[d.detail_name]?.has(d.detail_desc)
          ),
        ];

        if (newDetails.length > 0) {
          await createProductDetails(productId, newDetails);
        }
      } else {
        // For new products, add all details
        const allDetails = [
          ...formData.colorDetails,
          ...formData.sizeDetails,
          ...formData.tallaSizeDetails,
          ...formData.materialDetails,
        ];

        if (allDetails.length > 0) {
          await createProductDetails(productId, allDetails);
        }
      }

      // Si hay imágenes para eliminar
      if (imagesToDelete.length > 0) {
        await fetch(`${API_BASE_URL}/api/images`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ imageIds: imagesToDelete }),
        });
      }

      // Si hay nuevas imágenes para subir
      if (images.length > 0) {
        const formData = new FormData();
        images.forEach((image) => {
          formData.append("images", image);
        });

        await fetch(`${API_BASE_URL}/api/images/upload-multiple/${productId}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });
      }

      // Fetch the complete updated product
      const completeProductResponse = await fetch(
        `${API_BASE_URL}/api/product/${productId}/details-images`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
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
        toast.success(`${formData.name} ha sido actualizado correctamente`);
      } else {
        onProductAdded(completeProduct);
        toast.success(`${formData.name} ha sido añadido correctamente`);
      }

      // Reset form and close modal
      resetForm();
      setOpen(false);
    } catch (error) {
      console.error("Error processing product:", error);
      toast.error(
        product ? "Error al actualizar producto" : "Error al añadir producto"
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
      customDetails: [],
    });
    setColorInput("#000000");
    setSizeInput("");
    setTallaInput("");
    setMaterialInput("");
    setCustomTypeInput("");
    setCustomValueInput("");
    setCustomStockInput("");
    setImages([]);
    setProductImages([]);
    setImagesToDelete([]);
    setDetailsToUpdate([]);
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
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="basicInfo">Información Básica</TabsTrigger>
              <TabsTrigger value="images">Imágenes</TabsTrigger>
              <TabsTrigger value="variants">Variantes</TabsTrigger>
            </TabsList>

            {/* Basic Information Tab */}
            <TabsContent value="basicInfo">
              <BasicInfoTab
                formData={formData}
                handleInputChange={handleInputChange}
                handleSelectChange={handleSelectChange}
                categories={categories}
              />
            </TabsContent>

            {/* Images Tab */}
            <TabsContent value="images">
              <ImagesTab
                images={images}
                productImages={productImages}
                handleFileChange={handleFileChange}
                removeSelectedImage={removeSelectedImage}
                handleImageDelete={handleImageDelete}
                IMAGES_BASE_URL={IMAGES_BASE_URL}
              />
            </TabsContent>

            {/* Variants Tab */}
            <TabsContent value="variants">
              <VariantsTab
                formData={formData}
                // Color props
                colorInput={colorInput}
                setColorInput={setColorInput}
                colorStockInput={colorStockInput}
                setColorStockInput={setColorStockInput}
                addColor={addColor}
                removeColor={removeColor}
                editColorStock={editColorStock}
                // Size props
                sizeInput={sizeInput}
                setSizeInput={setSizeInput}
                sizeStockInput={sizeStockInput}
                setSizeStockInput={setSizeStockInput}
                addSize={addSize}
                removeSize={removeSize}
                editSizeStock={editSizeStock}
                // Talla props
                tallaInput={tallaInput}
                setTallaInput={setTallaInput}
                tallaStockInput={tallaStockInput}
                setTallaStockInput={setTallaStockInput}
                addTalla={addTalla}
                removeTalla={removeTalla}
                editTallaStock={editTallaStock}
                // Material props
                materialInput={materialInput}
                setMaterialInput={setMaterialInput}
                materialStockInput={materialStockInput}
                setMaterialStockInput={setMaterialStockInput}
                addMaterial={addMaterial}
                removeMaterial={removeMaterial}
                editMaterialStock={editMaterialStock}
                // Custom detail props
                customTypeInput={customTypeInput}
                setCustomTypeInput={setCustomTypeInput}
                customValueInput={customValueInput}
                setCustomValueInput={setCustomValueInput}
                customStockInput={customStockInput}
                setCustomStockInput={setCustomStockInput}
                addCustomDetail={addCustomDetail}
                removeCustomDetail={removeCustomDetail}
                editCustomDetailStock={editCustomDetailStock}
              />
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
