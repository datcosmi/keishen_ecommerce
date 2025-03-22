"use client";
import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
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

interface Category {
  id_cat: number;
  name: string;
}

interface CategoryModalProps {
  onCategoryAdded: (category: Category) => void;
  onCategoryUpdated?: (category: Category) => void;
  category?: Category;
  isEdit?: boolean;
  externalOpenState?: boolean;
  onOpenStateChange?: (open: boolean) => void;
}

const CategoryModal: React.FC<CategoryModalProps> = ({
  onCategoryAdded,
  onCategoryUpdated,
  category,
  isEdit = false,
  externalOpenState,
  onOpenStateChange,
}) => {
  // Si hay un estado externo, lo usamos; de lo contrario, usamos el estado interno
  const [internalOpen, setInternalOpen] = useState(false);

  // Determinar qué estado de apertura usar
  const open =
    externalOpenState !== undefined ? externalOpenState : internalOpen;

  // Función para cambiar el estado de apertura
  const setOpen = (value: boolean) => {
    if (onOpenStateChange) {
      onOpenStateChange(value);
    } else {
      setInternalOpen(value);
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Category>({
    id_cat: 0,
    name: "",
  });

  // Inicializar el formulario con los datos de la categoría si estamos en modo edición
  useEffect(() => {
    if (isEdit && category) {
      setFormData({
        id_cat: category.id_cat,
        name: category.name,
      });
    }
  }, [isEdit, category]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "id_cat" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // URL y método HTTP dependen de si estamos creando o actualizando
      const url = isEdit
        ? `http://localhost:3001/api/categories/${formData.id_cat}`
        : "http://localhost:3001/api/categories";
      const method = isEdit ? "PUT" : "POST";

      // Si estamos creando, solo enviamos el nombre (ya que id_cat es autoincrementable)
      const bodyData = isEdit ? formData : { name: formData.name };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bodyData),
      });

      if (!response.ok) {
        throw new Error(
          `Error al ${isEdit ? "actualizar" : "añadir"} la categoría`
        );
      }

      // Obtener la respuesta para conseguir el ID generado en caso de creación
      const responseData = await response.json();

      // En modo creación, usamos la respuesta que incluye el ID generado
      // En modo edición, usamos nuestros datos del formulario
      const categoryData = isEdit ? formData : responseData;

      if (isEdit && onCategoryUpdated) {
        onCategoryUpdated(categoryData);
        toast.success("Categoría actualizada", {
          description: `${formData.name} ha sido actualizada correctamente.`,
        });
      } else {
        onCategoryAdded(categoryData);
        toast.success("Categoría añadida", {
          description: `${formData.name} ha sido añadida correctamente.`,
        });
      }

      // Cerrar modal y resetear formulario (si no es edición)
      setOpen(false);
      if (!isEdit) {
        resetForm();
      }
    } catch (error) {
      console.error(
        `Error ${isEdit ? "actualizando" : "añadiendo"} categoría:`,
        error
      );
      toast.error("Error", {
        description: `Ha ocurrido un error al ${
          isEdit ? "actualizar" : "añadir"
        } la categoría.`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      id_cat: 0,
      name: "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {!isEdit && (
          <Button>
            <Plus className="h-5 w-5 mr-2" />
            Añadir Categoría
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Actualizar Categoría" : "Añadir Nueva Categoría"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Modifica los datos de la categoría existente."
              : "Completa el formulario para añadir una nueva categoría."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre de la Categoría *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Nombre de la categoría"
              required
            />
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? isEdit
                  ? "Actualizando..."
                  : "Guardando..."
                : isEdit
                ? "Actualizar Categoría"
                : "Guardar Categoría"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryModal;
