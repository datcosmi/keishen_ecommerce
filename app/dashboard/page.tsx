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
import Sidebar from "../components/admins/sidebar";

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
    <div className="flex flex-col md:flex-row gap-2 min-h-screen bg-[#eaeef6]">
      <Sidebar />
      {/* Contact Section */}
      <div className="p-6 pr-2 flex-1">
        <h2 className="text-3xl font-bold mb-8">Dashboard</h2>
      </div>
    </div>
  );
};

export default Contacto;
