export interface ProductDetail {
  detail_id: number;
  detail_name: string;
  detail_desc: string;
  stock: number;
}

export interface ProductImage {
  image_id: number;
  image_url: string;
}

export interface Discount {
  id_discount: number;
  percent_discount: number;
  start_date_discount: string;
  end_date_discount: string;
}

export interface User {
  id_user: string | number;
  name: string;
  surname: string;
}

export interface Product {
  id_prod?: string | number;
  id_product?: string | number;
  name?: string;
  product_name?: string;
  price?: number;
  description?: string;
  category_id?: number;
  category?: string;
  stock?: number;
  product_details?: ProductDetail[];
  product_images?: ProductImage[];
  discount_product?: Discount[];
  discount_category?: Discount[];
}

export interface OrderData {
  user_id?: string | number;
  fecha_pedido: string;
  status: "pendiente" | "enviado" | "pagado" | "finalizado";
  metodo_pago: "efectivo" | "mercado pago" | "paypal";
}

export interface OrderDetail {
  prod_id: string | number;
  amount: number;
  unit_price: number;
  productName?: string;
  selected_details?: number[];
  discount?: number;
}

export interface OrderFormModalProps {
  onOrderAdded?: () => void;
  onOrderUpdated?: () => void;
  existingOrder?: {
    id_pedido?: string | number;
    cliente?: string;
    fecha_pedido: string;
    status: "pendiente" | "enviado" | "finalizado";
    metodo_pago: "efectivo" | "mercado pago" | "paypal";
    detalles?: OrderDetail[];
  };
  isEditMode?: boolean;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  buttonLabel?: string;
  buttonIcon?: React.ReactNode;
  hideButton?: boolean;
}
