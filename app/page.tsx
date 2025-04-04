"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import NavbarBlack from "@/components/navbarBlack";
import { ChevronRight, Tag } from "lucide-react";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import HeroSection from "@/components/heroSection";
import ProductsSection from "@/components/productsSection";
import { ProductData } from "@/types/productTypes";
import { Category } from "@/types/categoryTypes";
import { DisplayProduct } from "@/types/productTypes";
import CategoriesShowcaseSection from "@/components/categoriesShowcaseSection";

const API_BASE_URL = "http://localhost:3001/api";

export default function LandingPage() {
  const [allProducts, setAllProducts] = useState<DisplayProduct[]>([]);
  const [displayProducts, setDisplayProducts] = useState<DisplayProduct[]>([]);
  const [discountedProducts, setDiscountedProducts] = useState<
    DisplayProduct[]
  >([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [discountedCategories, setDiscountedCategories] = useState<
    { category: Category; discountPercentage: number }[]
  >([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [categoryProducts, setCategoryProducts] = useState<DisplayProduct[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  // Transform ProductData to DisplayProduct
  const mapProductData = (data: ProductData[]): DisplayProduct[] => {
    return data.map((product) => ({
      id: product.id_product,
      name: product.product_name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: product.category,
      details: product.product_details,
      images: product.product_images.map((img) => img.image_url),
      inStock: product.stock > 0,
      // Default image if none available
      image:
        product.product_images.length > 0
          ? product.product_images[0].image_url
          : "/uploads/placeholder.png",
    }));
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/products/full-details`);
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      const data = await response.json();
      const mappedProducts = mapProductData(data);
      setAllProducts(mappedProducts);
      console.log("Mapped Products:", mappedProducts);

      // Filter products in stock
      const inStockProducts = mappedProducts.filter(
        (product: DisplayProduct) => product.inStock
      );
      setDisplayProducts(inStockProducts);

      // Find and process discounted products
      processDiscountedProducts(mappedProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`);
      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Process products to find those with active discounts
  const processDiscountedProducts = (products: DisplayProduct[]) => {
    const now = new Date();
    const discounted: DisplayProduct[] = [];

    products.forEach((product) => {
      // Find original ProductData to access discount info
      const originalData = (allProducts as any).find(
        (p: any) => p.id_product === product.id || p.id === product.id
      );

      if (!originalData) return;

      // Check product discounts
      const productDiscount = originalData.discount_product?.find(
        (discount: any) => {
          const startDate = new Date(discount.start_date_discount);
          const endDate = new Date(discount.end_date_discount);
          return now >= startDate && now <= endDate;
        }
      );

      // Check category discounts
      const categoryDiscount = originalData.discount_category?.find(
        (discount: any) => {
          const startDate = new Date(discount.start_date_discount);
          const endDate = new Date(discount.end_date_discount);
          return now >= startDate && now <= endDate;
        }
      );

      // Apply the higher discount if both exist
      if (productDiscount || categoryDiscount) {
        const productDiscountValue = productDiscount?.percent_discount || 0;
        const categoryDiscountValue = categoryDiscount?.percent_discount || 0;

        // Use the higher discount
        if (productDiscountValue >= categoryDiscountValue) {
          discounted.push({
            ...product,
            originalPrice: product.price,
            price: product.price * (1 - productDiscountValue / 100),
            discountPercentage: productDiscountValue,
            endDate: productDiscount.end_date_discount,
          });
        } else {
          discounted.push({
            ...product,
            originalPrice: product.price,
            price: product.price * (1 - categoryDiscountValue / 100),
            discountPercentage: categoryDiscountValue,
            endDate: categoryDiscount.end_date_discount,
          });
        }
      }
    });

    setDiscountedProducts(discounted);
  };

  // Fetch products and categories
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (categories.length > 0 && selectedCategory === null) {
      // Set the first category as selected by default when categories load
      setSelectedCategory(categories[0]?.id_cat || null);
    }
  }, [categories, selectedCategory]);

  // Process discounted categories
  useEffect(() => {
    if (categories.length > 0 && allProducts.length > 0) {
      const now = new Date();
      const discountedCats: {
        category: Category;
        discountPercentage: number;
      }[] = [];

      // For each category, find if it has an active discount
      categories.forEach((category) => {
        // Find a product in this category
        const productInCategory = allProducts.find(
          (p) =>
            (p as any).category_id === category.id_cat ||
            (p as any).category === category.name
        );

        if (!productInCategory) return;

        // Check if the original data has category discounts
        const originalData = (allProducts as any).find(
          (p: any) =>
            p.id_product === productInCategory.id ||
            p.id === productInCategory.id
        );

        if (!originalData || !originalData.discount_category) return;

        // Find active discount
        const activeDiscount = originalData.discount_category.find(
          (discount: any) => {
            const startDate = new Date(discount.start_date_discount);
            const endDate = new Date(discount.end_date_discount);
            return now >= startDate && now <= endDate;
          }
        );

        if (activeDiscount) {
          discountedCats.push({
            category,
            discountPercentage: activeDiscount.percent_discount,
          });
        }
      });

      setDiscountedCategories(discountedCats);
    }
  }, [categories, allProducts]);

  // Filter products by category
  useEffect(() => {
    if (selectedCategory && allProducts.length > 0) {
      // Filter products by the selected category
      const filteredProducts = allProducts.filter((product) => {
        const categoryId = (product as any).category_id || null;
        return (
          (categoryId === selectedCategory ||
            product.category ===
              categories.find((c) => c.id_cat === selectedCategory)?.name) &&
          product.inStock
        );
      });

      setCategoryProducts(filteredProducts);
    }
  }, [selectedCategory, allProducts, categories]);

  const formatPrice = (price: number) => {
    return `$${price.toLocaleString("es-MX")}`;
  };

  return (
    <div className="min-h-screen bg-black">
      <NavbarBlack />

      {/* Hero Section */}
      <HeroSection />

      {/* Brands Section */}
      <div className="py-8 bg-yellow-300 relative z-30">
        <div className="max-w-6xl mx-auto px-8">
          <div className="flex justify-between items-center">
            {["JOYERIA", "CAMISAS", "PANTALONES", "GORRAS", "OTROS"].map(
              (brand) => (
                <span key={brand} className="text-black font-bold text-xl">
                  {brand}
                </span>
              )
            )}
          </div>
        </div>
      </div>

      {/* Products Section */}
      <ProductsSection allProducts={displayProducts} />

      {/* Ending Soon Discounts */}
      <section className="py-16 px-8 bg-gray-100 relative z-30">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <div>
              <Badge variant="outline" className="bg-red-100 text-red-600 mb-3">
                <Tag className="h-4 w-4 mr-2" /> Ofertas por Terminar
              </Badge>
              <h2 className="text-3xl font-bold text-black">
                ¡APROVECHA ANTES DE QUE ACABEN!
              </h2>
            </div>
            <Button variant="outline" className="rounded-full" asChild>
              <Link href="/ofertas" className="flex items-center gap-2">
                <span>Ver todas las ofertas</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {discountedProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {discountedProducts
                .sort((a, b) => {
                  const dateA = new Date(a.endDate || "");
                  const dateB = new Date(b.endDate || "");
                  return dateA.getTime() - dateB.getTime();
                })
                .slice(0, 4)
                .map((product) => (
                  <Link
                    key={product.id}
                    href={`/productos/${product.id}`}
                    className="block"
                  >
                    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg relative h-full">
                      <CardContent className="p-0">
                        <div className="absolute top-4 right-4 z-10">
                          <Badge className="bg-red-600 text-white">
                            {product.discountPercentage}% OFF
                          </Badge>
                        </div>
                        <div className="relative aspect-square bg-gray-50">
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            priority
                            className="object-cover p-4 transition-transform duration-300 hover:scale-105"
                            sizes="(max-width: 768px) 100vw, 50vw"
                          />
                        </div>
                        <div className="p-4">
                          <p className="text-sm text-gray-600 mb-1">
                            {product.category}
                          </p>
                          <h3 className="text-lg font-semibold mb-2">
                            {product.name}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-red-600">
                              {formatPrice(product.price)}
                            </span>
                            <span className="text-sm text-gray-500 line-through">
                              {formatPrice(product.originalPrice || 0)}
                            </span>
                          </div>
                          {product.endDate && (
                            <p className="text-xs text-gray-500 mt-2">
                              Termina:{" "}
                              {new Date(product.endDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-lg shadow-sm">
              <h3 className="text-xl font-medium mb-2">
                No hay ofertas próximas a terminar
              </h3>
              <p className="text-gray-500 mb-4">
                Vuelve pronto para disfrutar de nuestros descuentos exclusivos.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Individual Product Discounts */}
      <section className="py-16 px-8 bg-gray-100 relative z-30">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <div>
              <Badge variant="outline" className="bg-red-100 text-red-600 mb-3">
                <Tag className="h-4 w-4 mr-2" /> Ofertas Especiales
              </Badge>
              <h2 className="text-3xl font-bold text-black">
                DESCUENTOS EXCLUSIVOS
              </h2>
            </div>
            <Button variant="outline" className="rounded-full" asChild>
              <Link href="/ofertas" className="flex items-center gap-2">
                <span>Ver todas las ofertas</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {discountedProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {discountedProducts
                .sort(
                  (a, b) =>
                    (b.discountPercentage || 0) - (a.discountPercentage || 0)
                )
                .slice(0, 4)
                .map((product) => (
                  <Link
                    key={product.id}
                    href={`/productos/${product.id}`}
                    className="block"
                  >
                    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg relative h-full">
                      <CardContent className="p-0">
                        <div className="absolute top-4 right-4 z-10">
                          <Badge className="bg-red-600 text-white">
                            {product.discountPercentage}% OFF
                          </Badge>
                        </div>
                        <div className="relative aspect-square bg-gray-50">
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            className="object-cover p-4 transition-transform duration-300 hover:scale-105"
                            sizes="(max-width: 768px) 100vw, 50vw"
                          />
                        </div>
                        <div className="p-4">
                          <p className="text-sm text-gray-600 mb-1">
                            {product.category}
                          </p>
                          <h3 className="text-lg font-semibold mb-2">
                            {product.name}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-red-600">
                              {formatPrice(product.price)}
                            </span>
                            <span className="text-sm text-gray-500 line-through">
                              {formatPrice(product.originalPrice || 0)}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-lg shadow-sm">
              <h3 className="text-xl font-medium mb-2">
                No hay ofertas disponibles
              </h3>
              <p className="text-gray-500 mb-4">
                Vuelve pronto para disfrutar de nuestros descuentos exclusivos.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Category Discounts */}
      <section className="py-16 px-8 bg-black text-white relative z-30">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <div>
              <Badge
                variant="outline"
                className="bg-yellow-300 text-black mb-3"
              >
                <Tag className="h-4 w-4 mr-2" /> Categorías en Promoción
              </Badge>
              <h2 className="text-3xl font-bold">AHORRA POR CATEGORÍA</h2>
            </div>
            <Button
              className="bg-yellow-300 text-black hover:bg-yellow-400 rounded-full"
              asChild
            >
              <Link href="/categorias" className="flex items-center gap-2">
                <span>Explorar categorías</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {discountedCategories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {discountedCategories.map(({ category, discountPercentage }) => (
                <Link
                  key={category.id_cat}
                  href={`/categoria/${category.id_cat}`}
                  className="block"
                >
                  <div className="group relative overflow-hidden rounded-lg bg-gray-900 aspect-[4/3]">
                    <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-70 z-10"></div>
                    <div className="absolute top-4 right-4 z-20">
                      <Badge className="bg-yellow-300 text-black font-bold">
                        {discountPercentage}% DESCUENTO
                      </Badge>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-8xl text-gray-500 opacity-20">
                        {category.name === "Camisas" && "👕"}
                        {category.name === "Pantalones" && "👖"}
                        {category.name === "Gorras" && "🧢"}
                        {category.name === "Joyeria" && "💍"}
                        {category.name === "Otros" && "🛍️"}
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 p-6 z-20">
                      <h3 className="text-2xl font-bold mb-2">
                        {category.name.toUpperCase()}
                      </h3>
                      <p className="text-gray-300 mb-4">
                        Todos los productos con {discountPercentage}% de
                        descuento
                      </p>
                      <span className="text-yellow-300 font-medium flex items-center group-hover:translate-x-2 transition-transform duration-300">
                        Explorar colección{" "}
                        <ChevronRight className="h-5 w-5 ml-1" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-900 rounded-lg">
              <h3 className="text-xl font-medium mb-2">
                No hay categorías en oferta
              </h3>
              <p className="text-gray-400 mb-4">
                Revisa más tarde para encontrar descuentos por categoría.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Categories Showcase */}
      <CategoriesShowcaseSection
        allProducts={displayProducts}
        categoriesData={categories}
      />

      <Footer />
    </div>
  );
}
