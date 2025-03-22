export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  brand?: string;
  colors?: string[];
  inStock?: boolean;
  categoryId?: string;
  addedDate?: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface ProductDiscount {
  id: string;
  productId: string;
  discountPercentage: number;
  startDate: string;
  endDate: string;
}

export interface CategoryDiscount {
  id: string;
  categoryId: string;
  discountPercentage: number;
  startDate: string;
  endDate: string;
}

export interface DiscountedProduct extends Product {
  discountPercentage: number;
  originalPrice: number;
  endDate?: string;
}
