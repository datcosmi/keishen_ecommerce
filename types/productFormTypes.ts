import { Category } from "@/types/categoryTypes";

export interface ProductDetail {
  detail_name: string;
  detail_desc: string;
  stock?: number;
  id_pd?: number;
}

export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  cat_id: number;
  stock: number;
  colorDetails: ProductDetail[];
  sizeDetails: ProductDetail[];
  tallaSizeDetails: ProductDetail[];
  materialDetails: ProductDetail[];
  customDetails: ProductDetail[];
}

export interface ProductFormModalProps {
  onProductAdded: (product: any) => void;
  onProductUpdated?: (product: any) => void;
  product?: any;
  buttonLabel?: string;
  buttonIcon?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  existingProducts?: any[];
}

// Form components

export interface BasicInfoTabProps {
  formData: ProductFormData;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  handleSelectChange: (name: string, value: string) => void;
  categories: Category[];
}

export interface ImagesTabProps {
  images: File[];
  productImages: any[];
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeSelectedImage: (index: number) => void;
  handleImageDelete: (imageId: number) => void;
  IMAGES_BASE_URL: string;
}

export interface VariantsTabProps {
  formData: ProductFormData;

  // Color state and handlers
  colorInput: string;
  setColorInput: (value: string) => void;
  colorStockInput: string;
  setColorStockInput: (value: string) => void;
  addColor: () => void;
  removeColor: (colorToRemove: string) => void;
  editColorStock: (detail: any, newStock: number) => void;

  // Size state and handlers
  sizeInput: string;
  setSizeInput: (value: string) => void;
  sizeStockInput: string;
  setSizeStockInput: (value: string) => void;
  addSize: () => void;
  removeSize: (sizeToRemove: string) => void;
  editSizeStock: (detail: any, newStock: number) => void;

  // Talla state and handlers
  tallaInput: string;
  setTallaInput: (value: string) => void;
  tallaStockInput: string;
  setTallaStockInput: (value: string) => void;
  addTalla: () => void;
  removeTalla: (tallaToRemove: string) => void;
  editTallaStock: (detail: any, newStock: number) => void;

  // Material state and handlers
  materialInput: string;
  setMaterialInput: (value: string) => void;
  materialStockInput: string;
  setMaterialStockInput: (value: string) => void;
  addMaterial: () => void;
  removeMaterial: (materialToRemove: string) => void;
  editMaterialStock: (detail: any, newStock: number) => void;

  // Custom detail props
  customTypeInput: string;
  setCustomTypeInput: (value: string) => void;
  customValueInput: string;
  setCustomValueInput: (value: string) => void;
  customStockInput: string;
  setCustomStockInput: (value: string) => void;
  addCustomDetail: () => void;
  removeCustomDetail: (detailName: string, detailDesc: string) => void;
  editCustomDetailStock: (detail: any, newStock: number) => void;
}
