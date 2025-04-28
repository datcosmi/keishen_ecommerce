"use client";

import { useState, useEffect } from "react";
import {
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  PhoneIcon,
  ChevronLeftIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  const validateEmail = (email: string) => {
    const emailRegex =
      /^[\w-.]+@(gmail\.com|outlook\.com|hotmail\.com|yahoo\.com)$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).{8,}$/;
    return passwordRegex.test(password);
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validation
    if (
      !formData.name ||
      !formData.surname ||
      !formData.email ||
      !formData.password
    ) {
      setError("Todos los campos obligatorios deben estar llenos");
      setLoading(false);
      return;
    }

    if (!validateEmail(formData.email)) {
      setError(
        "Por favor ingresa un correo válido de Gmail, Outlook, Hotmail o Yahoo."
      );
      setLoading(false);
      return;
    }

    if (!validatePassword(formData.password)) {
      setError(
        "La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas, números y símbolos."
      );
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      setLoading(false);
      return;
    }

    try {
      // Prepare data for API
      const userData = {
        name: formData.name,
        surname: formData.surname,
        email: formData.email,
        pass: formData.password,
        phone: formData.phone || null, // Optional field
        role: "cliente", // Fixed role
      };

      // Send request to register endpoint
      const response = await fetch(`${API_BASE_URL}/api/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al registrar usuario");
      }

      // Registration successful
      setSuccess(true);

      // Auto login after successful registration
      setTimeout(async () => {
        await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });
        router.push("/");
      }, 1500);
    } catch (error) {
      console.error("Error en el registro:", error);
      setError("Error en el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-16 lg:px-24">
        <div className="max-w-md mx-auto w-full">
          {/* Back to home button */}
          <div className="mb-4">
            <Button
              variant="link"
              className="text-yellow-500 hover:text-yellow-600 mb-6 p-0 h-auto"
              onClick={() => router.push("/")}
            >
              <span className="flex items-center">
                <ChevronLeftIcon className="h-4 w-4 mr-1" />
                Regresar a la tienda
              </span>
            </Button>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Crea tu cuenta
          </h1>
          <p className="text-gray-600 mb-8">Registra tus datos para comenzar</p>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              ¡Registro exitoso! Iniciando sesión...
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Name field */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="name"
                  placeholder="Nombre"
                  className="block w-full pl-10 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Surname field */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="surname"
                  placeholder="Apellido"
                  className="block w-full pl-10 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                  value={formData.surname}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Email field */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  placeholder="Correo electrónico"
                  className="block w-full pl-10 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Phone field (optional) */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <PhoneIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Teléfono (opcional)"
                  className="block w-full pl-10 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              {/* Password field */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  name="password"
                  placeholder="Contraseña"
                  className="block w-full pl-10 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Confirm Password field */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirmar contraseña"
                  className="block w-full pl-10 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="mt-8">
              <button
                type="submit"
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-3 rounded-lg transition duration-200"
                disabled={loading}
              >
                {loading ? "Procesando..." : "Registrarse"}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">O regístrate con</p>
            <div className="mt-3">
              <button
                onClick={() => signIn("google", { callbackUrl: "/" })}
                className="flex items-center justify-center w-full border border-gray-300 rounded-lg py-2 px-4 hover:bg-gray-50 transition duration-200"
                disabled={loading}
              >
                <Image
                  src="/google-icon.png"
                  alt="Google"
                  width={20}
                  height={20}
                  className="mr-2"
                />
                <span className="text-gray-500">Google</span>
              </button>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              ¿Ya tienes una cuenta?{" "}
              <Link href="/login" className="text-yellow-500 hover:underline">
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <div className="absolute inset-0">
          <Image
            src="/login-background.jpg"
            alt="Registration background"
            fill
            style={{ objectFit: "cover" }}
            priority
          />
        </div>
      </div>
    </div>
  );
}
