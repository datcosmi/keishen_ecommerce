"use client";

import { useState, useEffect, Suspense } from "react";
import {
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";
import { ProductData } from "@/types/productTypes";
import { Category } from "@/types/categoryTypes";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const API_BASE_URL_IMAGE = process.env.NEXT_PUBLIC_IMAGES_URL;

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
  images: string[];
  details: {
    colors: Array<{ value: string; stock: number }>;
    sizes: Array<{ value: string; stock: number }>;
    materials: Array<{ value: string; stock: number }>;
    [key: string]: Array<{ value: string; stock: number }>;
  };
  isDiscounted: boolean;
}

interface FilterCategoryProps {
  title: string;
  children: React.ReactNode;
}

// New component for product card
interface ProductCardProps {
  product: DisplayProduct;
  apiBaseUrl: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, apiBaseUrl }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Format price with commas
  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Calculate days remaining for discount
  const getDaysRemaining = (endDateStr: string | undefined) => {
    if (!endDateStr) return 0;

    const endDate = new Date(endDateStr);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays : 0;
  };

  return (
    <Link href={`/productos/${product.id}`} className="block h-full">
      <Card
        className="group overflow-hidden transition-all duration-300 h-full flex flex-col border-0 rounded-lg shadow-sm hover:shadow-md"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative overflow-hidden">
          {product.isDiscounted && (
            <Badge className="absolute top-3 right-3 z-10 bg-red-600 text-white font-bold px-2 py-1">
              -{product.discountPercentage}%
            </Badge>
          )}

          {/* Image container - simplified to only show first image */}
          <div className="relative aspect-[3/4] bg-gray-100">
            <img
              src={`${API_BASE_URL_IMAGE}${product.images[0]}`}
              alt={product.name}
              className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
            />
          </div>

          {/* Hidden product details overlay (visible on hover) */}
          <div
            className={`absolute inset-0 bg-black/70 text-white p-4 flex flex-col transition-opacity duration-300 ${
              isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <h3 className="font-bold text-lg mb-2">{product.name}</h3>
            <p className="text-sm text-gray-200 mb-2 line-clamp-3">
              {product.description}
            </p>

            <div className="mt-auto space-y-3">
              {/* Colors section */}
              {product.details.colors && product.details.colors.length > 0 && (
                <div>
                  <p className="text-xs text-gray-300 mb-1">Colores:</p>
                  <div className="flex flex-wrap gap-1">
                    {product.details.colors.map((color, idx) => (
                      <TooltipProvider key={idx}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              style={{ backgroundColor: color.value }}
                              className="w-5 h-5 rounded-full border border-white cursor-pointer"
                            ></div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Stock: {color.stock}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                  </div>
                </div>
              )}

              {/* Sizes section */}
              {product.details.sizes && product.details.sizes.length > 0 && (
                <div>
                  <p className="text-xs text-gray-300 mb-1">Tallas:</p>
                  <div className="flex flex-wrap gap-1">
                    {product.details.sizes.map((size, idx) => (
                      <TooltipProvider key={idx}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-xs bg-white/20 px-2 py-1 rounded cursor-pointer">
                              {size.value}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Stock: {size.stock}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                  </div>
                </div>
              )}

              {/* Materials section */}
              {product.details.materials &&
                product.details.materials.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-300 mb-1">Materiales:</p>
                    <div className="flex flex-wrap gap-1">
                      {product.details.materials.map((material, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-white/20 px-2 py-1 rounded"
                        >
                          {material.value}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>

        {/* Product info */}
        <CardContent className="flex-grow flex flex-col p-4">
          <div className="flex-grow">
            <h3 className="font-medium text-gray-900 mb-1 truncate">
              {product.name}
            </h3>
            <p className="text-sm text-gray-500 mb-2 line-clamp-1">
              {product.category}
            </p>
          </div>

          <div className="flex justify-between items-end">
            <div>
              <div className="flex items-center gap-2">
                {product.isDiscounted ? (
                  <>
                    <span className="font-bold text-red-600">
                      ${formatPrice(product.price)}
                    </span>
                    <span className="text-sm text-gray-500 line-through">
                      ${formatPrice(product.originalPrice || 0)}
                    </span>
                  </>
                ) : (
                  <span className="font-bold text-gray-900">
                    ${formatPrice(product.price)}
                  </span>
                )}
              </div>

              {product.isDiscounted && product.endDate && (
                <p className="text-xs text-red-600 mt-1">
                  Termina en: {getDaysRemaining(product.endDate)} días
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

// Enhanced ProductGrid component with pagination
interface ProductGridProps {
  products: DisplayProduct[];
  loading: boolean;
  apiBaseUrl: string;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  loading,
  apiBaseUrl,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;

  // Calculate pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPages = Math.ceil(products.length / productsPerPage);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-64 w-full rounded-md" />
            <Skeleton className="h-4 w-3/4 rounded-md" />
            <Skeleton className="h-4 w-1/2 rounded-md" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium text-gray-700">
          No se encontraron productos
        </h3>
        <p className="text-gray-500 mt-2">
          Intenta con otros filtros o términos de búsqueda
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {currentProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            apiBaseUrl={apiBaseUrl}
          />
        ))}
      </div>

      {/* Pagination component */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => paginate(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
              className="px-3"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (number) => {
                // Show first, last, current, and pages around current
                if (
                  number === 1 ||
                  number === totalPages ||
                  (number >= currentPage - 1 && number <= currentPage + 1)
                ) {
                  return (
                    <Button
                      key={number}
                      variant={currentPage === number ? "default" : "outline"}
                      size="sm"
                      onClick={() => paginate(number)}
                      className="w-8 h-8"
                    >
                      {number}
                    </Button>
                  );
                } else if (
                  (number === currentPage - 2 && currentPage > 3) ||
                  (number === currentPage + 2 && currentPage < totalPages - 2)
                ) {
                  return (
                    <span key={number} className="px-2">
                      ...
                    </span>
                  );
                }
                return null;
              }
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => paginate(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

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
  const categoryParam = searchParams.get("category");

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
      // Process product details and organize by type
      const details: DisplayProduct["details"] = {
        colors: [],
        sizes: [],
        materials: [],
      };

      // Group and process product details
      product.product_details.forEach((detail) => {
        const detailName = detail.detail_name.toLowerCase();
        const detailValue = detail.detail_desc;
        const stock = detail.stock || 0;

        // Make sure these conditionals are working correctly
        if (detailName === "color") {
          details.colors.push({ value: detailValue, stock });
        } else if (detailName === "talla") {
          details.sizes.push({ value: detailValue, stock });
        } else if (detailName === "material") {
          details.materials.push({ value: detailValue, stock });
        } else {
          if (!details[detailName]) {
            details[detailName] = [];
          }
          details[detailName].push({ value: detailValue, stock });
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

      // Get all images or use a placeholder
      const imageUrls =
        product.product_images.length > 0
          ? product.product_images.map((img) => img.image_url)
          : ["/images/placeholder.png"];

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
        images: imageUrls,
        details,
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
          // If categoryParam exists and matches this category ID, set it to true
          const isSelected =
            categoryParam && categoryParam === category.id_cat.toString();
          acc[category.id_cat] = isSelected || false;
          return acc;
        },
        {} as Record<number, boolean>
      );

      setFilters((prev) => ({
        ...prev,
        categories: categoryFilters,
      }));
    }
  }, [categories, categoryParam]);

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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 px-2 gap-4">
          <h1 className="text-2xl font-semibold">
            {searchQuery
              ? `Resultados para "${searchQuery}" (${sortedProducts.length})`
              : `Artículos para Hombre (${sortedProducts.length})`}
          </h1>

          <div className="flex items-center gap-4 w-full sm:w-auto">
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
              <SelectTrigger className="w-full sm:w-[180px]">
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

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Desktop filters */}
          {filters.showFilters && (
            <div className="w-full lg:w-64 flex-shrink-0 hidden lg:block">
              <div className="sticky top-8 bg-white pr-4 rounded-lg border p-5 shadow-sm">
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
                        className="h-8 w-8"
                      >
                        {showCategoryFilter ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {showCategoryFilter && (
                      <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2">
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
                              className="text-gray-700 text-sm hover:text-black cursor-pointer"
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
                        className="h-8 w-8"
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
                            className="text-gray-700 text-sm hover:text-black cursor-pointer"
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
                            className="text-gray-700 text-sm hover:text-black cursor-pointer"
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
                            className="text-gray-700 text-sm hover:text-black cursor-pointer"
                          >
                            $3,000+
                          </label>
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-4">
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
                      <label
                        htmlFor="inStock-desktop"
                        className="text-gray-700 text-sm hover:text-black cursor-pointer"
                      >
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
                      <label
                        htmlFor="onSale-desktop"
                        className="text-gray-700 text-sm hover:text-black cursor-pointer"
                      >
                        Solo productos en oferta
                      </label>
                    </div>
                  </div>

                  {/* Clear filters button */}
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setFilters((prev) => ({
                        ...prev,
                        categories: Object.keys(prev.categories).reduce(
                          (acc, key) => {
                            acc[Number(key)] = false;
                            return acc;
                          },
                          {} as Record<number, boolean>
                        ),
                        price: {
                          low: false,
                          medium: false,
                          high: false,
                        },
                        inStock: false,
                        onSale: false,
                      }));
                    }}
                  >
                    Limpiar filtros
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Product grid */}
          <div className="flex-1">
            <ProductGrid
              products={sortedProducts}
              loading={loading}
              apiBaseUrl={API_BASE_URL || ""}
            />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
