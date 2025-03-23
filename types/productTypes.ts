import { ProductDiscount, CategoryDiscount } from "./indexTypes";

export interface ProductDetail {
  product_detail_id: number;
  detail_name: string;
  detail_desc: string;
}

interface ProductImage {
  image_id: number;
  image_url: string;
}

export interface ProductData {
  id_product: number;
  product_name: string;
  description: string;
  price: number;
  category_id: number;
  category: string;
  stock: number;
  product_details: ProductDetail[];
  product_images: ProductImage[];
  discount_product: ProductDiscount[];
  discount_category: CategoryDiscount[];
}

// Interface simplificada para usar en la interfaz
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  details: ProductDetail[];
  images: string[];
  inStock: boolean;
}
