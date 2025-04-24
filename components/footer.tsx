import { Facebook } from "lucide-react";
import { useEffect, useState } from "react";

interface Category {
  id: string;
  name: string;
}

const Footer = () => {
  return (
    <footer className="bg-black text-white">
      <div className="overflow-visible h-full flex items-center justify-center">
        <span className="text-[20rem] font-extrabold text-center tracking-tighter font-bold text-transparent bg-clip-text bg-gradient-to-t from-yellow-100 to-white whitespace-nowrap">
          KEISHEN
        </span>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 place-items-center">
          <div>
            <h3 className="text-lg font-semibold mb-4">Horario de Atención</h3>
            <p>Lun - Sab: 12:00 p.m. - 7:00 p.m.</p>
            <p>Domingo: Cerrado</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contacto</h3>
            <p>Tel: 618 164 0266</p>
            <p>Email: fabioladeduarte89@gmail.com</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Síguenos</h3>
            <div className="flex space-x-4">
              <a
                href="https://www.facebook.com/Copimegatron"
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
            </div>
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
