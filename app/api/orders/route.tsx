import { NextResponse } from "next/server";

interface Order {
  id: string;
  userId: string;
  date: string;
  status: "pendiente" | "pagado" | "enviado" | "entregado";
  paymentMethod: "Mercado Pago" | "PayPal";
  details: OrderDetail[];
}

interface OrderDetail {
  productId: string;
  quantity: number;
  unitPrice: number;
}

const mockOrders: Order[] = [
  {
    id: "101",
    userId: "1",
    date: "2025-02-28T14:30:00Z",
    status: "pendiente",
    paymentMethod: "Mercado Pago",
    details: [
      { productId: "1", quantity: 1, unitPrice: 3500 },
      { productId: "3", quantity: 2, unitPrice: 50 },
    ],
  },
  {
    id: "102",
    userId: "2",
    date: "2025-02-27T10:15:00Z",
    status: "pagado",
    paymentMethod: "PayPal",
    details: [{ productId: "2", quantity: 1, unitPrice: 2800 }],
  },
  {
    id: "103",
    userId: "3",
    date: "2025-02-26T16:45:00Z",
    status: "enviado",
    paymentMethod: "Mercado Pago",
    details: [
      { productId: "1", quantity: 1, unitPrice: 3500 },
      { productId: "2", quantity: 1, unitPrice: 2800 },
      { productId: "3", quantity: 3, unitPrice: 50 },
    ],
  },
];

export async function GET() {
  return NextResponse.json(mockOrders);
}
