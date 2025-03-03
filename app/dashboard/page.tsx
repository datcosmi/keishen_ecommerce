"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  RefreshCcw,
  ShoppingCart,
  Package,
  Truck,
  CheckCircle,
} from "lucide-react";
import Sidebar from "../components/admins/sidebar";

// Define interfaces for our data
interface Product {
  id: string;
  name: string;
  brand: string;
  description: string;
  price: number;
  rating: number;
  reviews: number;
  sizes: string[];
  colors: string[];
  straps: string[];
  image: string;
  inStock: boolean;
  categoryId: string;
  addedDate: string;
}

interface OrderDetail {
  productId: string;
  quantity: number;
  unitPrice: number;
}

interface Order {
  id: string;
  userId: string;
  date: string;
  status: "pendiente" | "pagado" | "enviado" | "entregado";
  paymentMethod: "Mercado Pago" | "PayPal" | "En tienda";
  details: OrderDetail[];
}

// Helper function to format currency
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(value);
};

// Dashboard Home component
export default function DashboardHome() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch products and orders in parallel
        const [productsResponse, ordersResponse] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/orders"),
        ]);

        const productsData = await productsResponse.json();
        const ordersData = await ordersResponse.json();

        setProducts(productsData);
        setOrders(ordersData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate key metrics
  const totalProducts = products.length;
  const productsInStock = products.filter((p) => p.inStock).length;
  const totalOrders = orders.length;

  // Calculate total revenue
  const totalRevenue = orders.reduce((sum, order) => {
    const orderTotal = order.details.reduce(
      (total, detail) => total + detail.quantity * detail.unitPrice,
      0
    );
    return sum + orderTotal;
  }, 0);

  // Count orders by status
  const ordersByStatus = {
    pendiente: orders.filter((o) => o.status === "pendiente").length,
    pagado: orders.filter((o) => o.status === "pagado").length,
    enviado: orders.filter((o) => o.status === "enviado").length,
    entregado: orders.filter((o) => o.status === "entregado").length,
  };

  // Prepare data for the revenue chart
  const ordersByDate = orders.reduce((acc: Record<string, number>, order) => {
    const date = new Date(order.date).toISOString().split("T")[0];
    const orderTotal = order.details.reduce(
      (sum, detail) => sum + detail.quantity * detail.unitPrice,
      0
    );

    if (!acc[date]) {
      acc[date] = 0;
    }

    acc[date] += orderTotal;
    return acc;
  }, {});

  const revenueChartData = Object.entries(ordersByDate)
    .sort(
      ([dateA], [dateB]) =>
        new Date(dateA).getTime() - new Date(dateB).getTime()
    )
    .map(([date, amount]) => ({
      date: date,
      amount,
    }));

  // Get most sold products
  const productSales: Record<string, number> = {};
  orders.forEach((order) => {
    order.details.forEach((detail) => {
      if (!productSales[detail.productId]) {
        productSales[detail.productId] = 0;
      }
      productSales[detail.productId] += detail.quantity;
    });
  });

  const topProducts = Object.entries(productSales)
    .sort(([, quantityA], [, quantityB]) => quantityB - quantityA)
    .slice(0, 5)
    .map(([productId, quantity]) => {
      const product = products.find((p) => p.id === productId);
      return {
        id: productId,
        name: product?.name || "Unknown Product",
        quantity,
        revenue: quantity * (product?.price || 0),
      };
    });

  // Get recent orders
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const getStatusBadge = (status: Order["status"]) => {
    switch (status) {
      case "pendiente":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-100 text-yellow-800 border-yellow-200"
          >
            Pendiente
          </Badge>
        );
      case "pagado":
        return (
          <Badge
            variant="outline"
            className="bg-blue-100 text-blue-800 border-blue-200"
          >
            Pagado
          </Badge>
        );
      case "enviado":
        return (
          <Badge
            variant="outline"
            className="bg-purple-100 text-purple-800 border-purple-200"
          >
            Enviado
          </Badge>
        );
      case "entregado":
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-800 border-green-200"
          >
            Entregado
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCcw className="w-6 h-6 animate-spin text-gray-500" />
        <span className="ml-2 text-gray-500">Cargando datos...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-2 min-h-screen bg-[#eaeef6]">
      <Sidebar />
      <div className="p-6 flex-1">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-semibold text-gray-800">Inicio</h1>
            <p className="text-sm text-gray-500">
              Algunos datos generales sobre los productos y ventas
            </p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 mb-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Ingresos Totales
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(totalRevenue)}
              </div>
              <p className="text-xs text-muted-foreground">
                Desde {orders.length} órdenes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Productos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProducts}</div>
              <p className="text-xs text-muted-foreground">
                {productsInStock} en stock
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Órdenes Pendientes
              </CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {ordersByStatus.pendiente +
                  ordersByStatus.pagado +
                  ordersByStatus.enviado}
              </div>
              <p className="text-xs text-muted-foreground">
                {ordersByStatus.entregado} entregadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tasa de Conversión
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {orders.length > 0
                  ? `${(
                      (ordersByStatus.entregado / orders.length) *
                      100
                    ).toFixed(1)}%`
                  : "0%"}
              </div>
              <p className="text-xs text-muted-foreground">
                {ordersByStatus.entregado} de {orders.length} completadas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Chart */}
        <Card className="col-span-4 mb-4">
          <CardHeader>
            <CardTitle>Ingresos por Día</CardTitle>
            <CardDescription>
              Tendencia de ventas en los últimos días
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={revenueChartData}
                margin={{
                  top: 5,
                  right: 10,
                  left: 10,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => {
                    return new Date(date).toLocaleDateString("es-AR", {
                      day: "2-digit",
                      month: "short",
                    });
                  }}
                />
                <YAxis
                  tickFormatter={(value) => {
                    return new Intl.NumberFormat("es-AR", {
                      style: "currency",
                      currency: "ARS",
                      notation: "compact",
                    }).format(value);
                  }}
                />
                <Tooltip
                  formatter={(value) => [
                    formatCurrency(Number(value)),
                    "Ingresos",
                  ]}
                  labelFormatter={(label) => {
                    return new Date(label).toLocaleDateString("es-AR", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    });
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#8884d8"
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Products & Recent Orders */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle>Productos Más Vendidos</CardTitle>
              <CardDescription>
                Los 5 productos con mayor volumen de ventas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead className="text-right">Cantidad</TableHead>
                    <TableHead className="text-right">Ingresos</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">
                        {product.name}
                      </TableCell>
                      <TableCell className="text-right">
                        {product.quantity}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(product.revenue)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Órdenes Recientes</CardTitle>
              <CardDescription>
                Las 5 órdenes más recientes del sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => {
                    const orderTotal = order.details.reduce(
                      (sum, detail) => sum + detail.quantity * detail.unitPrice,
                      0
                    );
                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          {order.id}
                        </TableCell>
                        <TableCell>
                          {new Date(order.date).toLocaleDateString("es-AR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "2-digit",
                          })}
                        </TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(orderTotal)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
