import React from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { VariantsTabProps } from "@/types/productFormTypes";

const VariantsTab: React.FC<VariantsTabProps> = ({
  formData,

  // Color props
  colorInput,
  setColorInput,
  colorStockInput,
  setColorStockInput,
  addColor,
  removeColor,
  editColorStock,

  // Size props
  sizeInput,
  setSizeInput,
  sizeStockInput,
  setSizeStockInput,
  addSize,
  removeSize,
  editSizeStock,

  // Talla props
  tallaInput,
  setTallaInput,
  tallaStockInput,
  setTallaStockInput,
  addTalla,
  removeTalla,
  editTallaStock,

  // Material props
  materialInput,
  setMaterialInput,
  materialStockInput,
  setMaterialStockInput,
  addMaterial,
  removeMaterial,
  editMaterialStock,
}) => {
  return (
    <div className="space-y-6">
      {/* Colors */}
      <div className="space-y-2">
        <Label>Colores Disponibles</Label>
        <div className="flex gap-2">
          <Input
            type="color"
            value={colorInput}
            onChange={(e) => setColorInput(e.target.value)}
            className="w-16"
          />
          <Input
            type="number"
            min="0"
            placeholder="Stock"
            value={colorStockInput}
            onChange={(e) => setColorStockInput(e.target.value)}
            className="w-24"
          />
          <Button
            type="button"
            onClick={addColor}
            variant="outline"
            className="flex-1"
          >
            Añadir Color
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {formData.colorDetails.length > 0 ? (
            formData.colorDetails.map((detail) => (
              <div
                key={detail.detail_desc}
                className="flex items-center gap-1 px-3 py-1 rounded-md border"
              >
                <div
                  className="h-4 w-4 rounded-full"
                  style={{ backgroundColor: detail.detail_desc }}
                />
                <span className="text-sm">{detail.detail_desc}</span>
                <Input
                  type="number"
                  min="0"
                  value={detail.stock || ""}
                  onChange={(e) =>
                    editColorStock(detail, parseInt(e.target.value) || 0)
                  }
                  className="w-16 h-6 mx-1 p-1 text-xs"
                />
                <X
                  className="h-3 w-3 ml-1 cursor-pointer"
                  onClick={() => removeColor(detail.detail_desc)}
                />
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No hay colores añadidos</p>
          )}
        </div>
      </div>

      {/* Sizes */}
      <div className="space-y-2">
        <Label>Tamaños Disponibles</Label>
        <div className="flex gap-2">
          <Input
            value={sizeInput}
            onChange={(e) => setSizeInput(e.target.value)}
            placeholder="Añadir tamaño (ej: 10cm x 15cm)"
            className="flex-1"
          />
          <Input
            type="number"
            min="0"
            placeholder="Stock"
            value={sizeStockInput}
            onChange={(e) => setSizeStockInput(e.target.value)}
            className="w-24"
          />
          <Button type="button" onClick={addSize} variant="outline">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {formData.sizeDetails.length > 0 ? (
            formData.sizeDetails.map((detail) => (
              <Badge
                key={detail.detail_desc}
                variant="secondary"
                className="px-3 py-1 flex items-center"
              >
                {detail.detail_desc}
                <Input
                  type="number"
                  min="0"
                  value={detail.stock || ""}
                  onChange={(e) =>
                    editSizeStock(detail, parseInt(e.target.value) || 0)
                  }
                  className="w-16 h-6 mx-1 p-1 text-xs"
                />
                <X
                  className="h-3 w-3 ml-1 cursor-pointer"
                  onClick={() => removeSize(detail.detail_desc)}
                />
              </Badge>
            ))
          ) : (
            <p className="text-sm text-gray-500">No hay tamaños añadidos</p>
          )}
        </div>
      </div>

      {/* Tallas */}
      <div className="space-y-2">
        <Label>Tallas Disponibles</Label>
        <div className="flex gap-2">
          <Input
            value={tallaInput}
            onChange={(e) => setTallaInput(e.target.value)}
            placeholder="Añadir talla (ej: S, M, L, XL)"
            className="flex-1"
          />
          <Input
            type="number"
            min="0"
            placeholder="Stock"
            value={tallaStockInput}
            onChange={(e) => setTallaStockInput(e.target.value)}
            className="w-24"
          />
          <Button type="button" onClick={addTalla} variant="outline">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {formData.tallaSizeDetails.length > 0 ? (
            formData.tallaSizeDetails.map((detail) => (
              <Badge
                key={detail.detail_desc}
                variant="secondary"
                className="px-3 py-1 flex items-center"
              >
                {detail.detail_desc}
                <Input
                  type="number"
                  min="0"
                  value={detail.stock || ""}
                  onChange={(e) =>
                    editTallaStock(detail, parseInt(e.target.value) || 0)
                  }
                  className="w-16 h-6 mx-1 p-1 text-xs"
                />
                <X
                  className="h-3 w-3 ml-1 cursor-pointer"
                  onClick={() => removeTalla(detail.detail_desc)}
                />
              </Badge>
            ))
          ) : (
            <p className="text-sm text-gray-500">No hay tallas añadidas</p>
          )}
        </div>
      </div>

      {/* Materials */}
      <div className="space-y-2">
        <Label>Materiales Disponibles</Label>
        <div className="flex gap-2">
          <Input
            value={materialInput}
            onChange={(e) => setMaterialInput(e.target.value)}
            placeholder="Añadir material (ej: Algodón, Poliéster)"
            className="flex-1"
          />
          <Input
            type="number"
            min="0"
            placeholder="Stock"
            value={materialStockInput}
            onChange={(e) => setMaterialStockInput(e.target.value)}
            className="w-24"
          />
          <Button type="button" onClick={addMaterial} variant="outline">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {formData.materialDetails.length > 0 ? (
            formData.materialDetails.map((detail) => (
              <Badge
                key={detail.detail_desc}
                variant="secondary"
                className="px-3 py-1 flex items-center"
              >
                {detail.detail_desc}
                <Input
                  type="number"
                  min="0"
                  value={detail.stock || ""}
                  onChange={(e) =>
                    editMaterialStock(detail, parseInt(e.target.value) || 0)
                  }
                  className="w-16 h-6 mx-1 p-1 text-xs"
                />
                <X
                  className="h-3 w-3 ml-1 cursor-pointer"
                  onClick={() => removeMaterial(detail.detail_desc)}
                />
              </Badge>
            ))
          ) : (
            <p className="text-sm text-gray-500">No hay materiales añadidos</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VariantsTab;
