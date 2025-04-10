"use client";

import Link from "next/link";
import { Check, ChevronRight, ShoppingBag, Truck } from "lucide-react";
import NavbarWhite from "@/components/navbarWhite";
import Footer from "@/components/footer";

const CompraConfirmada = () => {
  // Format current date for display
  const formatDate = () => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date().toLocaleDateString("es-MX");
  };

  return (
    <div className="min-h-screen bg-white">
      <NavbarWhite />

      <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Success Banner */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8 flex items-center">
          <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Check className="h-6 w-6 text-green-600" />
          </div>
          <div className="ml-4">
            <h2 className="text-lg font-medium text-green-800">
              ¡Pedido realizado con éxito!
            </h2>
            <p className="text-green-700">
              Tu pedido ha sido registrado correctamente.
            </p>
          </div>
        </div>

        {/* Order details */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  Detalles del pedido
                </h1>
                <p className="text-gray-500 mt-1">{formatDate()}</p>
              </div>
              <div className="mt-4 md:mt-0">
                <span className="px-3 py-1 rounded-full text-sm font-medium text-green-600 bg-green-100">
                  Confirmado
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Payment info */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  Información de pago
                </h3>
                <div className="text-sm text-gray-600">
                  <p className="mb-1">
                    <span className="font-medium">Método de pago:</span>{" "}
                    Procesado
                  </p>
                  <p className="text-gray-600 text-sm mt-2">
                    Recibirás un correo con los detalles de tu compra.
                  </p>
                </div>
              </div>

              {/* Shipping info */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  Dirección de recogida
                </h3>
                <address className="text-sm text-gray-600 not-italic">
                  Calle 5 de Febrero 603
                  <br />
                  Zona Centro
                  <br />
                  34000 Durango, Durango
                  <br />
                  México
                </address>
              </div>
            </div>
          </div>

          {/* Order timeline */}
          <div className="p-6">
            <h3 className="text-sm font-medium text-gray-900 mb-4">
              Estado del pedido
            </h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="ml-4">
                  <h4 className="text-sm font-medium text-gray-900">
                    Pedido recibido
                  </h4>
                  <p className="text-sm text-gray-500 mt-1">{formatDate()}</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <ShoppingBag className="h-5 w-5 text-gray-500" />
                  </div>
                </div>
                <div className="ml-4">
                  <h4 className="text-sm font-medium text-gray-900">
                    Procesando pedido
                  </h4>
                  <p className="text-sm text-gray-500 mt-1">
                    Estamos preparando tu pedido
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <Truck className="h-5 w-5 text-gray-500" />
                  </div>
                </div>
                <div className="ml-4">
                  <h4 className="text-sm font-medium text-gray-900">
                    Listo para recoger
                  </h4>
                  <p className="text-sm text-gray-500 mt-1">
                    Te notificaremos cuando tu pedido esté listo para recoger
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Next steps */}
        <div className="flex flex-cols-2 md:flex-row gap-4 md:gap-8">
          <Link href="/productos" className="flex-1">
            <div className="bg-white rounded-xl border border-gray-200 p-6 h-full hover:border-black transition-colors">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Continuar comprando
              </h3>
              <p className="text-gray-600 mb-4">
                Explora nuestro catálogo para descubrir más productos
              </p>
              <div className="flex items-center text-black font-medium">
                Ver productos <ChevronRight className="h-4 w-4 ml-1" />
              </div>
            </div>
          </Link>

          {/* <Link href="/mis-pedidos" className="flex-1">
            <div className="bg-white rounded-xl border border-gray-200 p-6 h-full hover:border-black transition-colors">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Ver mis pedidos
              </h3>
              <p className="text-gray-600 mb-4">
                Consulta el estado de todos tus pedidos anteriores
              </p>
              <div className="flex items-center text-black font-medium">
                Mis pedidos <ChevronRight className="h-4 w-4 ml-1" />
              </div>
            </div>
          </Link> */}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CompraConfirmada;
