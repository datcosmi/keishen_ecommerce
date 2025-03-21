"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, SlidersHorizontal, Tag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import NavbarWhite from "@/components/navbarWhite";
import Footer from "@/components/footer";

// Importamos componentes de shadcn UI
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

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
  categoryId: string;
  addedDate: string;
  // Added properties for discount handling
  discountedPrice?: number;
  discountPercentage?: number;
  isDiscounted?: boolean;
}

interface ProductDiscount {
  id: string;
  productId: string;
  discountPercentage: number;
  startDate: string;
  endDate: string;
}

interface CategoryDiscount {
  id: string;
  categoryId: string;
  discountPercentage: number;
  startDate: string;
  endDate: string;
}

interface Discounts {
  products: ProductDiscount[];
  categories: CategoryDiscount[];
}

interface FilterCategoryProps {
  title: string;
  children: React.ReactNode;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [discounts, setDiscounts] = useState<Discounts | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch products and discounts in parallel
        const [productsResponse, discountsResponse] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/discounts"),
        ]);

        const productsData = await productsResponse.json();
        const discountsData = await discountsResponse.json();

        setDiscounts(discountsData);

        // Apply discounts to products
        const productsWithDiscounts = applyDiscounts(
          productsData,
          discountsData
        );
        setProducts(productsWithDiscounts);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Function to apply discounts to products
  const applyDiscounts = (
    products: Product[],
    discounts: Discounts
  ): Product[] => {
    const currentDate = new Date();

    return products.map((product) => {
      // Check for product-specific discount
      const productDiscount = discounts.products.find(
        (d) =>
          d.productId === product.id &&
          new Date(d.startDate) <= currentDate &&
          new Date(d.endDate) >= currentDate
      );

      // Check for category-specific discount
      const categoryDiscount = discounts.categories.find(
        (d) =>
          d.categoryId === product.categoryId &&
          new Date(d.startDate) <= currentDate &&
          new Date(d.endDate) >= currentDate
      );

      // Use the highest discount (product-specific or category-specific)
      let appliedDiscount = 0;
      if (productDiscount && categoryDiscount) {
        appliedDiscount = Math.max(
          productDiscount.discountPercentage,
          categoryDiscount.discountPercentage
        );
      } else if (productDiscount) {
        appliedDiscount = productDiscount.discountPercentage;
      } else if (categoryDiscount) {
        appliedDiscount = categoryDiscount.discountPercentage;
      }

      if (appliedDiscount > 0) {
        const discountedPrice = product.price * (1 - appliedDiscount / 100);
        return {
          ...product,
          discountedPrice: Math.round(discountedPrice * 100) / 100,
          discountPercentage: appliedDiscount,
          isDiscounted: true,
        };
      }

      return { ...product, isDiscounted: false };
    });
  };

  const [filters, setFilters] = useState({
    showFilters: true,
    categories: {
      relojes: true,
      ropa: false,
      accesorios: false,
      calzado: false,
    },
    price: {
      low: false,
      medium: false,
      high: false,
    },
    inStock: false,
    onSale: false, // New filter for discounted items
  });

  const [showCollectionFilter, setShowCollectionFilter] = useState(true);
  const [showPriceFilter, setShowPriceFilter] = useState(true);

  const formatPrice = (price: number) => {
    return `$${price.toLocaleString("es-MX")}`;
  };

  // Function to filter products
  const filteredProducts = products.filter((product) => {
    // Stock filter
    if (filters.inStock && !product.inStock) {
      return false;
    }

    // On sale filter
    if (filters.onSale && !product.isDiscounted) {
      return false;
    }

    return true;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-asc":
        return (a.discountedPrice || a.price) - (b.discountedPrice || b.price);
      case "price-desc":
        return (b.discountedPrice || b.price) - (a.discountedPrice || a.price);
      case "discount":
        // Sort by discount percentage (highest first)
        return (b.discountPercentage || 0) - (a.discountPercentage || 0);
      case "bestsellers":
        return b.reviews - a.reviews;
      case "newest":
      default:
        return 0; // Assuming they're already sorted by newest
    }
  });

  // Filter category component
  const FilterCategory: React.FC<FilterCategoryProps> = ({
    title,
    children,
  }) => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">{title}</h3>
      {children}
    </div>
  );

  // Loading skeleton component
  const ProductSkeleton = () => (
    <Card>
      <CardContent className="p-0">
        <div className="aspect-square relative">
          <Skeleton className="h-full w-full rounded-t-lg" />
        </div>
        <div className="p-4 space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-6 w-1/4 mt-2" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-white">
      <NavbarWhite />
      <div className="max-w-8xl mx-auto px-2 sm:px-4 lg:px-6 py-8">
        <div className="flex justify-between items-center mb-8 px-2">
          <h1 className="text-2xl font-semibold">
            Artículos para Hombre ({sortedProducts.length})
          </h1>

          <div className="flex items-center gap-4">
            {/* Mobile filters */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  className="lg:hidden flex items-center gap-2"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Filtros
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                <div className="h-full py-4 overflow-y-auto">
                  <h2 className="text-xl font-semibold mb-6">Filtros</h2>
                  <div className="space-y-8">
                    <FilterCategory title="Categorías">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="relojes"
                            checked={filters.categories.relojes}
                            onCheckedChange={(checked) =>
                              setFilters((prev) => ({
                                ...prev,
                                categories: {
                                  ...prev.categories,
                                  relojes: !!checked,
                                },
                              }))
                            }
                          />
                          <label htmlFor="relojes" className="text-gray-700">
                            Relojes
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="ropa"
                            checked={filters.categories.ropa}
                            onCheckedChange={(checked) =>
                              setFilters((prev) => ({
                                ...prev,
                                categories: {
                                  ...prev.categories,
                                  ropa: !!checked,
                                },
                              }))
                            }
                          />
                          <label htmlFor="ropa" className="text-gray-700">
                            Ropa
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="accesorios"
                            checked={filters.categories.accesorios}
                            onCheckedChange={(checked) =>
                              setFilters((prev) => ({
                                ...prev,
                                categories: {
                                  ...prev.categories,
                                  accesorios: !!checked,
                                },
                              }))
                            }
                          />
                          <label htmlFor="accesorios" className="text-gray-700">
                            Accesorios
                          </label>
                        </div>
                      </div>
                    </FilterCategory>

                    <Separator />

                    <FilterCategory title="Precio">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="price-low"
                            checked={filters.price.low}
                            onCheckedChange={(checked) =>
                              setFilters((prev) => ({
                                ...prev,
                                price: { ...prev.price, low: !!checked },
                              }))
                            }
                          />
                          <label htmlFor="price-low" className="text-gray-700">
                            $0 - $1,000
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="price-medium"
                            checked={filters.price.medium}
                            onCheckedChange={(checked) =>
                              setFilters((prev) => ({
                                ...prev,
                                price: { ...prev.price, medium: !!checked },
                              }))
                            }
                          />
                          <label
                            htmlFor="price-medium"
                            className="text-gray-700"
                          >
                            $1,000 - $3,000
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="price-high"
                            checked={filters.price.high}
                            onCheckedChange={(checked) =>
                              setFilters((prev) => ({
                                ...prev,
                                price: { ...prev.price, high: !!checked },
                              }))
                            }
                          />
                          <label htmlFor="price-high" className="text-gray-700">
                            $3,000+
                          </label>
                        </div>
                      </div>
                    </FilterCategory>

                    <Separator />

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="inStock-mobile"
                        checked={filters.inStock}
                        onCheckedChange={(checked) =>
                          setFilters((prev) => ({
                            ...prev,
                            inStock: !!checked,
                          }))
                        }
                      />
                      <label htmlFor="inStock-mobile" className="text-gray-700">
                        Solo productos en existencia
                      </label>
                    </div>

                    {/* New filter for discounted items - mobile */}
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="onSale-mobile"
                        checked={filters.onSale}
                        onCheckedChange={(checked) =>
                          setFilters((prev) => ({
                            ...prev,
                            onSale: !!checked,
                          }))
                        }
                      />
                      <label htmlFor="onSale-mobile" className="text-gray-700">
                        Solo productos en oferta
                      </label>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* Desktop filter toggle button */}
            <Button
              variant="outline"
              className="hidden lg:flex items-center gap-2"
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  showFilters: !prev.showFilters,
                }))
              }
            >
              <SlidersHorizontal className="h-4 w-4" />
              {filters.showFilters ? "Ocultar filtros" : "Mostrar filtros"}
            </Button>

            {/* Sort selector */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Lo más nuevo</SelectItem>
                <SelectItem value="price-asc">Precio: menor a mayor</SelectItem>
                <SelectItem value="price-desc">
                  Precio: mayor a menor
                </SelectItem>
                <SelectItem value="bestsellers">Más vendidos</SelectItem>
                <SelectItem value="discount">Mayor descuento</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Desktop filters */}
          {filters.showFilters && (
            <div className="w-64 flex-shrink-0 hidden lg:block">
              <div className="pr-4">
                <div className="space-y-8">
                  <FilterCategory title="Categorías">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="relojes-desktop"
                          checked={filters.categories.relojes}
                          onCheckedChange={(checked) =>
                            setFilters((prev) => ({
                              ...prev,
                              categories: {
                                ...prev.categories,
                                relojes: !!checked,
                              },
                            }))
                          }
                        />
                        <label
                          htmlFor="relojes-desktop"
                          className="text-gray-700"
                        >
                          Relojes
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="ropa-desktop"
                          checked={filters.categories.ropa}
                          onCheckedChange={(checked) =>
                            setFilters((prev) => ({
                              ...prev,
                              categories: {
                                ...prev.categories,
                                ropa: !!checked,
                              },
                            }))
                          }
                        />
                        <label htmlFor="ropa-desktop" className="text-gray-700">
                          Ropa
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="accesorios-desktop"
                          checked={filters.categories.accesorios}
                          onCheckedChange={(checked) =>
                            setFilters((prev) => ({
                              ...prev,
                              categories: {
                                ...prev.categories,
                                accesorios: !!checked,
                              },
                            }))
                          }
                        />
                        <label
                          htmlFor="accesorios-desktop"
                          className="text-gray-700"
                        >
                          Accesorios
                        </label>
                      </div>
                    </div>
                  </FilterCategory>

                  <Separator />

                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">Precio</h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowPriceFilter(!showPriceFilter)}
                      >
                        {showPriceFilter ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {showPriceFilter && (
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="price-low-desktop"
                            checked={filters.price.low}
                            onCheckedChange={(checked) =>
                              setFilters((prev) => ({
                                ...prev,
                                price: { ...prev.price, low: !!checked },
                              }))
                            }
                          />
                          <label
                            htmlFor="price-low-desktop"
                            className="text-gray-700"
                          >
                            $0 - $1,000
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="price-medium-desktop"
                            checked={filters.price.medium}
                            onCheckedChange={(checked) =>
                              setFilters((prev) => ({
                                ...prev,
                                price: { ...prev.price, medium: !!checked },
                              }))
                            }
                          />
                          <label
                            htmlFor="price-medium-desktop"
                            className="text-gray-700"
                          >
                            $1,000 - $3,000
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="price-high-desktop"
                            checked={filters.price.high}
                            onCheckedChange={(checked) =>
                              setFilters((prev) => ({
                                ...prev,
                                price: { ...prev.price, high: !!checked },
                              }))
                            }
                          />
                          <label
                            htmlFor="price-high-desktop"
                            className="text-gray-700"
                          >
                            $3,000+
                          </label>
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="inStock-desktop"
                      checked={filters.inStock}
                      onCheckedChange={(checked) =>
                        setFilters((prev) => ({
                          ...prev,
                          inStock: !!checked,
                        }))
                      }
                    />
                    <label htmlFor="inStock-desktop" className="text-gray-700">
                      Solo productos en existencia
                    </label>
                  </div>

                  {/* New filter for discounted items - desktop */}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="onSale-desktop"
                      checked={filters.onSale}
                      onCheckedChange={(checked) =>
                        setFilters((prev) => ({
                          ...prev,
                          onSale: !!checked,
                        }))
                      }
                    />
                    <label htmlFor="onSale-desktop" className="text-gray-700">
                      Solo productos en oferta
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Product grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <ProductSkeleton key={i} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {sortedProducts.map((product) => (
                  <Link
                    key={product.id}
                    href={`/producto/${product.id}`}
                    className="block"
                  >
                    <Card className="overflow-hidden h-full transition-all duration-300 hover:shadow-md">
                      <CardContent className="p-0">
                        <div className="relative aspect-square bg-gray-100">
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover p-6 transition-transform duration-300 group-hover:scale-105"
                          />
                          {/* Badges overlay */}
                          <div className="absolute top-2 left-2 flex flex-col gap-2">
                            {/* Discount badge */}
                            {product.isDiscounted && (
                              <Badge
                                variant="destructive"
                                className="bg-red-600 text-white px-2 py-1 flex items-center gap-1"
                              >
                                <Tag size={14} />
                                {product.discountPercentage}% OFF
                              </Badge>
                            )}
                          </div>
                          {/* Out of stock overlay */}
                          {!product.inStock && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <Badge
                                variant="destructive"
                                className="text-sm px-3 py-1"
                              >
                                Agotado
                              </Badge>
                            </div>
                          )}
                        </div>
                        <div className="p-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-sm text-gray-600 mb-1">
                                {product.brand}
                              </p>
                              <h3 className="text-base font-semibold">
                                {product.name}
                              </h3>
                            </div>
                            <div className="text-right">
                              {product.isDiscounted ? (
                                <>
                                  <span className="text-base font-bold">
                                    {formatPrice(product.discountedPrice!)}
                                  </span>
                                  <p className="text-xs text-gray-500 line-through">
                                    {formatPrice(product.price)}
                                  </p>
                                </>
                              ) : (
                                <span className="text-base font-bold">
                                  {formatPrice(product.price)}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="mt-2 flex items-center justify-between">
                            <p className="text-xs text-gray-500">
                              {product.colors.length}{" "}
                              {product.colors.length === 1
                                ? "color"
                                : "colores"}
                            </p>
                            <div className="flex gap-1">
                              {product.colors
                                .slice(0, 3)
                                .map((color, index) => (
                                  <div
                                    key={index}
                                    className="h-3 w-3 rounded-full border border-gray-300"
                                    style={{ backgroundColor: color }}
                                  />
                                ))}
                              {product.colors.length > 3 && (
                                <div className="text-xs text-gray-500">
                                  +{product.colors.length - 3}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}

            {!loading && sortedProducts.length === 0 && (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium mb-2">
                  No se encontraron productos
                </h3>
                <p className="text-gray-500">
                  Intenta cambiar los filtros para ver más resultados.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
