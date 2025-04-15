"use client";
import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Shield, CreditCard, Truck, ArrowRight } from "lucide-react";

const PaymentMethodsSection: React.FC = () => {
  // Animation variants for staggered appearance
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  };

  return (
    <section className="py-16 px-8 bg-white relative z-20">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">MÉTODOS DE PAGO SEGUROS</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Ofrecemos múltiples opciones de pago seguras y convenientes para que
            realices tus compras con total confianza
          </p>
        </div>

        {/* Payment Methods Display */}
        <motion.div
          className="flex flex-col md:flex-row justify-between items-center gap-8 mb-16"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
        >
          {/* PayPal */}
          <motion.div
            className="w-full md:w-1/2 rounded-xl overflow-hidden shadow-lg border border-gray-100 p-8 flex flex-col items-center"
            variants={item}
          >
            <div className="mb-8 h-16 w-full flex justify-center items-center">
              <Image
                src="/images/paypal-logo.png"
                alt="PayPal"
                width={200}
                height={64}
                className="object-contain"
                unoptimized
              />
            </div>
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold mb-3">Paga con PayPal</h3>
              <p className="text-gray-600">
                Realiza pagos rápidos y seguros con tu cuenta de PayPal.
                Protección al comprador en todas tus transacciones.
              </p>
            </div>
            <div className="bg-gray-50 w-full p-4 rounded-lg">
              <ul className="space-y-3">
                <li className="flex items-center">
                  <Shield className="h-4 w-4 text-green-600 mr-2" />
                  <span className="text-sm">Protección de compra</span>
                </li>
                <li className="flex items-center">
                  <CreditCard className="h-4 w-4 text-green-600 mr-2" />
                  <span className="text-sm">
                    Vincular tarjetas de crédito y débito
                  </span>
                </li>
                <li className="flex items-center">
                  <ArrowRight className="h-4 w-4 text-green-600 mr-2" />
                  <span className="text-sm">Pago con un solo clic</span>
                </li>
              </ul>
            </div>
          </motion.div>

          {/* Mercado Pago */}
          <motion.div
            className="w-full md:w-1/2 rounded-xl overflow-hidden shadow-lg border border-gray-100 p-8 flex flex-col items-center"
            variants={item}
          >
            <div className="mb-8 h-16 w-full flex justify-center items-center">
              <Image
                src="/images/mercadopago-logo.png"
                alt="Mercado Pago"
                width={200}
                height={64}
                className="object-contain"
                unoptimized
              />
            </div>
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold mb-3">Paga con Mercado Pago</h3>
              <p className="text-gray-600">
                La plataforma de pagos líder en Latinoamérica. Paga con tarjeta,
                transferencia o saldo en tu cuenta.
              </p>
            </div>
            <div className="bg-gray-50 w-full p-4 rounded-lg">
              <ul className="space-y-3">
                <li className="flex items-center">
                  <CreditCard className="h-4 w-4 text-blue-600 mr-2" />
                  <span className="text-sm">Múltiples métodos de pago</span>
                </li>
                <li className="flex items-center">
                  <Shield className="h-4 w-4 text-blue-600 mr-2" />
                  <span className="text-sm">Pago 100% seguro</span>
                </li>
                <li className="flex items-center">
                  <Truck className="h-4 w-4 text-blue-600 mr-2" />
                  <span className="text-sm">Meses sin intereses</span>
                </li>
              </ul>
            </div>
          </motion.div>
        </motion.div>

        {/* Additional Trust Indicators */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          <motion.div className="p-6 bg-gray-50 rounded-lg" variants={item}>
            <div className="flex justify-center mb-4">
              <Shield className="h-10 w-10 text-yellow-500" />
            </div>
            <h3 className="text-lg font-bold mb-2">Pagos Seguros</h3>
            <p className="text-gray-600 text-sm">
              Todas las transacciones están protegidas con encriptación SSL de
              256 bits.
            </p>
          </motion.div>

          <motion.div className="p-6 bg-gray-50 rounded-lg" variants={item}>
            <div className="flex justify-center mb-4">
              <CreditCard className="h-10 w-10 text-yellow-500" />
            </div>
            <h3 className="text-lg font-bold mb-2">Múltiples Opciones</h3>
            <p className="text-gray-600 text-sm">
              Aceptamos diversas formas de pago para tu conveniencia.
            </p>
          </motion.div>

          <motion.div className="p-6 bg-gray-50 rounded-lg" variants={item}>
            <div className="flex justify-center mb-4">
              <Truck className="h-10 w-10 text-yellow-500" />
            </div>
            <h3 className="text-lg font-bold mb-2">Envíos Garantizados</h3>
            <p className="text-gray-600 text-sm">
              Realiza tu pago y recibe tu producto con total garantía.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default PaymentMethodsSection;
