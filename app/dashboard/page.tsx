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

interface Producto {
  producto_id: number;
  producto_nombre: string;
  producto_precio: number;
  producto_imagenes: string[];
}

interface DetallePedido {
  detalle_id: number;
  amount: number;
  unit_price: number;
  producto: Producto;
}

interface Pedido {
  pedido_id: number;
  fecha_pedido: string;
  status: "pendiente" | "enviado" | "finalizado";
  metodo_pago: "mercado pago" | "paypal" | "efectivo";
  cliente: string;
  detalles: DetallePedido[];
}

// Función para formatear moneda
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(value);
};

const API_BASE_URL = "http://localhost:3001/api";

export default function DashboardHome() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const pedidosResponse = await fetch(`${API_BASE_URL}/pedidos/details`);
        const pedidosData = await pedidosResponse.json();

        setPedidos(pedidosData);
      } catch (error) {
        console.error("Error obteniendo datos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Extraer productos únicos de los pedidos
  const productosUnicos = pedidos
    .flatMap((pedido) => pedido.detalles.map((detalle) => detalle.producto))
    .filter(
      (producto, index, self) =>
        index === self.findIndex((p) => p.producto_id === producto.producto_id)
    );

  // Calcular métricas clave
  const totalProductos = productosUnicos.length;

  const totalPedidos = pedidos.length;

  // Calcular ingresos totales
  const totalIngresos = pedidos.reduce((sum, pedido) => {
    const pedidoTotal = pedido.detalles.reduce(
      (total, detalle) => total + detalle.amount * detalle.unit_price,
      0
    );
    return sum + pedidoTotal;
  }, 0);

  // Contar pedidos por estado
  const pedidosPorEstado = {
    pendiente: pedidos.filter((p) => p.status === "pendiente").length,
    enviado: pedidos.filter((p) => p.status === "enviado").length,
    finalizado: pedidos.filter((p) => p.status === "finalizado").length,
  };

  // Preparar datos para el gráfico de ingresos
  const pedidosPorFecha = pedidos.reduce(
    (acc: Record<string, number>, pedido) => {
      const fecha = new Date(pedido.fecha_pedido).toISOString().split("T")[0];
      const pedidoTotal = pedido.detalles.reduce(
        (sum, detalle) => sum + detalle.amount * detalle.unit_price,
        0
      );

      if (!acc[fecha]) {
        acc[fecha] = 0;
      }

      acc[fecha] += pedidoTotal;
      return acc;
    },
    {}
  );

  const datosGraficoIngresos = Object.entries(pedidosPorFecha)
    .sort(
      ([fechaA], [fechaB]) =>
        new Date(fechaA).getTime() - new Date(fechaB).getTime()
    )
    .map(([fecha, monto]) => ({
      fecha: fecha,
      monto,
    }));

  // Obtener productos más vendidos
  const ventasProductos: Record<
    number,
    { cantidad: number; nombre: string; ingresos: number }
  > = {};

  pedidos.forEach((pedido) => {
    pedido.detalles.forEach((detalle) => {
      const productoId = detalle.producto.producto_id;

      if (!ventasProductos[productoId]) {
        ventasProductos[productoId] = {
          cantidad: 0,
          nombre: detalle.producto.producto_nombre,
          ingresos: 0,
        };
      }

      ventasProductos[productoId].cantidad += detalle.amount;
      ventasProductos[productoId].ingresos +=
        detalle.amount * detalle.unit_price;
    });
  });

  const productosTop = Object.entries(ventasProductos)
    .sort(([, a], [, b]) => b.cantidad - a.cantidad)
    .slice(0, 5)
    .map(([id, datos]) => ({
      id,
      nombre: datos.nombre,
      cantidad: datos.cantidad,
      ingresos: datos.ingresos,
    }));

  // Obtener pedidos recientes
  const pedidosRecientes = [...pedidos]
    .sort(
      (a, b) =>
        new Date(b.fecha_pedido).getTime() - new Date(a.fecha_pedido).getTime()
    )
    .slice(0, 5);

  const getBadgeEstado = (status: Pedido["status"]) => {
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
      case "enviado":
        return (
          <Badge
            variant="outline"
            className="bg-blue-100 text-blue-800 border-blue-200"
          >
            Enviado
          </Badge>
        );
      case "finalizado":
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-800 border-green-200"
          >
            Finalizado
          </Badge>
        );
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };

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

        {isLoading ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p>Cargando datos...</p>
            </CardContent>
          </Card>
        ) : (
          <div>
            {/* Métricas Clave */}
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
                    {formatCurrency(totalIngresos)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Desde {pedidos.length} pedidos
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Productos
                  </CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalProductos}</div>
                  <p className="text-xs text-muted-foreground">
                    Productos únicos vendidos
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Pedidos Pendientes
                  </CardTitle>
                  <Truck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {pedidosPorEstado.pendiente + pedidosPorEstado.enviado}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {pedidosPorEstado.finalizado} finalizados
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
                    {pedidos.length > 0
                      ? `${(
                          (pedidosPorEstado.finalizado / pedidos.length) *
                          100
                        ).toFixed(1)}%`
                      : "0%"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {pedidosPorEstado.finalizado} de {pedidos.length}{" "}
                    completados
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Gráfico de Ingresos */}
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
                    data={datosGraficoIngresos}
                    margin={{
                      top: 5,
                      right: 10,
                      left: 10,
                      bottom: 0,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="fecha"
                      tickFormatter={(fecha) => {
                        return new Date(fecha).toLocaleDateString("es-AR", {
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
                      dataKey="monto"
                      stroke="#8884d8"
                      strokeWidth={2}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Productos más vendidos y Pedidos recientes */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Productos más vendidos */}
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
                      {productosTop.map((producto) => (
                        <TableRow key={producto.id}>
                          <TableCell className="font-medium">
                            {producto.nombre}
                          </TableCell>
                          <TableCell className="text-right">
                            {producto.cantidad}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(producto.ingresos)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Pedidos recientes */}
              <Card>
                <CardHeader>
                  <CardTitle>Pedidos Recientes</CardTitle>
                  <CardDescription>
                    Los 5 pedidos más recientes del sistema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID Pedido</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pedidosRecientes.map((pedido) => {
                        const pedidoTotal = pedido.detalles.reduce(
                          (sum, detalle) =>
                            sum + detalle.amount * detalle.unit_price,
                          0
                        );
                        return (
                          <TableRow key={pedido.pedido_id}>
                            <TableCell className="font-medium">
                              #{pedido.pedido_id}
                            </TableCell>
                            <TableCell>{pedido.cliente}</TableCell>
                            <TableCell>
                              {new Date(pedido.fecha_pedido).toLocaleDateString(
                                "es-AR",
                                {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "2-digit",
                                }
                              )}
                            </TableCell>
                            <TableCell>
                              {getBadgeEstado(pedido.status)}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(pedidoTotal)}
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
        )}
      </div>
    </div>
  );
}
