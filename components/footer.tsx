import { Facebook, Instagram } from "lucide-react";
import { useEffect, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const Footer = () => {
  const [scheduleParagraphs, setScheduleParagraphs] = useState<string[]>([]);
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
    <footer className="bg-black text-white">
      <div className="overflow-visible h-full flex items-center justify-center">
        <span className="text-[13rem] font-extrabold text-center tracking-tighter font-bold text-transparent bg-clip-text bg-gradient-to-t from-yellow-100 to-white whitespace-nowrap">
          KEISHEN
        </span>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 place-items-center">
          <div>
            <h3 className="text-lg font-semibold mb-4">Horario de Atención</h3>
            {scheduleParagraphs.map((text, index) => (
              <p key={index}>{text}</p>
            ))}
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contacto</h3>
            <p>Tel: {contactInfo.phone}</p>
            <p>Email: {contactInfo.email}</p>
          </div>
          <div>
            {contactInfo.facebook || contactInfo.instagram ? (
              <>
                <h3 className="text-lg font-semibold mb-4">Síguenos</h3>
                <div className="flex space-x-4">
                  {contactInfo.facebook && (
                    <a
                      href={contactInfo.facebook}
                      target="_blank"
                      className="hgroup flex flex-col items-center transition-transform hover:scale-110"
                    >
                      <span className="sr-only">Facebook</span>
                      <div
                        className="text-white pr-4 mb-3 
                              group-hover:shadow-lg transition-all duration-300"
                      >
                        <Facebook className="w-8 h-8" />
                      </div>
                    </a>
                  )}
                  {contactInfo.instagram && (
                    <a
                      href={contactInfo.instagram}
                      target="_blank"
                      className="hgroup flex flex-col items-center transition-transform hover:scale-110"
                    >
                      <span className="sr-only">Instagram</span>
                      <div
                        className="text-white pr-4 mb-3 
                              group-hover:shadow-lg transition-all duration-300"
                      >
                        <Instagram className="w-8 h-8" />
                      </div>
                    </a>
                  )}
                </div>
              </>
            ) : (
              <h3 className="text-lg font-semibold mb-4">Contáctanos</h3>
            )}
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-800 text-center">
          <p>
            &copy; {new Date().getFullYear()} Keishen. Todos los derechos
            reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
