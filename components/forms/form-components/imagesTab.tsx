import React from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { ImagesTabProps } from "@/types/productFormTypes";

const ImagesTab: React.FC<ImagesTabProps> = ({
  images,
  productImages,
  handleFileChange,
  removeSelectedImage,
  handleImageDelete,
  IMAGES_BASE_URL,
}) => {
  return (
    <div className="space-y-4">
      <Label>Imágenes del Producto</Label>

      {/* Área para cargar nuevas imágenes */}
      <div className="border-2 border-dashed rounded-md p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors">
        <Input
          type="file"
          id="product-images"
          className="hidden"
          onChange={handleFileChange}
          multiple
          accept="image/*"
        />
        <Label
          htmlFor="product-images"
          className="cursor-pointer flex flex-col items-center"
        >
          <Upload className="h-8 w-8 mb-2 text-gray-400" />
          <span className="text-sm font-medium">
            Haz clic para seleccionar imágenes
          </span>
          <span className="text-xs text-gray-500 mt-1">
            o arrastra y suelta tus archivos aquí
          </span>
        </Label>
      </div>

      {/* Vista previa de imágenes nuevas */}
      {images.length > 0 && (
        <div className="mt-4">
          <Label className="mb-2 block">Imágenes nuevas seleccionadas</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((image, idx) => (
              <div
                key={idx}
                className="relative rounded-md overflow-hidden h-32 bg-gray-100"
              >
                <Image
                  src={URL.createObjectURL(image)}
                  alt={`Preview ${idx}`}
                  width={500}
                  height={500}
                  className="w-full h-full object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6 rounded-full"
                  onClick={() => removeSelectedImage(idx)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Imágenes existentes del producto (para modo edición) */}
      {productImages.length > 0 && (
        <div className="mt-6">
          <Label className="mb-2 block">Imágenes actuales del producto</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {productImages.map((image) => (
              <div
                key={image.image_id}
                className="relative rounded-md overflow-hidden h-32 bg-gray-100"
              >
                <Image
                  src={`${IMAGES_BASE_URL}${image.image_url}`}
                  alt={`Image not found`}
                  width={500}
                  height={500}
                  className="w-full h-full object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6 rounded-full"
                  onClick={() => handleImageDelete(image.image_id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImagesTab;
