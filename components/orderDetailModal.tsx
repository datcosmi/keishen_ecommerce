import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Order, ProductVariant } from "@/types/orderTypes";
import {
  RulerIcon,
  LayersIcon,
  TagIcon,
  CircleIcon,
  XIcon,
} from "lucide-react";

interface OrderDetailsModalProps {
  order: Order | null;
  onClose?: () => void;
}

const VariantBadge: React.FC<{ variant: ProductVariant }> = ({ variant }) => {
  // Check if it's a color variant
  if (variant.detail_name.toLowerCase() === "color") {
    const isHexColor = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(
      variant.detail_desc
    );

    if (isHexColor) {
      return (
        <div className="inline-flex items-center bg-gray-50 rounded-full px-2 py-1 mr-1 mb-1 border border-gray-100">
          <div
            className="w-4 h-4 rounded-full mr-1.5 ring-1 ring-gray-200"
            style={{ backgroundColor: variant.detail_desc }}
          />
          <span className="text-xs font-medium text-gray-700">
            {variant.detail_desc}
          </span>
        </div>
      );
    }
  }

  // Regular variant display with appropriate styling based on type
  const getVariantStyle = () => {
    switch (variant.detail_name.toLowerCase()) {
      case "tamaño":
      case "talla":
      case "size":
        return "bg-blue-50 text-blue-700 border-blue-100";
      case "material":
        return "bg-amber-50 text-amber-700 border-amber-100";
      case "estilo":
      case "style":
        return "bg-purple-50 text-purple-700 border-purple-100";
      default:
        return "bg-gray-50 text-gray-700 border-gray-100";
    }
  };

  const getVariantIcon = (variantName: string) => {
    const name = variantName.toLowerCase();
    if (name === "color") return <div className="w-3 h-3 mr-1.5"></div>; // Placeholder for color circle
    if (name === "tamaño" || name === "talla" || name === "size")
      return <RulerIcon size={12} className="mr-1.5" />;
    if (name === "material") return <LayersIcon size={12} className="mr-1.5" />;
    if (name === "estilo" || name === "style")
      return <TagIcon size={12} className="mr-1.5" />;
    return <CircleIcon size={12} className="mr-1.5" />;
  };

  return (
    <span
      className={`text-xs font-medium px-2 py-1 rounded-full inline-flex items-center mr-1 mb-1 border transition-all hover:-translate-y-0.5 hover:shadow-sm ${getVariantStyle()}`}
    >
      <span>{getVariantIcon(variant.detail_name)}</span>
      <span className="font-semibold mr-1">{variant.detail_name}:</span>{" "}
      {variant.detail_desc}
    </span>
  );
};

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  order,
  onClose,
}) => {
  // Formatear fecha
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Renderizar el badge de estado con el color correspondiente
  const renderStatusBadge = (status: string) => {
    let colorClass = "";

    switch (status) {
      case "pendiente":
        colorClass = "bg-yellow-50 text-yellow-600 border-yellow-300";
        break;
      case "enviado":
        colorClass = "bg-blue-50 text-blue-600 border-blue-300";
        break;
      case "finalizado":
        colorClass = "bg-green-50 text-green-600 border-green-300";
        break;
      case "cancelado":
        colorClass = "bg-red-50 text-red-600 border-red-300";
        break;
      default:
        colorClass = "bg-gray-50 text-gray-600 border-gray-300";
    }

    return (
      <Badge variant="outline" className={colorClass}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  // Calcular el total de un pedido
  const calculateOrderTotal = (order: Order): number => {
    return order.detalles.reduce((total, item) => {
      const discountMultiplier = 1 - item.discount / 100;
      return total + item.unit_price * item.amount * discountMultiplier;
    }, 0);
  };

  const orderHasDiscounts = (order: Order): boolean => {
    return order.detalles.some((item) => item.discount > 0);
  };

  if (!order) return null;

  return (
    <DialogContent
      className="sm:max-w-3xl max-h-screen flex flex-col"
      onInteractOutside={onClose}
    >
      <DialogHeader className="space-y-1 pb-2 border-b">
        <div className="flex items-center justify-between">
          <DialogTitle className="text-xl">
            Pedido #{order.pedido_id}
            <span className="ml-2">{renderStatusBadge(order.status)}</span>
          </DialogTitle>
        </div>
        <DialogDescription className="text-sm text-gray-500">
          {formatDate(order.fecha_pedido)} •{" "}
          {order.metodo_pago.charAt(0).toUpperCase() +
            order.metodo_pago.slice(1)}
        </DialogDescription>
      </DialogHeader>

      <ScrollArea className="flex-1 pr-4">
        <div className="py-4 space-y-6">
          {/* Customer Information */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Información del cliente
            </h3>
            <div className="text-sm">
              <p className="font-medium">
                {order.cliente || "No especificado"} {order.surname || ""}
              </p>
              {order.email && <p className="text-gray-600">{order.email}</p>}
              {order.phone && <p className="text-gray-600">{order.phone}</p>}
            </div>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Productos
            </h3>
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="w-1/2">Producto</TableHead>
                    <TableHead className="text-center">Cantidad</TableHead>
                    <TableHead className="text-right">Precio</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.detalles.map((item, index) => (
                    <TableRow key={index} className="group hover:bg-gray-50">
                      <TableCell className="py-3">
                        <div>
                          <div className="font-medium">
                            {item.producto.producto_nombre}
                          </div>
                          {item.producto.variantes &&
                            item.producto.variantes.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {item.producto.variantes.map(
                                  (variant, vIdx) => (
                                    <VariantBadge
                                      key={vIdx}
                                      variant={variant}
                                    />
                                  )
                                )}
                              </div>
                            )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {item.amount}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.discount > 0 ? (
                          <div>
                            <span className="line-through text-gray-400">
                              ${item.unit_price.toLocaleString()}
                            </span>
                            <div className="text-green-600">
                              $
                              {(
                                item.unit_price *
                                (1 - item.discount / 100)
                              ).toLocaleString()}
                              <Badge className="ml-2 text-xs bg-green-50 text-green-600 border-green-200">
                                {item.discount}% off
                              </Badge>
                            </div>
                          </div>
                        ) : (
                          `$${item.unit_price.toLocaleString()}`
                        )}
                      </TableCell>
                      <TableCell className="font-medium text-right">
                        $
                        {(
                          item.unit_price *
                          (1 - item.discount / 100) *
                          item.amount
                        ).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </ScrollArea>

      <div className="mt-2 pt-4 border-t">
        <div className="flex items-center justify-between">
          <div>
            {orderHasDiscounts(order) && (
              <Badge className="bg-orange-50 text-orange-600 border-orange-200">
                Incluye descuento(s)
              </Badge>
            )}
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Total del pedido</div>
            <div className="font-semibold text-xl">
              ${calculateOrderTotal(order).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      <DialogFooter className="pt-4">
        <Button variant="outline" onClick={onClose} className="mr-2">
          Cerrar
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default OrderDetailsModal;
