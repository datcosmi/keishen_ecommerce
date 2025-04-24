"use client";

import { useState, useEffect, Suspense } from "react";
import { ChevronDown, ChevronUp, SlidersHorizontal } from "lucide-react";
import { useSearchParams } from "next/navigation";
import NavbarWhite from "@/components/navbarWhite";
import Footer from "@/components/footer";

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
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import ProductGrid from "@/components/productGrid";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface ProductDiscount {
  id_discount: number;
  percent_discount: number;
  start_date_discount: string;
  end_date_discount: string;
}

interface CategoryDiscount {
  id_discount: number;
  percent_discount: number;
  start_date_discount: string;
  end_date_discount: string;
}

interface ProductDetail {
  detail_id: number;
  detail_name: string;
  detail_desc: string;
}

interface ProductImage {
  image_id: number;
  image_url: string;
}

interface ProductData {
  id_product: number;
  product_name: string;
  description: string;
  price: number;
  category_id: number;
  category: string;
  stock: number;
  is_deleted: boolean;
  product_details: ProductDetail[];
  product_images: ProductImage[];
  discount_product: ProductDiscount[];
  discount_category: CategoryDiscount[];
}

interface Category {
  id_cat: number;
  name: string;
}

interface DisplayProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  endDate?: string;
  categoryId: number;
  category: string;
  inStock: boolean;
  image: string;
  variables: { [key: string]: string[] };
  isDiscounted: boolean;
}

interface FilterCategoryProps {
  title: string;
  children: React.ReactNode;
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsPageLoading />}>
      <ProductsPageContent />
    </Suspense>
  );
}

