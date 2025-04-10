export interface ProductVariant {
  id_pd: number;
  detail_name: string;
  detail_desc: string;
}

export interface Product {
  producto_id: number;
  producto_nombre: string;
  producto_precio: number;
  producto_imagenes: string[];
  variantes: ProductVariant[];
}

export interface OrderDetail {
  detalle_id: number;
  amount: number;
  unit_price: number;
  producto: Product;
  discount: number;
}

export interface Order {
  pedido_id: number;
  fecha_pedido: string;
  status: "pendiente" | "enviado" | "finalizado";
  metodo_pago: "mercado pago" | "paypal" | "efectivo";
  cliente: string;
  detalles: OrderDetail[];
}
