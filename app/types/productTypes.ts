import { Category } from "./categoryTypes";

export interface ProductDetail {
  id_pd: number;
  prod_id: number;
  detail_name: string;
  detail_desc: string;
}

export interface ProductImage {
  id_image: number;
  prod_id: number;
  url_image: string;
}

export interface ProductData {
  product: {
    id_prod: number;
    name: string;
    description: string;
    price: number;
    cat_id: number;
    stock: number;
  };
  product_details: ProductDetail[];
  product_images: ProductImage[];
  category: Category;
}

// Interface simplificada para usar en la interfaz
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  details: ProductDetail[];
  images: string[];
  inStock: boolean;
  category: Category;
}