function ProductsPageLoading() {
  return (
    <div className="min-h-screen bg-white">
      <NavbarWhite />
      <div className="max-w-8xl mx-auto px-2 sm:px-4 lg:px-6 py-8">
        <div className="flex justify-between items-center mb-8 px-2">
          <h1 className="text-2xl font-semibold">Cargando productos...</h1>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-64 w-full rounded-md" />
              <Skeleton className="h-4 w-3/4 rounded-md" />
              <Skeleton className="h-4 w-1/2 rounded-md" />
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}

function ProductsPageContent() {
  const [products, setProducts] = useState<DisplayProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("newest");

  // Search
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search") || "";

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // Fetch products and categories in parallel
        const [productsResponse, categoriesResponse] = await Promise.all([
          fetch(
            `${API_BASE_URL}/api/products/full-details${
              searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ""
            }`
          ),
          fetch(`${API_BASE_URL}/api/categories`),
        ]);

        const productsData: ProductData[] = await productsResponse.json();
        const categoriesData: Category[] = await categoriesResponse.json();

        setCategories(categoriesData);

        // Transform raw products to display products
        const transformedProducts = transformProducts(productsData);
        setProducts(transformedProducts);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [searchQuery]);

  // Function to transform raw product data to display format
  const transformProducts = (productsData: ProductData[]): DisplayProduct[] => {
    const currentDate = new Date();

    // Filter out deleted products
    const activeProducts = productsData.filter(
      (product) => !product.is_deleted
    );

    return activeProducts.map((product) => {
      // Group product details by detail_name
      const variables: { [key: string]: string[] } = {};
      product.product_details.forEach((detail) => {
        if (!variables[detail.detail_name]) {
          variables[detail.detail_name] = [];
        }
        if (!variables[detail.detail_name].includes(detail.detail_desc)) {
          variables[detail.detail_name].push(detail.detail_desc);
        }
      });

      // Check for product-specific discount
      const productDiscount = product.discount_product.find(
        (d) =>
          new Date(d.start_date_discount) <= currentDate &&
          new Date(d.end_date_discount) >= currentDate
      );

      // Check for category-specific discount
      const categoryDiscount = product.discount_category.find(
        (d) =>
          new Date(d.start_date_discount) <= currentDate &&
          new Date(d.end_date_discount) >= currentDate
      );

      // Use the highest discount (product-specific or category-specific)
      let appliedDiscount = 0;
      let discountEndDate = "";

      if (productDiscount && categoryDiscount) {
        if (
          productDiscount.percent_discount > categoryDiscount.percent_discount
        ) {
          appliedDiscount = productDiscount.percent_discount;
          discountEndDate = productDiscount.end_date_discount;
        } else {
          appliedDiscount = categoryDiscount.percent_discount;
          discountEndDate = categoryDiscount.end_date_discount;
        }
      } else if (productDiscount) {
        appliedDiscount = productDiscount.percent_discount;
        discountEndDate = productDiscount.end_date_discount;
      } else if (categoryDiscount) {
        appliedDiscount = categoryDiscount.percent_discount;
        discountEndDate = categoryDiscount.end_date_discount;
      }

      // Calculate discounted price if applicable
      let discountedPrice = product.price;
      let isDiscounted = false;

      if (appliedDiscount > 0) {
        discountedPrice = product.price * (1 - appliedDiscount / 100);
        isDiscounted = true;
      }

      // Get the first image or use a placeholder
      const imageUrl =
        product.product_images.length > 0
          ? product.product_images[0].image_url
          : "/images/placeholder.png";

      return {
        id: product.id_product,
        name: product.product_name,
        description: product.description,
        price: isDiscounted
          ? Math.round(discountedPrice * 100) / 100
          : product.price,
        originalPrice: isDiscounted ? product.price : undefined,
        discountPercentage: isDiscounted ? appliedDiscount : undefined,
        endDate: isDiscounted ? discountEndDate : undefined,
        categoryId: product.category_id,
        category: product.category,
        inStock: product.stock > 0,
        image: imageUrl,
        variables,
        isDiscounted,
      };
    });
  };

  const [filters, setFilters] = useState({
    showFilters: true,
    categories: {} as Record<number, boolean>,
    price: {
      low: false,
      medium: false,
      high: false,
    },
    inStock: false,
    onSale: false,
  });

  // Initialize category filters when categories are loaded
  useEffect(() => {
    if (categories.length > 0) {
      const categoryFilters = categories.reduce(
        (acc, category) => {
          acc[category.id_cat] = false;
          return acc;
        },
        {} as Record<number, boolean>
      );

      setFilters((prev) => ({
        ...prev,
        categories: categoryFilters,
      }));
    }
  }, [categories]);

  const [showPriceFilter, setShowPriceFilter] = useState(true);
  const [showCategoryFilter, setShowCategoryFilter] = useState(true);

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

    // Category filter
    const anyCategorySelected = Object.values(filters.categories).some(
      (v) => v
    );
    if (anyCategorySelected && !filters.categories[product.categoryId]) {
      return false;
    }

    // Price filter
    const anyPriceSelected =
      filters.price.low || filters.price.medium || filters.price.high;
    if (anyPriceSelected) {
      const effectivePrice = product.price; // Already calculated with discount

      if (filters.price.low && effectivePrice >= 0 && effectivePrice <= 1000) {
        return true;
      }
      if (
        filters.price.medium &&
        effectivePrice > 1000 &&
        effectivePrice <= 3000
      ) {
        return true;
      }
      if (filters.price.high && effectivePrice > 3000) {
        return true;
      }
      return false;
    }

    return true;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "discount":
        // Sort by discount percentage (highest first)
        return (b.discountPercentage || 0) - (a.discountPercentage || 0);
      case "bestsellers":
        // Since we don't have reviews count, fallback to newest
        return 0;
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

  return (
    <div className="min-h-screen bg-white">
      <NavbarWhite />
      <div className="max-w-8xl mx-auto px-2 sm:px-4 lg:px-6 py-8">
        <div className="flex justify-between items-center mb-8 px-2">
          <h1 className="text-2xl font-semibold">
            {searchQuery
              ? `Resultados para "${searchQuery}" (${sortedProducts.length})`
              : `Artículos para Hombre (${sortedProducts.length})`}
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
                        {categories.map((category) => (
                          <div
                            key={category.id_cat}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`category-${category.id_cat}-mobile`}
                              checked={filters.categories[category.id_cat]}
                              onCheckedChange={(checked) =>
                                setFilters((prev) => ({
                                  ...prev,
                                  categories: {
                                    ...prev.categories,
                                    [category.id_cat]: !!checked,
                                  },
                                }))
                              }
                            />
                            <label
                              htmlFor={`category-${category.id_cat}-mobile`}
                              className="text-gray-700"
                            >
                              {category.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </FilterCategory>

                    <Separator />

                    <FilterCategory title="Precio">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="price-low-mobile"
                            checked={filters.price.low}
                            onCheckedChange={(checked) =>
                              setFilters((prev) => ({
                                ...prev,
                                price: { ...prev.price, low: !!checked },
                              }))
                            }
                          />
                          <label
                            htmlFor="price-low-mobile"
                            className="text-gray-700"
                          >
                            $0 - $1,000
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="price-medium-mobile"
                            checked={filters.price.medium}
                            onCheckedChange={(checked) =>
                              setFilters((prev) => ({
                                ...prev,
                                price: { ...prev.price, medium: !!checked },
                              }))
                            }
                          />
                          <label
                            htmlFor="price-medium-mobile"
                            className="text-gray-700"
                          >
                            $1,000 - $3,000
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="price-high-mobile"
                            checked={filters.price.high}
                            onCheckedChange={(checked) =>
                              setFilters((prev) => ({
                                ...prev,
                                price: { ...prev.price, high: !!checked },
                              }))
                            }
                          />
                          <label
                            htmlFor="price-high-mobile"
                            className="text-gray-700"
                          >
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
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">Categorías</h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setShowCategoryFilter(!showCategoryFilter)
                        }
                      >
                        {showCategoryFilter ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {showCategoryFilter && (
                      <div className="space-y-3">
                        {categories.map((category) => (
                          <div
                            key={category.id_cat}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`category-${category.id_cat}-desktop`}
                              checked={filters.categories[category.id_cat]}
                              onCheckedChange={(checked) =>
                                setFilters((prev) => ({
                                  ...prev,
                                  categories: {
                                    ...prev.categories,
                                    [category.id_cat]: !!checked,
                                  },
                                }))
                              }
                            />
                            <label
                              htmlFor={`category-${category.id_cat}-desktop`}
                              className="text-gray-700"
                            >
                              {category.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

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
            <ProductGrid
              products={sortedProducts}
              loading={loading}
              apiBaseUrl={API_BASE_URL}
            />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
