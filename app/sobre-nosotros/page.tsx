"use client";
import {
  MapPinIcon,
  ClockIcon,
  PhoneIcon,
  EnvelopeIcon,
  UserGroupIcon,
} from "@heroicons/react/24/solid";
import { Facebook, Instagram, ChevronRight } from "lucide-react";
import NavbarBlack from "@/components/navbarBlack";
import { useInView } from "react-intersection-observer";
import Footer from "@/components/footer";
import Image from "next/image";
import { useEffect, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const AboutUs = () => {
  // Page content state
  const [aboutUsParagraphs, setAboutUsParagraphs] = useState<string[]>([]);
  const [scheduleParagraphs, setScheduleParagraphs] = useState<string[]>([]);
  const [contactInfo, setContactInfo] = useState({
    location: "",
    phone: "",
    email: "",
    facebook: "",
    instagram: "",
  });
  const [locationUrl, setLocationUrl] = useState("");

  const [isLoading, setIsLoading] = useState(true);

  // Animation refs
  const [aboutRef, aboutInView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const [contactRef, contactInView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const [mapRef, mapInView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const [socialRef, socialInView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  // Fetch page content from the API
  const fetchAboutUsParagraphs = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/page-content/about-us`);
      if (!response.ok) {
        throw new Error("Failed to fetch about us paragraphs");
      }
      const data = await response.json();
      setAboutUsParagraphs(data.map((item: any) => item.value));
    } catch (error) {
      console.error("Error fetching about us paragraphs", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchScheduleParagraphs = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/page-content/schedule`);
      if (!response.ok) {
        throw new Error("Failed to fetch schedule paragraphs");
      }
      const data = await response.json();
      setScheduleParagraphs(data.map((item: any) => item.value));
    } catch (error) {
      console.error("Error fetching schedule paragraphs", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLocationUrl = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/page-content/location`);
      if (!response.ok) {
        throw new Error("Failed to fetch location URL");
      }
      const data = await response.json();
      setLocationUrl(data[0].value);
    } catch (error) {
      console.error("Error fetching location URL", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchContactInfo = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/page-content/contact`);
      if (!response.ok) {
        throw new Error("Failed to fetch contact info");
      }
      const data = await response.json();

      // Process the contact info into an object with keys
      const contactData = data.reduce((acc: any, item: any) => {
        acc[item.key] = item.value;
        return acc;
      }, {});

      setContactInfo(contactData);
    } catch (error) {
      console.error("Error fetching contact info", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAboutUsParagraphs();
    fetchScheduleParagraphs();
    fetchLocationUrl();
    fetchContactInfo();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <NavbarBlack />

      {/* About Us Section */}
      <section
        id="sobre-nosotros"
        className="py-16 md:py-24 bg-gray-50"
        ref={aboutRef}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div
              className={`transform transition-all duration-1000 delay-200 ${
                aboutInView
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-20"
              }`}
            >
              <div className="relative">
                <div className="absolute -top-4 -left-4 w-24 h-24 bg-yellow-400 rounded-tl-3xl z-0"></div>
                <div className="relative z-10 overflow-hidden rounded-lg shadow-xl">
                  <Image
                    src="/images/boutique-exterior.jpg"
                    alt="Boutique exterior"
                    width={600}
                    height={800}
                    className="w-full h-auto object-cover"
                  />
                </div>
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-black rounded-br-3xl z-0"></div>
              </div>
            </div>

            <div
              className={`transform transition-all duration-1000 delay-400 ${
                aboutInView
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 translate-x-20"
              }`}
            >
              <div className="flex items-center mb-6">
                <UserGroupIcon className="w-8 h-8 text-yellow-400 mr-3" />
                <h2 className="text-3xl font-bold">Sobre Nosotros</h2>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-400">
                {aboutUsParagraphs.map((text, index) => (
                  <p key={index} className="text-gray-700 mb-6 leading-relaxed">
                    {text}
                  </p>
                ))}
              </div>

              <div className="mt-8 flex space-x-4">
                <button className="bg-black text-white px-6 py-3 rounded-lg font-medium flex items-center hover:bg-gray-800 transition-colors">
                  Nuestros Productos
                  <ChevronRight className="w-5 h-5 ml-2" />
                </button>
                <button className="bg-transparent border-2 border-black text-black px-6 py-3 rounded-lg font-medium hover:bg-black hover:text-white transition-colors">
                  Nuestra Historia
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contacto" className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl md:text-4xl font-bold mb-16">
            <span className="inline-block border-b-4 border-yellow-400 pb-2">
              Comunícate con Nosotros
            </span>
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-1 gap-12">
            {/* Contact Information */}
            <div
              ref={contactRef}
              className={`transform transition-all duration-1000 delay-200 ${
                contactInView
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-20"
              }`}
            >
              <div className="bg-gray-50 p-8 rounded-xl shadow-lg h-full">
                <h3 className="text-2xl font-bold mb-8 border-l-4 border-yellow-400 pl-4">
                  Información de Contacto
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Address */}
                  <div className="flex items-start space-x-6">
                    <div className="bg-yellow-400 p-3 rounded-lg">
                      <MapPinIcon className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg">Dirección</h4>
                      <p className="text-gray-600 mt-1">
                        {contactInfo.location}
                      </p>
                    </div>
                  </div>

                  {/* Hours */}
                  <div className="flex items-start space-x-6">
                    <div className="bg-yellow-400 p-3 rounded-lg">
                      <ClockIcon className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg">Horario</h4>
                      <div className="mt-1">
                        {scheduleParagraphs.map((text, index) => (
                          <p key={index} className="text-gray-600">
                            {text}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start space-x-6">
                    <div className="bg-yellow-400 p-3 rounded-lg">
                      <PhoneIcon className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg">Teléfono</h4>
                      <p className="text-gray-600 mt-1">{contactInfo.phone}</p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start space-x-6">
                    <div className="bg-yellow-400 p-3 rounded-lg">
                      <EnvelopeIcon className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg">Email</h4>
                      <p className="text-gray-600 mt-1">{contactInfo.email}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Google Maps Integration */}
          <div className="mt-20">
            <div
              ref={mapRef}
              className={`transform transition-all duration-1000 delay-200 ${
                mapInView
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-20"
              }`}
            >
              <h3 className="text-2xl font-bold mb-6 text-center">
                <span className="inline-block border-b-4 border-yellow-400 pb-2">
                  Nuestra Ubicación
                </span>
              </h3>
              <div className="w-full h-[450px] rounded-xl overflow-hidden shadow-xl border-4 border-white">
                {locationUrl && (
                  <iframe
                    src={locationUrl}
                    width="100%"
                    height="450"
                    style={{ border: 0 }}
                    allowFullScreen={false}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="w-full h-full"
                  ></iframe>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Media Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-gray-900 to-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            ref={socialRef}
            className={`text-center transform transition-all duration-1000 ${
              socialInView
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Síguenos en{" "}
              <span className="text-yellow-400">Redes Sociales</span>
            </h2>
            <p className="text-lg text-gray-300 mb-12 max-w-2xl mx-auto">
              Mantente al día con nuestras últimas novedades, productos
              exclusivos y eventos especiales
            </p>
            <div className="flex flex-wrap justify-center gap-8">
              <a
                href={contactInfo.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center transition-transform hover:scale-110"
              >
                <div
                  className="bg-blue-600 text-white p-6 rounded-full mb-4 
                              group-hover:shadow-lg group-hover:shadow-blue-500/50 transition-all duration-300"
                >
                  <Facebook className="w-8 h-8" />
                </div>
                <span className="text-gray-200 font-medium">Facebook</span>
              </a>

              {contactInfo.instagram && (
                <a
                  href={contactInfo.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center transition-transform hover:scale-110"
                >
                  <div
                    className="bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 text-white p-6 rounded-full mb-4 
                              group-hover:shadow-lg group-hover:shadow-pink-500/50 transition-all duration-300"
                  >
                    <Instagram className="w-8 h-8" />
                  </div>
                  <span className="text-gray-200 font-medium">Instagram</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutUs;
