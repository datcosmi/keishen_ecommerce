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
  RefreshCw,
} from "lucide-react";
import { Order } from "@/types/orderTypes";
import { useSession } from "next-auth/react";

// Colores para las gráficas
const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];
const STATUS_COLORS = {
  pendiente: "#FFBB28",
  enviado: "#0088FE",
  finalizado: "#00C49F",
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const OrdersDashboard = () => {
  const [pedidos, setPedidos] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get token from session
  const { data: session } = useSession();
  const token = session?.accessToken;

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/pedidos/details`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("Error al cargar los pedidos");
        }
        const data = await response.json();
        setPedidos(data);
      } catch (err) {
        setError("Error al cargar los datos de pedidos");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPedidos();
  }, []);

  // Calcular métricas clave
  const totalRevenue = pedidos.reduce((sum, pedido) => {
    return (
      sum +
      pedido.detalles.reduce(
        (orderSum, detalle) => orderSum + detalle.amount * detalle.unit_price,
        0
      )
    );
  }, 0);

  const totalOrders = pedidos.length;

  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Preparar datos para gráfico de estado
  const statusData = [
    {
      name: "Pendiente",
      value: pedidos.filter((o) => o.status === "pendiente").length,
    },
    {
      name: "Enviado",
      value: pedidos.filter((o) => o.status === "enviado").length,
    },
    {
      name: "Finalizado",
      value: pedidos.filter((o) => o.status === "finalizado").length,
    },
  ];

  // Preparar datos para gráfico de método de pago
  const paymentMethodData = [
    {
      name: "Mercado Pago",
      value: pedidos.filter((o) => o.metodo_pago === "mercado pago").length,
    },
    {
      name: "PayPal",
      value: pedidos.filter((o) => o.metodo_pago === "paypal").length,
    },
    {
      name: "En tienda",
      value: pedidos.filter((o) => o.metodo_pago === "efectivo").length,
    },
  ];

  // Preparar datos de ingresos diarios
  const dailyRevenueMap = pedidos.reduce(
    (acc, pedido) => {
      const date = new Date(pedido.fecha_pedido).toISOString().split("T")[0];
      const orderTotal = pedido.detalles.reduce(
        (sum, detalle) => sum + detalle.amount * detalle.unit_price,
        0
      );

      acc[date] = (acc[date] || 0) + orderTotal;
      return acc;
    },
    {} as Record<string, number>
  );

  const dailyRevenueData = Object.entries(dailyRevenueMap)
    .map(([date, revenue]) => ({ date, revenue }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Calcular productos más vendidos
  const productSalesMap = pedidos.reduce(
    (acc, pedido) => {
      pedido.detalles.forEach((detalle) => {
        const productoId = detalle.producto.producto_id;
        const productoNombre = detalle.producto.producto_nombre;
        const cantidad = detalle.amount;

        if (!acc[productoId]) {
          acc[productoId] = {
            name: productoNombre,
            value: 0,
          };
        }

        acc[productoId].value += cantidad;
      });

      return acc;
    },
    {} as Record<number, { name: string; value: number }>
  );

  const topProducts = Object.values(productSalesMap)
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  return (
    <div className="flex flex-col md:flex-row gap-2 min-h-screen">
      <div className="p-6 flex-1">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-semibold text-gray-800">Ventas</h1>
            <p className="text-sm text-gray-500">
              Estadísticas sobre las ventas realizadas
            </p>
          </div>
        </div>

        {loading ? (
          <Card className="min-h-[300px] flex items-center justify-center">
            <CardContent className="p-6 text-center">
              <RefreshCw className="h-8 w-8 mb-4 mx-auto animate-spin text-gray-600" />
              <p className="text-gray-600">Cargando estadísticas...</p>
            </CardContent>
          </Card>
        ) : (
          <div>
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
                    Pedidos totales
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
                    Precio Promedio por Pedido
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
                    Pedidos completados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Check className="mr-2 text-orange-500" />
                    <span className="text-2xl font-bold">
                      {pedidos.filter((o) => o.status === "finalizado").length}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <Tabs defaultValue="overview">
              <TabsList className="grid w-full grid-cols-4 mt-2">
                <TabsTrigger value="overview">
                  <BarChart4 className="h-4 w-4 mr-2" />
                  Resumen
                </TabsTrigger>
                <TabsTrigger value="status">
                  <PieIcon className="h-4 w-4 mr-2" />
                  Estado de Pedidos
                </TabsTrigger>
                <TabsTrigger value="revenue">
                  <LineIcon className="h-4 w-4 mr-2" />
                  Ingresos Diarios
                </TabsTrigger>
                <TabsTrigger value="products">
                  <Package className="h-4 w-4 mr-2" />
                  Productos
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Estado de Pedidos</CardTitle>
                      <CardDescription>
                        Distribución de pedidos por estado
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
                        Distribución de pedidos por método de pago
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={paymentMethodData}>
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="value" name="Pedidos" fill="#4f46e5" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="status">
                <Card>
                  <CardHeader>
                    <CardTitle>Distribución por Estado de Pedido</CardTitle>
                    <CardDescription>
                      Vista detallada de pedidos por estado
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
                  <CardFooter>
                    <div className="flex flex-wrap gap-4">
                      {statusData.map((entry, index) => (
                        <div key={index} className="flex items-center">
                          <div
                            className="w-4 h-4 mr-2"
                            style={{
                              backgroundColor:
                                Object.values(STATUS_COLORS)[
                                  index % COLORS.length
                                ],
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
                    <CardDescription>
                      Tendencia de ingresos por día
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={dailyRevenueData}>
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip
                          formatter={(value) => [`$${value}`, "Ingresos"]}
                        />
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
                          dailyRevenueData.reduce(
                            (sum, d) => sum + d.revenue,
                            0
                          ) / (dailyRevenueData.length || 1)
                        ).toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="products">
                <Card>
                  <CardHeader>
                    <CardTitle>Productos Más Vendidos</CardTitle>
                    <CardDescription>
                      Los 5 productos con mayor volumen de ventas
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={topProducts}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                      >
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={100} />
                        <Tooltip
                          formatter={(value) => [value, "Unidades vendidas"]}
                        />
                        <Bar dataKey="value" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                  <CardFooter>
                    <div>
                      <p className="text-sm text-gray-500">
                        Total productos diferentes vendidos:{" "}
                        {Object.keys(productSalesMap).length}
                      </p>
                    </div>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersDashboard;
