"use client";
import {
  MapPinIcon,
  ClockIcon,
  PhoneIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/solid";
import { Facebook } from "lucide-react";
import NavbarBlack from "../components/navbarBlack";
import { useInView } from "react-intersection-observer";
import { useRef } from "react";
import Footer from "../components/footer";

const Contacto = () => {
  const [ref5, inView5] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [ref6, inView6] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const contactoRef = useRef(null);

  return (
    <div className="min-h-screen bg-white">
      <NavbarBlack />
      {/* Contact Section */}
      <section id="contacto" ref={contactoRef} className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div
              ref={ref5}
              className={`transform transition-all duration-1000 delay-200
                ${
                  inView5
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-20"
                }`}
            >
              <h2 className="text-3xl font-bold mb-8">
                Información de Contacto
              </h2>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <MapPinIcon className="w-6 h-6 text-yellow-400 mt-1" />
                  <div>
                    <h3 className="font-semibold">Dirección</h3>
                    <p className="text-gray-600">
                      Calle 5 de Febrero 603, Zona Centro, 34000 Durango, Dgo.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <ClockIcon className="w-6 h-6 text-yellow-400 mt-1" />
                  <div>
                    <h3 className="font-semibold">Horario</h3>
                    <p className="text-gray-600">
                      Lun - Sab: 12:00 p.m. - 7:00 p.m.
                    </p>
                    <p className="text-gray-600">Domingo: Cerrado</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <PhoneIcon className="w-6 h-6 text-yellow-400 mt-1" />
                  <div>
                    <h3 className="font-semibold">Teléfono</h3>
                    <p className="text-gray-600">618 164 0266</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <EnvelopeIcon className="w-6 h-6 text-yellow-400 mt-1" />
                  <div>
                    <h3 className="font-semibold">Email</h3>
                    <p className="text-gray-600">fabioladeduarte89@gmail.com</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Google Maps Integration */}
          <div className="mt-16">
            <div
              className={`transform transition-all duration-1000 delay-200
                ${
                  inView5
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-20"
                }`}
            >
              <h3 className="text-2xl font-bold mb-6">Nuestra Ubicación</h3>
              <div className="w-full h-[450px] rounded-lg overflow-hidden shadow-lg">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d227.76387341780188!2d-104.67023644655634!3d24.023236312912996!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x869bc8181c7a5065%3A0x358c5a2f061fa53d!2sCalle%205%20de%20Febrero%20603-Int%20205%2C%20Zona%20Centro%2C%2034000%20Durango%2C%20Dgo.!5e0!3m2!1ses!2smx!4v1740169285814!5m2!1ses!2smx"
                  width="100%"
                  height="450"
                  style={{ border: 0 }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Media Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            ref={ref6}
            className={`text-center transform transition-all duration-1000
              ${
                inView6
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
          >
            <h2 className="text-3xl font-bold mb-8">
              Síguenos en Redes Sociales
            </h2>
            <p className="text-lg text-gray-600 mb-12">
              Mantente al día con nuestras últimas novedades y servicios
            </p>
            <div className="flex justify-center space-x-8">
              <a
                href="https://www.facebook.com/profile.php?id=61569793203905"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center transition-transform hover:scale-110"
              >
                <div
                  className="bg-blue-600 text-white p-4 rounded-full mb-3 
                              group-hover:shadow-lg transition-all duration-300"
                >
                  <Facebook className="w-8 h-8" />
                </div>
                <span className="text-gray-600 font-medium">Facebook</span>
              </a>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Contacto;
