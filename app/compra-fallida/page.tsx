"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import {
  XCircle,
  ChevronRight,
  ShoppingBag,
  AlertCircle,
  ArrowLeft,
  RefreshCw,
  Check,
} from "lucide-react";
import NavbarWhite from "@/components/navbarWhite";
import Footer from "@/components/footer";

type FailureReason =
  | "rejected"
  | "cc_rejected_bad_filled_card_number"
  | "cc_rejected_bad_filled_date"
  | "cc_rejected_bad_filled_other"
  | "cc_rejected_bad_filled_security_code"
  | "cc_rejected_blacklist"
  | "cc_rejected_call_for_authorize"
  | "cc_rejected_card_disabled"
  | "cc_rejected_duplicated_payment"
  | "cc_rejected_high_risk"
  | "cc_rejected_insufficient_amount"
  | "cc_rejected_invalid_installments"
  | "cc_rejected_max_attempts"
  | "cc_rejected_unregistered_card"
  | "missing_payment_id"
  | "order_creation_failed"
  | "cart_details_failed"
  | "invalid_reference"
  | "missing_data"
  | "incomplete_reference"
  | "general_error"
  | "order_process_failed";

// Create a client component that uses useSearchParams
function CompraFallidaContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status") || "rejected";
  const error = searchParams.get("error");
  const paymentId = searchParams.get("payment_id");

  // Format current date for display
  const formatDate = () => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date().toLocaleDateString("es-MX");
  };

  // Error messages for different failure reasons
  const errorMessages: Record<FailureReason, string> = {
    rejected: "Tu pago ha sido rechazado por el procesador de pagos.",
    cc_rejected_bad_filled_card_number: "El número de tarjeta es incorrecto.",
    cc_rejected_bad_filled_date: "La fecha de vencimiento es incorrecta.",
    cc_rejected_bad_filled_security_code:
      "El código de seguridad es incorrecto.",
    cc_rejected_bad_filled_other: "Hay un error en los datos de la tarjeta.",
    cc_rejected_blacklist: "La tarjeta está en una lista de restricciones.",
    cc_rejected_call_for_authorize:
      "Necesitas autorizar el pago con el banco emisor.",
    cc_rejected_card_disabled: "La tarjeta está deshabilitada.",
    cc_rejected_duplicated_payment: "Ya se realizó un pago por el mismo monto.",
    cc_rejected_high_risk: "El pago fue rechazado por riesgo.",
    cc_rejected_insufficient_amount: "Fondos insuficientes.",
    cc_rejected_invalid_installments: "El número de cuotas es inválido.",
    cc_rejected_max_attempts: "Se alcanzó el límite de intentos permitidos.",
    cc_rejected_unregistered_card: "La tarjeta no está registrada.",
    missing_payment_id: "No se pudo identificar el pago.",
    order_creation_failed: "No se pudo crear el pedido en nuestro sistema.",
    cart_details_failed: "No se pudieron obtener los detalles del carrito.",
    invalid_reference: "La referencia del pedido es inválida.",
    missing_data: "Faltan datos necesarios para procesar el pago.",
    incomplete_reference: "La referencia del pedido está incompleta.",
    general_error: "Ocurrió un error inesperado durante el proceso de pago.",
    order_process_failed: "No se pudo procesar el pedido correctamente.",
  };

  // Get error message based on error param or status
  const getErrorDetails = () => {
    if (error && Object.keys(errorMessages).includes(error as FailureReason)) {
      return {
        title: "Pago fallido",
        message: errorMessages[error as FailureReason],
      };
    }

    // Default error message
    return {
      title: "Pago rechazado",
      message:
        "Hubo un problema con tu pago. Por favor, intenta con otro método de pago.",
    };
  };

  const errorDetails = getErrorDetails();

  return (
    <div className="min-h-screen bg-white">
      <NavbarWhite />

      <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Error Banner */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8 flex items-center">
          <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <XCircle className="h-6 w-6 text-red-600" />
          </div>
          <div className="ml-4">
            <h2 className="text-lg font-medium text-red-800">
              {errorDetails.title}
            </h2>
            <p className="text-red-700">{errorDetails.message}</p>
            {paymentId && (
              <p className="text-gray-600 text-sm mt-1">
                ID de pago: {paymentId}
              </p>
            )}
          </div>
        </div>

        {/* Order details */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  Detalles del intento de pago
                </h1>
                <p className="text-gray-500 mt-1">{formatDate()}</p>
              </div>
              <div className="mt-4 md:mt-0">
                <span className="px-3 py-1 rounded-full text-sm font-medium text-red-600 bg-red-100">
                  Fallido
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Payment info */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  Información de pago
                </h3>
                <div className="text-sm text-gray-600">
                  <p className="mb-1">
                    <span className="font-medium">Método de pago:</span> Mercado
                    Pago
                  </p>
                  <p className="text-gray-600 text-sm mt-2">
                    Tu pago no ha sido procesado. Los artículos permanecen en tu
                    carrito.
                  </p>
                </div>
              </div>

              {/* What to do next */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  ¿Qué puedo hacer?
                </h3>
                <ul className="text-sm text-gray-600 list-disc pl-5 space-y-2">
                  <li>Verifica que los datos de tu tarjeta sean correctos</li>
                  <li>Intenta con otro método de pago</li>
                  <li>
                    Contacta a tu banco para verificar el estado de tu tarjeta
                  </li>
                  <li>Si el problema persiste, contáctanos para asistencia</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Order timeline */}
          <div className="p-6">
            <h3 className="text-sm font-medium text-gray-900 mb-4">
              Estado del intento de pago
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
                    Carrito creado
                  </h4>
                  <p className="text-sm text-gray-500 mt-1">{formatDate()}</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-red-500 rounded-full flex items-center justify-center">
                    <XCircle className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="ml-4">
                  <h4 className="text-sm font-medium text-gray-900">
                    Pago rechazado
                  </h4>
                  <p className="text-sm text-gray-500 mt-1">
                    El proceso de pago no pudo completarse
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Next steps */}
        <div className="flex flex-col md:flex-row gap-4 md:gap-8">
          <Link href="/carrito" className="flex-1">
            <div className="bg-white rounded-xl border border-gray-200 p-6 h-full hover:border-black transition-colors">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Volver al carrito
              </h3>
              <p className="text-gray-600 mb-4">
                Revisa tu carrito e intenta completar tu compra nuevamente
              </p>
              <div className="flex items-center text-black font-medium">
                Ver carrito <ChevronRight className="h-4 w-4 ml-1" />
              </div>
            </div>
          </Link>

          <Link href="/productos" className="flex-1">
            <div className="bg-white rounded-xl border border-gray-200 p-6 h-full hover:border-black transition-colors">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Explorar productos
              </h3>
              <p className="text-gray-600 mb-4">
                Continúa explorando nuestro catálogo de productos
              </p>
              <div className="flex items-center text-black font-medium">
                Ver productos <ChevronRight className="h-4 w-4 ml-1" />
              </div>
            </div>
          </Link>
        </div>

        {/* Contacto y ayuda */}
        <div className="mt-8 p-6 bg-gray-50 rounded-xl">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            ¿Necesitas ayuda?
          </h3>
          <p className="text-gray-600 mb-4">
            Si continúas teniendo problemas con tu pago, no dudes en
            contactarnos:
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/sobre-nosotros"
              className="inline-flex items-center px-4 py-2 border border-gray-300 bg-white rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <AlertCircle className="h-4 w-4 mr-2" />
              Contactar soporte
            </Link>
            <Link
              href="/carrito"
              className="inline-flex items-center px-4 py-2 border border-transparent bg-black rounded-md text-sm font-medium text-white hover:bg-gray-800"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Intentar de nuevo
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

// Main component with Suspense boundary
const CompraFallida = () => {
  return (
    <Suspense fallback={<div className="p-8">Cargando...</div>}>
      <CompraFallidaContent />
    </Suspense>
  );
};

export default CompraFallida;
