"use client";
import React, { useState } from "react";
import { Plus, Search, Check, User } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSession } from "next-auth/react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

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

interface UserFormModalProps {
  onUserAdded: (user: User) => void;
  onUserUpdated?: (user: User) => void;
  user?: User | null;
  buttonLabel?: string;
  buttonIcon?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const UserFormModal: React.FC<UserFormModalProps> = ({
  onUserAdded,
  user = null,
  onUserUpdated,
  buttonLabel = "Añadir Usuario",
  buttonIcon = <Plus className="h-5 w-5 mr-2" />,
  isOpen,
  onOpenChange,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const controlled = isOpen !== undefined && onOpenChange !== undefined;
  const open = controlled ? isOpen : internalOpen;
  const setOpen = controlled ? onOpenChange : setInternalOpen;
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get token from session
  const { data: session } = useSession();
  const token = session?.accessToken;

  // Form state
  const [formData, setFormData] = useState<User>({
    id_user: user?.id_user || 0,
    name: user?.name || "",
    surname: user?.surname || null,
    email: user?.email || "",
    pass: "",
    phone: user?.phone || null,
    role: user?.role || "cliente",
    provider: user?.provider || null,
  });

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      role: value,
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es obligatorio";
    }

    if (!formData.email.trim()) {
      newErrors.email = "El email es obligatorio";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Formato de email inválido";
    }

    if (!user && !formData.pass) {
      newErrors.pass = "La contraseña es obligatoria";
    } else if (!user && formData.pass.length < 6) {
      newErrors.pass = "La contraseña debe tener al menos 6 caracteres";
    }

    if (formData.phone && !/^\d{9,15}$/.test(formData.phone)) {
      newErrors.phone = "Formato de teléfono inválido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const endpoint = `${API_BASE_URL}/api/users${user?.id_user ? `/${user.id_user}` : ""}`;

      // Create a clean data object that matches the expected API format
      const userData = {
        ...formData,
        // Convert empty strings to null for consistency
        surname: formData.surname || null,
        phone: formData.phone || null,
        // Don't send id_user for new users
        ...(user?.id_user ? {} : { id_user: undefined }),
        // Don't modify the provider field when updating
        ...(user?.id_user ? { provider: undefined } : { provider: null }),
        // Only include password if it was entered
        ...(formData.pass ? {} : { pass: undefined }),
      };

      const response = await fetch(endpoint, {
        method: user?.id_user ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message ||
            `Error ${user ? "updating" : "creating"} user: ${response.statusText}`
        );
      }

      const result = await response.json();

      // Call the appropriate callback
      if (user?.id_user) {
        if (onUserUpdated) onUserUpdated(result);
        toast.success("Usuario actualizado correctamente");
      } else {
        onUserAdded(result);
        toast.success("Usuario añadido correctamente");
      }

      // Reset form and close modal
      resetForm();
      setOpen(false);
    } catch (error) {
      console.error("Error processing user:", error);
      toast.error(
        user ? "Error al actualizar usuario" : "Error al añadir usuario"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    if (!user) {
      setFormData({
        id_user: 0,
        name: "",
        surname: null,
        email: "",
        pass: "",
        phone: null,
        role: "cliente",
        provider: null,
      });
    } else {
      setFormData({
        ...user,
        pass: "",
      });
    }
    setErrors({});
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (newOpen === false) {
          resetForm();
        }
        setOpen(newOpen);
      }}
    >
      {!controlled && (
        <DialogTrigger asChild>
          <Button>
            {buttonIcon}
            {buttonLabel}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {user ? "Editar Usuario" : "Añadir Nuevo Usuario"}
          </DialogTitle>
          <DialogDescription>
            Completa el formulario para {user ? "editar el" : "añadir un nuevo"}{" "}
            usuario.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Nombre *
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Nombre"
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="surname" className="text-sm font-medium">
              Apellido
            </Label>
            <Input
              id="surname"
              name="surname"
              value={formData.surname || ""}
              onChange={handleInputChange}
              placeholder="Apellido"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email *
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="correo@ejemplo.com"
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="pass" className="text-sm font-medium">
              {user ? "Nueva Contraseña" : "Contraseña *"}
            </Label>
            <Input
              id="pass"
              name="pass"
              type="password"
              value={formData.pass}
              onChange={handleInputChange}
              placeholder={
                user ? "Dejar en blanco para mantener" : "Contraseña"
              }
              className={errors.pass ? "border-red-500" : ""}
            />
            {errors.pass && (
              <p className="text-red-500 text-xs mt-1">{errors.pass}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium">
              Teléfono
            </Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone || ""}
              onChange={handleInputChange}
              placeholder="Teléfono"
              className={errors.phone ? "border-red-500" : ""}
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="text-sm font-medium">
              Rol *
            </Label>
            <Select value={formData.role} onValueChange={handleRoleChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cliente">Cliente</SelectItem>
                <SelectItem value="vendedor">Vendedor</SelectItem>
                <SelectItem value="admin_tienda">
                  Administrador en tienda
                </SelectItem>
                <SelectItem value="superadmin">Super Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                setOpen(false);
              }}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? user
                  ? "Actualizando..."
                  : "Guardando..."
                : user
                  ? "Actualizar Usuario"
                  : "Guardar Usuario"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserFormModal;
