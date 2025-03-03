"use client";
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";
import {
  BarChart4,
  PieChart as PieIcon,
  LineChart as LineIcon,
  DollarSign,
  ShoppingCart,
  Package,
  Check,
} from "lucide-react";
import Sidebar from "../components/admins/sidebar";

// Define the interfaces
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

// Colors for charts
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];
const STATUS_COLORS = {
  pendiente: "#FFBB28", // yellow
  pagado: "#0088FE", // blue
  enviado: "#00C49F", // green
  entregado: "#FF8042", // orange
};

const OrdersDashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch("/api/orders");
        if (!response.ok) {
          throw new Error("Failed to fetch orders");
        }
        const data = await response.json();
        setOrders(data);
      } catch (err) {
        setError("Error loading orders data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Calculate key metrics
  const totalRevenue = orders.reduce((sum, order) => {
    return (
      sum +
      order.details.reduce(
        (orderSum, detail) => orderSum + detail.quantity * detail.unitPrice,
        0
      )
    );
  }, 0);

  const totalOrders = orders.length;

  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Prepare data for status chart
  const statusData = [
    {
      name: "Pendiente",
      value: orders.filter((o) => o.status === "pendiente").length,
    },
    {
      name: "Pagado",
      value: orders.filter((o) => o.status === "pagado").length,
    },
    {
      name: "Enviado",
      value: orders.filter((o) => o.status === "enviado").length,
    },
    {
      name: "Entregado",
      value: orders.filter((o) => o.status === "entregado").length,
    },
  ];

  // Prepare data for payment method chart
  const paymentMethodData = [
    {
      name: "Mercado Pago",
      value: orders.filter((o) => o.paymentMethod === "Mercado Pago").length,
    },
    {
      name: "PayPal",
      value: orders.filter((o) => o.paymentMethod === "PayPal").length,
    },
    {
      name: "En tienda",
      value: orders.filter((o) => o.paymentMethod === "En tienda").length,
    },
  ];

  // Prepare daily revenue data
  const dailyRevenueMap = orders.reduce((acc, order) => {
    const date = new Date(order.date).toISOString().split("T")[0];
    const orderTotal = order.details.reduce(
      (sum, detail) => sum + detail.quantity * detail.unitPrice,
      0
    );

    acc[date] = (acc[date] || 0) + orderTotal;
    return acc;
  }, {} as Record<string, number>);

  const dailyRevenueData = Object.entries(dailyRevenueMap)
    .map(([date, revenue]) => ({ date, revenue }))
    .sort((a, b) => a.date.localeCompare(b.date));

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        Loading dashboard data...
      </div>
    );
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <div className="flex flex-col md:flex-row gap-2 min-h-screen bg-[#eaeef6]">
      <Sidebar />
      <div className="p-6 flex-1">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-semibold text-gray-800">Ventas</h1>
            <p className="text-sm text-gray-500">
              Estadísticas sobre las ventas realizadas
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Ingresos Totales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <DollarSign className="mr-2 text-green-500" />
                <span className="text-2xl font-bold">
                  ${totalRevenue.toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Órdenes totales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <ShoppingCart className="mr-2 text-blue-500" />
                <span className="text-2xl font-bold">{totalOrders}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Precio Promedio por Órden
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Package className="mr-2 text-purple-500" />
                <span className="text-2xl font-bold">
                  $
                  {averageOrderValue.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Órdenes completadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Check className="mr-2 text-orange-500" />
                <span className="text-2xl font-bold">
                  {orders.filter((o) => o.status === "entregado").length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">
              <BarChart4 className="h-4 w-4 mr-2" />
              Resumen
            </TabsTrigger>
            <TabsTrigger value="status">
              <PieIcon className="h-4 w-4 mr-2" />
              Estado de Órdenes
            </TabsTrigger>
            <TabsTrigger value="revenue">
              <LineIcon className="h-4 w-4 mr-2" />
              Ingresos Diarios
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Estado de Órdenes</CardTitle>
                  <CardDescription>
                    Distribución de órdenes por estado
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {statusData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              Object.values(STATUS_COLORS)[
                                index % COLORS.length
                              ]
                            }
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Métodos de Pago</CardTitle>
                  <CardDescription>
                    Distribución de órdenes por método de pago
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={paymentMethodData}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" name="Orders" fill="#4f46e5" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="status">
            <Card>
              <CardHeader>
                <CardTitle>Distribución por Estado de Órden</CardTitle>
                <CardDescription>
                  Vista detallada de órdenes por estado
                </CardDescription>
              </CardHeader>
              <CardContent className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value, percent }) =>
                        `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                      }
                    >
                      {statusData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            Object.values(STATUS_COLORS)[index % COLORS.length]
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
              <CardFooter>
                <div className="flex flex-wrap gap-4">
                  {statusData.map((entry, index) => (
                    <div key={index} className="flex items-center">
                      <div
                        className="w-4 h-4 mr-2"
                        style={{
                          backgroundColor:
                            Object.values(STATUS_COLORS)[index % COLORS.length],
                        }}
                      ></div>
                      <span>
                        {entry.name}: {entry.value}
                      </span>
                    </div>
                  ))}
                </div>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="revenue">
            <Card>
              <CardHeader>
                <CardTitle>Ingresos Diarios</CardTitle>
                <CardDescription>Tendencia de ingresos por día</CardDescription>
              </CardHeader>
              <CardContent className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyRevenueData}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, "Revenue"]} />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#4f46e5"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
              <CardFooter>
                <div>
                  <p className="text-sm text-gray-500">
                    Ingresos diarios máximos: $
                    {Math.max(
                      ...dailyRevenueData.map((d) => d.revenue)
                    ).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    Promedio de ingresos diarios: $
                    {(
                      dailyRevenueData.reduce((sum, d) => sum + d.revenue, 0) /
                      dailyRevenueData.length
                    ).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </p>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default OrdersDashboard;
