'use client';

import { useInView } from "react-intersection-observer";
import Footer from "@/components/footer";
import NavbarWhite from "@/components/navbarWhite";
import { CircleDollarSign } from "lucide-react";

// Definición de tipos para los datos de la respuesta
interface PaymentResponse {
  url: string;
}

const PaymentPage = () => {
  // Configuración de animaciones de entrada
  const [ref5, inView5] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const userId = localStorage.getItem("user_id");

  // Función que maneja el checkout y redirige al usuario
  const handleCheckout = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/pago/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: userId }),
      });

      if (!res.ok) {
        throw new Error("Error al crear el pago");
      } 

      const data: PaymentResponse = await res.json();
      console.log("Respuesta del backend:", data);

      if (data && data.url) {
        setTimeout(() => {
          window.location.href = data.url;
        }, 500);
      } else {
        console.error("No se recibió la URL de Mercado Pago");
        alert("Hubo un problema al crear el pago. Intenta nuevamente.");
      }
    } catch (error) {
      console.error("Error en la solicitud:", error);
      alert("Hubo un error en el proceso de pago.");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <NavbarWhite />
      {/* Payment Methods Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-8">
            {/* Mercado Pago Card */}
            <div
              ref={ref5}
              className={`transform transition-all duration-1000 delay-200 ${
                inView5 ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-20"
              }`}
            >
              <div className="bg-yellow-500 rounded-lg shadow-lg overflow-hidden transition transform hover:scale-105 hover:shadow-2xl w-80">
                <div className="p-6 flex flex-col items-center">
                  <CircleDollarSign className="h-10 w-10" />
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">Pagar con Mercado Pago</h2>
                  <p className="text-gray-700 text-center mb-4">
                    Disfruta de pagos rápidos y seguros a través de Mercado Pago.
                  </p>
                  <button
                    onClick={handleCheckout}
                    className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:bg-indigo-700"
                  >
                    Realizar Pago
                  </button>
                </div>
              </div>
            </div>

            {/* PayPal Card */}
            <div
              ref={ref5}
              className={`transform transition-all duration-1000 delay-200 ${
                inView5 ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-20"
              }`}
            >
              <div className="bg-blue-600 rounded-lg shadow-lg overflow-hidden transition transform hover:scale-105 hover:shadow-2xl w-80">
                <div className="p-6 flex flex-col items-center">
                  <CircleDollarSign className="h-10 w-10" />
                  <h2 className="text-xl font-semibold text-white mb-2">Pagar con PayPal</h2>
                  <p className="text-white text-center mb-4">
                    Realiza tus pagos de manera segura con tu cuenta de PayPal.
                  </p>
                  <button className="bg-blue-700 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:bg-blue-800">
                    Realizar Pago
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default PaymentPage;
