import { ProductDiscount, CategoryDiscount } from "./discountTypes";

export interface ProductDetail {
  product_detail_id: number;
  detail_name: string;
  detail_desc: string;
}

export interface ProductImage {
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

// For use in the products panel
export interface Product {
  id: number;
  name: string;
  description: string;
  id_cat?: number;
  price: number;
  stock: number;
  category: string;
  details: ProductDetail[];
  images: { image_id: number; image_url: string }[];
  inStock: boolean;
}

export interface DisplayProduct extends Product {
  originalPrice?: number;
  discountPercentage?: number;
  endDate?: string;
  image: string;
}
