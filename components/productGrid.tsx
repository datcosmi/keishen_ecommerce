import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import Link from "next/link";
import { Tag } from "lucide-react";

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

interface ProductGridProps {
  products: DisplayProduct[];
  loading: boolean;
  apiBaseUrl?: string;
}

export default function ProductGrid({
  products,
  loading,
  apiBaseUrl,
}: ProductGridProps) {
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

  // Format price
  const formatPrice = (price: number) => {
    return `$${price.toLocaleString("es-MX")}`;
  };

  // Count total variables for a product
  const countVariables = (product: DisplayProduct) => {
    return Object.keys(product.variables).length;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <ProductSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium mb-2">
          No se encontraron productos
        </h3>
        <p className="text-gray-500">
          Intenta cambiar los filtros para ver más resultados.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product) => (
        <Link
          key={product.id}
          href={`/productos/${product.id}`}
          className="block"
        >
          <Card className="overflow-hidden h-full transition-all duration-300 hover:shadow-md transform hover:scale-105">
            <CardContent className="p-0">
              <div className="relative aspect-square bg-gray-100">
                <Image
                  src={
                    product.image === "/images/placeholder.png"
                      ? product.image
                      : `${apiBaseUrl}${product.image}`
                  }
                  alt={product.name}
                  fill
                  priority
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
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
                    <Badge variant="destructive" className="text-sm px-3 py-1">
                      Agotado
                    </Badge>
                  </div>
                )}
              </div>
              <div className="p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      {product.category}
                    </p>
                    <h3 className="text-base font-semibold">{product.name}</h3>
                  </div>
                  <div className="text-right">
                    {product.isDiscounted ? (
                      <>
                        <span className="text-base font-bold">
                          {formatPrice(product.price)}
                        </span>
                        <p className="text-xs text-gray-500 line-through">
                          {formatPrice(product.originalPrice!)}
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
                    {countVariables(product)}{" "}
                    {countVariables(product) === 1 ? "variable" : "variables"}
                  </p>
                  <div className="flex gap-1">
                    {Object.keys(product.variables)
                      .slice(0, 3)
                      .map((varName, index) => (
                        <div
                          key={index}
                          className="h-4 w-4 rounded-full flex items-center justify-center bg-gray-100 text-xs"
                          title={varName}
                        >
                          {varName.charAt(0).toUpperCase()}
                        </div>
                      ))}
                    {Object.keys(product.variables).length > 3 && (
                      <div className="text-xs text-gray-500">
                        +{Object.keys(product.variables).length - 3}
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
  );
}
