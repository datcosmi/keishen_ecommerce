"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  List,
  Grid,
  RefreshCw,
  Plus,
  CheckSquare,
  Square,
  User,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import UserFormModal from "@/components/forms/userFormModal";

// Define the User interface
interface User {
  id_user: number;
  name: string;
  surname: string | null;
  email: string;
  pass: string;
  phone: string | null;
  role: string;
  provider: string | null;
}

type SortField = "name" | "email" | "role";
type SortDirection = "asc" | "desc";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const UserDashboard: React.FC = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("Todos");
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Estado para usuarios seleccionados
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [totalPages, setTotalPages] = useState(1);

  // Ordenamiento
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  // Vista
  const [isGridView, setIsGridView] = useState(false);

  // Cargar los usuarios desde la API
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/users`);
      if (!response.ok) {
        throw new Error(`Error fetching users: ${response.statusText}`);
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Error al cargar los usuarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRefresh = () => {
    fetchUsers();
  };

  const handleUserAdded = (newUser: any) => {
    // Ensure the newUser has all required properties before adding it to state
    if (newUser && newUser.role) {
      setUsers((prevUsers) => [newUser, ...prevUsers]);
    }
    // Fetch fresh data from the server
    handleRefresh();
  };

  // Manejadores para selección de usuarios
  const handleUserSelect = (id: number) => {
    setSelectedUsers((prev) => {
      if (prev.includes(id)) {
        return prev.filter((userId) => userId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === currentUsers.length) {
      // Deseleccionar todos
      setSelectedUsers([]);
    } else {
      // Seleccionar todos los usuarios visibles
      setSelectedUsers(currentUsers.map((user) => user.id_user));
    }
  };

  const handleUserClick = (userId: number) => {
    router.push(`/panel/users/${userId}`);
  };

  // Manejador para editar el usuario seleccionado
  const handleEdit = () => {
    if (selectedUsers.length === 1) {
      const userToEdit = users.find((u) => u.id_user === selectedUsers[0]);
      if (userToEdit) {
        setEditingUser(userToEdit);
        setEditModalOpen(true);
      }
    }
  };

  const handleUserUpdated = (updatedUser: User) => {
    setUsers(
      users.map((u) => (u.id_user === updatedUser.id_user ? updatedUser : u))
    );
    setEditingUser(null);
    setEditModalOpen(false);
    setSelectedUsers([]);
    handleRefresh();
  };

  // Manejador para eliminar usuarios
  // Manejador para "eliminar" usuarios (soft delete)
  const handleDelete = async () => {
    setLoading(true);
    try {
      // Preparar los datos para la actualización
      const usersToUpdate = selectedUsers.map((id) => ({
        id_user: id,
        is_deleted: true,
      }));

      // Realizar la solicitud PUT para actualizar los usuarios
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(usersToUpdate),
      });

      if (!response.ok) {
        throw new Error(`Error actualizando usuarios: ${response.statusText}`);
      }

      // Actualizar la lista de usuarios después del soft delete
      setUsers(users.filter((user) => !selectedUsers.includes(user.id_user)));
      setSelectedUsers([]);
      toast.success(
        selectedUsers.length > 1
          ? "Usuarios eliminados correctamente"
          : "Usuario eliminado correctamente"
      );
    } catch (error) {
      console.error("Error eliminando usuarios:", error);
      toast.error(
        selectedUsers.length > 1
          ? "Error al eliminar usuarios"
          : "Error al eliminar el usuario"
      );
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      // Refrescar los datos para reflejar los cambios
      fetchUsers();
    }
  };

  // Obtener los roles únicos para filtrado
  const uniqueRoles = Array.from(new Set(users.map((user) => user.role)));

  // Calcular las cantidades para los filtros
  const rolesCounts = uniqueRoles.reduce(
    (acc, role) => {
      acc[role] = users.filter((user) => user.role === role).length;
      return acc;
    },
    {} as Record<string, number>
  );

  const roleOptions = [
    { id: "todos", label: "Todos", count: users.length },
    ...uniqueRoles.map((role) => ({
      id: role,
      label: role.charAt(0).toUpperCase() + role.slice(1),
      count: rolesCounts[role] || 0,
    })),
  ];

  // Aplicar los filtros por búsqueda y rol
  const filteredUsers = users.filter((user) => {
    const fullName = `${user.name} ${user.surname || ""}`.toLowerCase();
    const matchesSearch =
      fullName.includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.phone && user.phone.includes(searchQuery));

    // Aplicar filtro por rol
    if (selectedRole !== "Todos" && user.role !== selectedRole.toLowerCase())
      return false;

    return matchesSearch;
  });

  // Ordenar los usuarios
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (sortField === "name") {
      const nameA = `${a.name} ${a.surname || ""}`;
      const nameB = `${b.name} ${b.surname || ""}`;
      return sortDirection === "asc"
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA);
    } else if (sortField === "email") {
      return sortDirection === "asc"
        ? a.email.localeCompare(b.email)
        : b.email.localeCompare(a.email);
    } else if (sortField === "role") {
      return sortDirection === "asc"
        ? a.role.localeCompare(b.role)
        : b.role.localeCompare(a.role);
    }
    return 0;
  });

  // Actualizar el total de páginas cuando los usuarios filtrados cambian
  useEffect(() => {
    setTotalPages(Math.max(1, Math.ceil(filteredUsers.length / rowsPerPage)));
    setCurrentPage(1); // Resetear a la primera página cuando cambian los filtros
  }, [filteredUsers.length, rowsPerPage]);

  // Paginación
  const indexOfLastUser = currentPage * rowsPerPage;
  const indexOfFirstUser = indexOfLastUser - rowsPerPage;
  const currentUsers = sortedUsers.slice(indexOfFirstUser, indexOfLastUser);

  // Manejadores para la paginación
  const handlePageChange = (page: number) => {
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (value: string) => {
    setRowsPerPage(Number(value));
    setCurrentPage(1); // Resetear a la primera página cuando cambia el número de filas
  };

  // Manejador para el ordenamiento
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Cambiar dirección si es la misma columna
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Nueva columna, comenzar con ascendente
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Renderizar indicador de ordenamiento
  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ChevronUp className="ml-1 h-4 w-4" />
    ) : (
      <ChevronDown className="ml-1 h-4 w-4" />
    );
  };

  // Generar las iniciales para el Avatar
  const getInitials = (name?: string, surname?: string | null): string => {
    const firstInitial = name ? name.charAt(0).toUpperCase() : "";
    const lastInitial = surname ? surname.charAt(0).toUpperCase() : "";
    return `${firstInitial}${lastInitial}`;
  };

  // Función para obtener el color de fondo del avatar basado en el rol
  const getAvatarColor = (role?: string): string => {
    if (!role) return "bg-gray-100 text-gray-800"; // Default for undefined/null roles

    switch (role.toLowerCase()) {
      case "admin":
      case "superadmin":
        return "bg-red-100 text-red-800";
      case "cliente":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-2 min-h-screen">
      <div className="p-6 flex-1">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Usuarios</h1>
            <p className="text-sm text-gray-500">
              Administración de usuarios del sistema
            </p>
          </div>
          <div className="flex items-center gap-2">
            {selectedUsers.length > 0 && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setSelectedUsers([])}
                  className="text-gray-600"
                >
                  Cancelar ({selectedUsers.length})
                </Button>

                {selectedUsers.length === 1 && (
                  <Button
                    variant="outline"
                    onClick={handleEdit}
                    className="bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"
                  >
                    <Edit size={16} className="mr-1" />
                    Editar
                  </Button>
                )}

                <AlertDialog
                  open={deleteDialogOpen}
                  onOpenChange={setDeleteDialogOpen}
                >
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                    >
                      <Trash2 size={16} className="mr-1" />
                      Eliminar{" "}
                      {selectedUsers.length > 1
                        ? `(${selectedUsers.length})`
                        : ""}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmar eliminación</AlertDialogTitle>
                      <AlertDialogDescription>
                        {selectedUsers.length === 1
                          ? "¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer."
                          : `¿Estás seguro de que deseas eliminar estos ${selectedUsers.length} usuarios? Esta acción no se puede deshacer.`}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-red-600 hover:bg-red-700"
                        disabled={loading}
                      >
                        {loading ? "Eliminando..." : "Eliminar"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}

            <UserFormModal
              onUserAdded={handleUserAdded}
              buttonLabel="Añadir Usuario"
              buttonIcon={<Plus className="h-5 w-5 mr-2" />}
            />
          </div>
        </div>

        {/* Filtros */}
        <div className="flex gap-4 mb-8 overflow-x-auto">
          {roleOptions.map((option) => (
            <Button
              key={option.id}
              variant={selectedRole === option.label ? "default" : "outline"}
              className={`rounded-lg text-sm font-medium ${
                selectedRole === option.label
                  ? "bg-black text-white"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
              onClick={() => setSelectedRole(option.label)}
            >
              {option.label}
              <span className="ml-2 text-xs">{option.count}</span>
            </Button>
          ))}

          <div className="flex ml-auto">
            <Button
              variant={isGridView ? "outline" : "default"}
              size="icon"
              className={`mr-2 ${!isGridView ? "bg-black text-white" : ""}`}
              onClick={() => setIsGridView(false)}
            >
              <List className="h-5 w-5" />
            </Button>
            <Button
              variant={isGridView ? "default" : "outline"}
              size="icon"
              className={isGridView ? "bg-black text-white" : ""}
              onClick={() => setIsGridView(true)}
            >
              <Grid className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Barra de búsqueda */}
        <div className="relative mb-6 flex">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              type="text"
              className="pl-10 pr-3 bg-white"
              placeholder="Buscar usuarios por nombre, email o teléfono..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            className="ml-2"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
            <span className="ml-2">Actualizar</span>
          </Button>
        </div>

        {/* Estado para cargar los usuarios */}
        {loading ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p>Cargando usuarios...</p>
            </CardContent>
          </Card>
        ) : (
          /* Tabla de usuarios */
          <Card>
            <CardContent className="p-0">
              {!isGridView ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10">
                          <button
                            onClick={handleSelectAll}
                            className="focus:outline-none"
                          >
                            {selectedUsers.length === currentUsers.length &&
                            currentUsers.length > 0 ? (
                              <CheckSquare
                                size={18}
                                className="text-blue-600"
                              />
                            ) : (
                              <Square size={18} className="text-gray-400" />
                            )}
                          </button>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer"
                          onClick={() => handleSort("name")}
                        >
                          <div className="flex items-center">
                            Nombre
                            {renderSortIndicator("name")}
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer"
                          onClick={() => handleSort("email")}
                        >
                          <div className="flex items-center">
                            Email
                            {renderSortIndicator("email")}
                          </div>
                        </TableHead>
                        <TableHead>
                          <div className="flex items-center">Teléfono</div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer"
                          onClick={() => handleSort("role")}
                        >
                          <div className="flex items-center">
                            Rol
                            {renderSortIndicator("role")}
                          </div>
                        </TableHead>
                        <TableHead>
                          <div className="flex items-center">Acceso</div>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentUsers.map((user) => (
                        <TableRow
                          key={user.id_user}
                          className={`hover:bg-gray-50 ${
                            selectedUsers.includes(user.id_user)
                              ? "bg-blue-50"
                              : ""
                          }`}
                        >
                          <TableCell className="p-2">
                            <button
                              onClick={() => handleUserSelect(user.id_user)}
                              className="focus:outline-none"
                            >
                              {selectedUsers.includes(user.id_user) ? (
                                <CheckSquare
                                  size={18}
                                  className="text-blue-600"
                                />
                              ) : (
                                <Square size={18} className="text-gray-400" />
                              )}
                            </button>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Avatar
                                className={
                                  user && user.role
                                    ? getAvatarColor(user.role)
                                    : "bg-gray-100 text-gray-800"
                                }
                              >
                                <AvatarFallback>
                                  {getInitials(user?.name, user?.surname)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="ml-4">
                                <div
                                  className="text-sm font-medium text-gray-900 hover:text-blue-600 cursor-pointer"
                                  onClick={() => handleUserClick(user.id_user)}
                                >
                                  {user.name} {user.surname || ""}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-600">
                              {user.email}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-600">
                              {user.phone || "N/A"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`
                                ${
                                  user.role === "admin"
                                    ? "bg-red-50 text-red-600 border-red-300"
                                    : user.role === "cliente"
                                      ? "bg-blue-50 text-blue-600 border-blue-300"
                                      : "bg-gray-50 text-gray-600 border-gray-300"
                                }
                              `}
                            >
                              {user.role.charAt(0).toUpperCase() +
                                user.role.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`
                                ${
                                  user.provider
                                    ? "bg-green-50 text-green-600 border-green-300"
                                    : "bg-purple-50 text-purple-600 border-purple-300"
                                }
                              `}
                            >
                              {user.provider || "Email/Password"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}

                      {currentUsers.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            className="text-center text-gray-500 h-32"
                          >
                            No se encontraron usuarios con los filtros actuales
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                // Vista de cuadrícula
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                  {currentUsers.map((user) => (
                    <Card
                      key={user.id_user}
                      className={
                        selectedUsers.includes(user.id_user)
                          ? "border-blue-300 bg-blue-50"
                          : ""
                      }
                      style={{ cursor: "pointer" }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center mb-3">
                          <button
                            onClick={() => handleUserSelect(user.id_user)}
                            className="focus:outline-none mr-2"
                          >
                            {selectedUsers.includes(user.id_user) ? (
                              <CheckSquare
                                size={18}
                                className="text-blue-600"
                              />
                            ) : (
                              <Square size={18} className="text-gray-400" />
                            )}
                          </button>
                          <Avatar
                            className={`h-12 w-12 ${user && user.role ? getAvatarColor(user.role) : "bg-gray-100 text-gray-800"}`}
                          >
                            <AvatarFallback className="text-lg">
                              {getInitials(user?.name, user?.surname)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="ml-3">
                            <span
                              onClick={() => handleUserClick(user.id_user)}
                              className="font-semibold hover:text-blue-600 cursor-pointer"
                            >
                              {user.name} {user.surname || ""}
                            </span>
                            <p className="text-sm text-gray-500">
                              {user.email}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-3">
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-500">
                              Teléfono:
                            </span>
                            <span className="text-sm">
                              {user.phone || "N/A"}
                            </span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <Badge
                            variant="outline"
                            className={`
                              ${
                                user.role === "admin"
                                  ? "bg-red-50 text-red-600 border-red-300"
                                  : user.role === "cliente"
                                    ? "bg-blue-50 text-blue-600 border-blue-300"
                                    : "bg-gray-50 text-gray-600 border-gray-300"
                              }
                            `}
                          >
                            {user.role.charAt(0).toUpperCase() +
                              user.role.slice(1)}
                          </Badge>

                          <Badge
                            variant="outline"
                            className={`
                              ${
                                user.provider
                                  ? "bg-green-50 text-green-600 border-green-300"
                                  : "bg-purple-50 text-purple-600 border-purple-300"
                              }
                            `}
                          >
                            {user.provider || "Email/Password"}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {currentUsers.length === 0 && (
                    <div className="col-span-full text-center text-gray-500 py-12">
                      No se encontraron usuarios con los filtros actuales
                    </div>
                  )}
                </div>
              )}

              {/* Paginación */}
              {filteredUsers.length > 0 && (
                <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
                  <div className="flex items-center">
                    <Select
                      value={rowsPerPage.toString()}
                      onValueChange={handleRowsPerPageChange}
                    >
                      <SelectTrigger className="w-20 h-8">
                        <SelectValue placeholder={rowsPerPage.toString()} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="text-sm text-gray-500 ml-2">
                      filas por página
                    </span>
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <span className="text-sm text-gray-700">
                      Página {currentPage} de {totalPages}
                    </span>

                    <div className="flex ml-2 gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage === 1}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronsLeft size={16} />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronLeft size={16} />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronRight size={16} />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handlePageChange(totalPages)}
                        disabled={currentPage === totalPages}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronsRight size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
