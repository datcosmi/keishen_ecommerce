export interface ProductDiscount {
  id_discount: number;
  percent_discount: number;
  start_date_discount: string;
  end_date_discount: string;
}

export interface CategoryDiscount {
  id_discount: number;
  percent_discount: number;
  start_date_discount: string;
  end_date_discount: string;
}

// For use in discounts dashboard in admin panel
export interface Discount {
  id_discount: number;
  id_product?: number;
  id_category?: number;
  percent: number;
  start_date: string;
  end_date: string;
  product_name?: string;
  category_name?: string;
}
