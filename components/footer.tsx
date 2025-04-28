import { Facebook, Instagram, MapPin, Phone, Mail, Clock } from "lucide-react";
import { useEffect, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const Footer = () => {
  const [scheduleParagraphs, setScheduleParagraphs] = useState([]);
  const [contactInfo, setContactInfo] = useState({
    location: "",
    phone: "",
    email: "",
    facebook: "",
    instagram: "",
  });

  const [isLoading, setIsLoading] = useState(true);

  // Fetch page content from the API
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
    fetchScheduleParagraphs();
    fetchContactInfo();
  }, []);

  return (
    <footer className="bg-gradient-to-b from-black to-gray-900 text-white">
      {/* Stylish logo area with gradient effect */}
      <div className="overflow-hidden py-10 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/10 z-0"></div>
        <div className="relative z-10 flex items-center justify-center">
          <h1 className="text-5xl md:text-7xl lg:text-9xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-t from-yellow-200 via-yellow-100 to-white">
            KEISHEN
          </h1>
        </div>
      </div>

      {/* Footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {/* Schedule section */}
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center gap-2 mb-6">
              <Clock className="w-5 h-5 text-yellow-300" />
              <h3 className="text-xl font-semibold">Horario de Atención</h3>
            </div>
            <div className="space-y-2">
              {isLoading ? (
                <div className="animate-pulse h-24 bg-gray-700 rounded w-full"></div>
              ) : (
                scheduleParagraphs.map((text, index) => (
                  <p key={index} className="text-gray-300">
                    {text}
                  </p>
                ))
              )}
            </div>
          </div>

          {/* Contact section */}
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center gap-2 mb-6">
              <Mail className="w-5 h-5 text-yellow-300" />
              <h3 className="text-xl font-semibold">Contacto</h3>
            </div>
            <div className="space-y-4">
              {isLoading ? (
                <div className="animate-pulse h-20 bg-gray-700 rounded w-full"></div>
              ) : (
                <>
                  {contactInfo.location && (
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <p className="text-gray-300">{contactInfo.location}</p>
                    </div>
                  )}
                  {contactInfo.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <p className="text-gray-300">{contactInfo.phone}</p>
                    </div>
                  )}
                  {contactInfo.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <p className="text-gray-300">{contactInfo.email}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Social Media section */}
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-5 h-5 text-yellow-300 flex items-center justify-center">
                @
              </div>
              <h3 className="text-xl font-semibold">Síguenos</h3>
            </div>
            {isLoading ? (
              <div className="animate-pulse h-16 bg-gray-700 rounded w-full"></div>
            ) : (
              <div className="flex gap-6">
                {contactInfo.facebook && (
                  <a
                    href={contactInfo.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group"
                    aria-label="Facebook"
                  >
                    <div className="bg-gray-800 p-3 rounded-full transform transition-all duration-300 group-hover:bg-blue-600 group-hover:scale-110">
                      <Facebook className="w-6 h-6" />
                    </div>
                  </a>
                )}
                {contactInfo.instagram && (
                  <a
                    href={contactInfo.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group"
                    aria-label="Instagram"
                  >
                    <div className="bg-gray-800 p-3 rounded-full transform transition-all duration-300 group-hover:bg-pink-600 group-hover:scale-110">
                      <Instagram className="w-6 h-6" />
                    </div>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Divider line */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} Keishen. Todos los derechos
              reservados.
            </p>
            <div className="mt-4 md:mt-0">
              <a
                href="#"
                className="text-sm text-gray-400 hover:text-white transition-colors mr-6"
              >
                Política de Privacidad
              </a>
              <a
                href="#"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Términos de Servicio
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
