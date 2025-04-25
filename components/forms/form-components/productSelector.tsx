import React, { useState, useRef, useEffect } from "react";
import { X, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Product, OrderDetail, ProductDetail } from "@/types/orderFormTypes";

interface ProductSelectorProps {
  products: Product[];
  onProductAdded: (detail: OrderDetail) => void;
}

const ProductSelector: React.FC<ProductSelectorProps> = ({
  products,
  onProductAdded,
}) => {
  const [productSearch, setProductSearch] = useState<string>("");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [showProductDropdown, setShowProductDropdown] =
    useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const productDropdownRef = useRef<HTMLDivElement | null>(null);

  // Current detail being added
  const [currentDetail, setCurrentDetail] = useState<OrderDetail>({
    prod_id: "",
    amount: 1,
    unit_price: 0,
    selected_details: [],
  });

  // Filter products based on search input
  useEffect(() => {
    if (productSearch) {
      const filtered = products.filter((product) => {
        const productName = product.product_name || product.name || "";
        return productName.toLowerCase().includes(productSearch.toLowerCase());
      });
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts([]);
    }
  }, [productSearch, products]);

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        productDropdownRef.current &&
        !productDropdownRef.current.contains(event.target as Node)
      ) {
        setShowProductDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Calculate the combined discount for a product
  const calculateCombinedDiscount = (product: Product): number => {
    const currentDate = new Date();
    let totalDiscount = 0;

    // Check product discounts
    if (product.discount_product && product.discount_product.length > 0) {
      product.discount_product.forEach((discount) => {
        const startDate = new Date(discount.start_date_discount);
        const endDate = new Date(discount.end_date_discount);

        if (currentDate >= startDate && currentDate <= endDate) {
          totalDiscount += discount.percent_discount;
        }
      });
    }

    // Check category discounts
    if (product.discount_category && product.discount_category.length > 0) {
      product.discount_category.forEach((discount) => {
        const startDate = new Date(discount.start_date_discount);
        const endDate = new Date(discount.end_date_discount);

        if (currentDate >= startDate && currentDate <= endDate) {
          totalDiscount += discount.percent_discount;
        }
      });
    }

    return totalDiscount;
  };

  // Handle product selection
  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setProductSearch(product.product_name || product.name || "");

    // Calculate discount
    const discount = calculateCombinedDiscount(product);

    // Calculate discounted price
    const originalPrice = product.price || 0;
    const discountedPrice =
      discount > 0 ? originalPrice * (1 - discount / 100) : originalPrice;

    setCurrentDetail({
      ...currentDetail,
      prod_id: product.id_product || product.id_prod || "",
      unit_price: discountedPrice,
      discount: discount > 0 ? discount : undefined,
      selected_details: [],
    });

    setShowProductDropdown(false);
  };

  // Handle variant selection
  const handleVariantSelect = (detailName: string, detailId: number) => {
    // First, find all details with the same detail_name
    const detailsWithSameName =
      selectedProduct?.product_details?.filter(
        (d) => d.detail_name === detailName
      ) || [];

    // Get IDs of those details
    const detailIdsWithSameName = detailsWithSameName.map((d) => d.detail_id);

    // Remove any previously selected detail with the same name
    const filteredDetails =
      currentDetail.selected_details?.filter(
        (id) => !detailIdsWithSameName.includes(id)
      ) || [];

    // Add the newly selected detail
    setCurrentDetail({
      ...currentDetail,
      selected_details: [...filteredDetails, detailId],
    });
  };

  // Add product to order
  const handleAddProduct = () => {
    if (
      !currentDetail.prod_id ||
      currentDetail.amount <= 0 ||
      !selectedProduct
    ) {
      return;
    }

    // If the product has variants but none are selected, show an error
    if (
      selectedProduct.product_details &&
      selectedProduct.product_details.length > 0 &&
      (!currentDetail.selected_details ||
        currentDetail.selected_details.length === 0)
    ) {
      toast.error("Por favor, selecciona las variantes del producto");
      return;
    }

    // Add product name to the detail
    const detailWithName = {
      ...currentDetail,
      productName:
        selectedProduct.product_name ||
        selectedProduct.name ||
        "Unknown Product",
    };

    // Pass the detail to parent component
    onProductAdded(detailWithName);

    // Reset current detail
    setCurrentDetail({
      prod_id: "",
      amount: 1,
      unit_price: 0,
      selected_details: [],
    });
    setSelectedProduct(null);
    setProductSearch("");
  };

  // Function to validate if a string is a valid hex color
  const isValidHexColor = (hex: string): boolean => {
    // Check if string starts with # and has either 4, 7, or 9 characters (for #RGB, #RRGGBB, or #RRGGBBAA)
    return /^#([0-9A-F]{3}){1,2}([0-9A-F]{2})?$/i.test(hex);
  };

  // Function to determine if a color is dark (to show white text) or light (to show black text)
  const isColorDark = (hexColor: string): boolean => {
    // Remove # if present
    const hex = hexColor.replace("#", "");

    // Convert to RGB
    let r = 0,
      g = 0,
      b = 0;
    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length >= 6) {
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    }

    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance < 0.5;
  };

  return (
    <div className="mt-4">
      <h3 className="text-lg font-medium mb-2">Agregar Productos</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Producto (Autocomplete) */}
        <div className="relative" ref={productDropdownRef}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Producto
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <Input
              type="text"
              className="pl-10"
              placeholder="Buscar producto..."
              value={productSearch}
              onChange={(e) => {
                setProductSearch(e.target.value);
                setShowProductDropdown(true);
              }}
              onFocus={() => setShowProductDropdown(true)}
            />
          </div>

          {selectedProduct &&
            selectedProduct.product_details &&
            selectedProduct.product_details.length > 0 && (
              <div className="mt-4 border rounded-md p-4 bg-gray-50">
                <h4 className="text-sm font-medium mb-2">
                  Variantes del Producto
                </h4>

                {/* Group details by detail_name */}
                {Object.entries(
                  selectedProduct.product_details.reduce(
                    (acc, detail) => {
                      if (!acc[detail.detail_name]) {
                        acc[detail.detail_name] = [];
                      }
                      acc[detail.detail_name].push(detail);
                      return acc;
                    },
                    {} as Record<string, ProductDetail[]>
                  )
                ).map(([detailName, details]) => (
                  <div key={detailName} className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {detailName}
                    </label>

                    {/* Special handling for Color detail_name */}
                    {detailName.toLowerCase() === "color" ? (
                      <div className="flex flex-wrap gap-2">
                        {details.map((detail) => {
                          const isValidColor = isValidHexColor(
                            detail.detail_desc
                          );
                          const isSelected =
                            currentDetail.selected_details?.includes(
                              detail.detail_id
                            );
                          const isDark =
                            isValidColor && isColorDark(detail.detail_desc);

                          return (
                            <div
                              key={detail.detail_id}
                              className="relative flex flex-col items-center"
                            >
                              <button
                                type="button"
                                style={{
                                  backgroundColor: isValidColor
                                    ? detail.detail_desc
                                    : "#e5e5e5",
                                  boxShadow: isSelected
                                    ? "0 0 0 2px black"
                                    : "none",
                                }}
                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                                  detail.stock === 0 ? "opacity-40" : ""
                                }`}
                                onClick={() =>
                                  handleVariantSelect(
                                    detailName,
                                    detail.detail_id
                                  )
                                }
                                disabled={detail.stock === 0}
                              >
                                {!isValidColor && (
                                  <span className="text-xs">
                                    {detail.detail_desc}
                                  </span>
                                )}
                              </button>
                              <span className="mt-1 text-xs text-center">
                                {detail.stock}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      // Regular details display
                      <div className="flex flex-wrap gap-2">
                        {details.map((detail) => (
                          <Button
                            key={detail.detail_id}
                            type="button"
                            variant={
                              currentDetail.selected_details?.includes(
                                detail.detail_id
                              )
                                ? "default"
                                : "outline"
                            }
                            className={
                              currentDetail.selected_details?.includes(
                                detail.detail_id
                              )
                                ? "bg-black hover:bg-gray-800"
                                : ""
                            }
                            onClick={() =>
                              handleVariantSelect(detailName, detail.detail_id)
                            }
                            disabled={detail.stock === 0}
                          >
                            {detail.detail_desc}
                            <span className="ml-1 text-xs">
                              ({detail.stock})
                            </span>
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

          {/* Dropdown de productos */}
          {showProductDropdown && filteredProducts.length > 0 && (
            <Card className="absolute z-10 w-full mt-1 max-h-48 overflow-auto">
              <CardContent className="p-0">
                <ul className="divide-y divide-gray-200">
                  {filteredProducts.map((product) => (
                    <li
                      key={(
                        product.id_product ||
                        product.id_prod ||
                        ""
                      ).toString()}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleProductSelect(product)}
                    >
                      <div className="flex justify-between">
                        <span>
                          {product.product_name || product.name || "Unknown"} -
                          ${product.price || 0}
                          {calculateCombinedDiscount(product) > 0 && (
                            <span className="ml-2 text-green-600">
                              (-{calculateCombinedDiscount(product)}%)
                            </span>
                          )}
                        </span>
                        <span
                          className={`text-sm ${
                            (product.stock || 0) > 5
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          Stock: {product.stock || 0}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Cantidad */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cantidad
          </label>
          <Input
            type="number"
            min="1"
            value={currentDetail.amount}
            onChange={(e) =>
              setCurrentDetail({
                ...currentDetail,
                amount: parseInt(e.target.value) || 1,
              })
            }
          />
        </div>

        {/* Precio Unitario (Automático) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Precio Unitario
          </label>
          <Input type="number" value={currentDetail.unit_price} disabled />
        </div>
      </div>

      <Button
        variant="outline"
        onClick={handleAddProduct}
        disabled={!selectedProduct}
      >
        <Plus className="mr-2 h-4 w-4" />
        Agregar Producto
      </Button>
    </div>
  );
};

export default ProductSelector;
