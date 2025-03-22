export interface Product {
  producto_id: number;
  producto_nombre: string;
  producto_precio: number;
  producto_imagenes: string[];
}

export interface OrderDetail {
  detalle_id: number;
  amount: number;
  unit_price: number;
  producto: Product;
}

export interface Order {
  pedido_id: number;
  fecha_pedido: string;
  status: "pendiente" | "enviado" | "finalizado";
  metodo_pago: "mercado pago" | "paypal" | "efectivo";
  cliente: string;
  detalles: OrderDetail[];
}
