"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Search, Edit, Trash2 } from "lucide-react";
import Sidebar from "../components/admins/sidebar";

interface Product {
  id: string;
  name: string;
  brand: string;
  description: string;
  price: number;
  rating: number;
  reviews: number;
  sizes: string[];
  colors: string[];
  straps: string[];
  image: string;
  inStock: boolean;
}

const ProductDashboard: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Todos");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products");
        const data = await response.json();

        // Agregar campo inStock a los productos si no existe
        const productsWithStock = data.map((product: any) => ({
          ...product,
          inStock:
            product.inStock !== undefined
              ? product.inStock
              : Math.random() > 0.3, // Si no existe, asigna un valor aleatorio
        }));

        setProducts(productsWithStock);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Calcular las cantidades para los filtros
  const inStockCount = products.filter((p) => p.inStock).length;
  const outOfStockCount = products.filter((p) => !p.inStock).length;

  const statusOptions = [
    { id: "todos", label: "Todos", count: products.length },
    { id: "existencia", label: "En existencia", count: inStockCount },
    { id: "agotados", label: "Agotados", count: outOfStockCount },
  ];

  // Aplicar los filtros por búsqueda y estado
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase());

    // Aplicar filtro por estado
    if (selectedStatus === "En existencia" && !product.inStock) return false;
    if (selectedStatus === "Agotados" && product.inStock) return false;

    return matchesSearch;
  });

  const handleDelete = (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este producto?")) {
      setProducts(products.filter((product) => product.id !== id));
    }
  };

  const handleEdit = (id: string) => {
    alert(`Editando producto con ID: ${id}`);
  };

  return (
    <div className="flex flex-col md:flex-row gap-2 min-h-screen bg-[#eaeef6]">
      <Sidebar />
      <div className="p-6 flex-1">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Productos</h1>
            <p className="text-sm text-gray-500">
              Aquí tienes una lista de todos los productos disponibles
            </p>
          </div>
          <button className="p-2 bg-black text-white rounded-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-plus"
            >
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </svg>
          </button>
        </div>

        {/* Filtros */}
        <div className="flex gap-4 mb-8 overflow-x-auto">
          {statusOptions.map((option) => (
            <button
              key={option.id}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedStatus === option.label
                  ? "bg-black text-white"
                  : "text-gray-600 bg-[#eaeef6] hover:bg-gray-50"
              }`}
              onClick={() => setSelectedStatus(option.label)}
            >
              {option.label}
              <span className="ml-2 text-xs">{option.count}</span>
            </button>
          ))}

          <div className="flex ml-auto">
            <button className="p-2 bg-white border border-gray-200 rounded-md mr-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-list"
              >
                <line x1="8" x2="21" y1="6" y2="6" />
                <line x1="8" x2="21" y1="12" y2="12" />
                <line x1="8" x2="21" y1="18" y2="18" />
                <line x1="3" x2="3" y1="6" y2="6" />
                <line x1="3" x2="3" y1="12" y2="12" />
                <line x1="3" x2="3" y1="18" y2="18" />
              </svg>
            </button>
            <button className="p-2 bg-black text-white rounded-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-grid"
              >
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                <line x1="3" x2="21" y1="9" y2="9" />
                <line x1="3" x2="21" y1="15" y2="15" />
                <line x1="9" x2="9" y1="3" y2="21" />
                <line x1="15" x2="15" y1="3" y2="21" />
              </svg>
            </button>
          </div>
        </div>

        {/* Barra de búsqueda */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-300 focus:border-yellow-300"
            placeholder="Buscar productos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Estado para cargar los productos */}
        {loading ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p>Cargando productos...</p>
          </div>
        ) : (
          /* Tabla de productos */
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Producto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Marca
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Precio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tallas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100">
                            <div className="w-6 h-6 relative">
                              <Image
                                src={product.image}
                                alt={product.name}
                                layout="fill"
                                objectFit="contain"
                              />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {product.name}
                            </div>
                            <div className="text-xs text-gray-500 max-w-xs truncate">
                              {product.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {product.brand}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          ${product.price.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {product.sizes.length > 0 ? (
                            product.sizes.map((size, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 text-xs bg-gray-100 rounded-md"
                              >
                                {size}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-gray-500">N/A</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            product.inStock
                              ? "bg-[#06d6a0] bg-opacity-10 text-[#06d6a0] border border-emerald-300"
                              : "bg-[#ff006e] bg-opacity-10 text-[#ff006e] border border-pink-300"
                          }`}
                        >
                          {product.inStock ? "En existencia" : "Agotado"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(product.id)}
                            className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                            title="Editar producto"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="p-1 text-red-600 hover:text-red-800 transition-colors"
                            title="Eliminar producto"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredProducts.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-4 text-center text-gray-500"
                      >
                        No se encontraron productos con los filtros actuales
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDashboard;
