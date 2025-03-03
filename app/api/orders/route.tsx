import { NextResponse } from "next/server";

interface Order {
  id: string;
  userId: string;
  date: string;
  status: "pendiente" | "pagado" | "enviado" | "entregado";
  paymentMethod: "Mercado Pago" | "PayPal" | "En tienda";
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
  {
    id: "104",
    userId: "4",
    date: "2025-02-25T08:20:00Z",
    status: "entregado",
    paymentMethod: "En tienda",
    details: [
      { productId: "4", quantity: 2, unitPrice: 150 },
      { productId: "5", quantity: 1, unitPrice: 4500 },
    ],
  },
  {
    id: "105",
    userId: "5",
    date: "2025-02-24T11:10:00Z",
    status: "pendiente",
    paymentMethod: "Mercado Pago",
    details: [
      { productId: "2", quantity: 3, unitPrice: 2800 },
      { productId: "4", quantity: 1, unitPrice: 150 },
    ],
  },
  {
    id: "106",
    userId: "6",
    date: "2025-02-23T13:00:00Z",
    status: "pagado",
    paymentMethod: "PayPal",
    details: [
      { productId: "1", quantity: 2, unitPrice: 3500 },
      { productId: "5", quantity: 1, unitPrice: 4500 },
    ],
  },
  {
    id: "107",
    userId: "7",
    date: "2025-02-22T17:50:00Z",
    status: "enviado",
    paymentMethod: "Mercado Pago",
    details: [
      { productId: "2", quantity: 2, unitPrice: 2800 },
      { productId: "3", quantity: 5, unitPrice: 50 },
    ],
  },
  {
    id: "108",
    userId: "8",
    date: "2025-02-21T09:25:00Z",
    status: "entregado",
    paymentMethod: "En tienda",
    details: [
      { productId: "4", quantity: 1, unitPrice: 150 },
      { productId: "1", quantity: 3, unitPrice: 3500 },
    ],
  },
  // New Orders
  {
    id: "109",
    userId: "9",
    date: "2025-03-01T12:00:00Z",
    status: "pendiente",
    paymentMethod: "Mercado Pago",
    details: [
      { productId: "3", quantity: 4, unitPrice: 50 },
      { productId: "5", quantity: 2, unitPrice: 4500 },
    ],
  },
  {
    id: "110",
    userId: "10",
    date: "2025-03-02T09:30:00Z",
    status: "pagado",
    paymentMethod: "PayPal",
    details: [
      { productId: "1", quantity: 3, unitPrice: 3500 },
      { productId: "4", quantity: 2, unitPrice: 150 },
    ],
  },
  {
    id: "111",
    userId: "11",
    date: "2025-03-03T08:00:00Z",
    status: "enviado",
    paymentMethod: "PayPal",
    details: [
      { productId: "2", quantity: 5, unitPrice: 2800 },
      { productId: "5", quantity: 3, unitPrice: 4500 },
    ],
  },
  {
    id: "112",
    userId: "12",
    date: "2025-03-04T14:45:00Z",
    status: "enviado",
    paymentMethod: "En tienda",
    details: [
      { productId: "3", quantity: 6, unitPrice: 50 },
      { productId: "1", quantity: 4, unitPrice: 3500 },
    ],
  },
];

export async function GET() {
  return NextResponse.json(mockOrders);
}
