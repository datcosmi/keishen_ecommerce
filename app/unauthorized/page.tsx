"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";

export default function UnauthorizedPage() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full">
        <div className="text-red-500 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 mx-auto"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Acceso Denegado
        </h1>

        <p className="text-gray-600 mb-6">
          {isAuthenticated
            ? `Lo sentimos ${
                user?.name || "usuario"
              }, no tienes permisos para acceder a esta página.`
            : "Necesitas iniciar sesión para acceder a esta página."}
        </p>

        <div className="flex flex-col space-y-3">
          <Link
            href="/"
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition duration-200"
          >
            <span className="flex items-center justify-center">
              <ChevronLeftIcon className="h-4 w-4 mr-1" />
              Ir a la página de inicio
            </span>
          </Link>

          {!isAuthenticated && (
            <Link
              href="/login"
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition duration-200"
            >
              Iniciar Sesión
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
