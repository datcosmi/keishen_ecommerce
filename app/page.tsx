"use client";
import { useState, useEffect } from "react";
import NavbarBlack from "@/components/navbarBlack";
import Footer from "@/components/footer";
import HeroSection from "@/components/heroSection";
import ProductsSection from "@/components/productsSection";
import BestSellersSection from "@/components/bestSellersSection";
import { ProductData } from "@/types/productTypes";
import { Category } from "@/types/categoryTypes";
import PaymentMethodsSection from "@/components/paymentMethodsSection";
import FeaturedDiscountSection from "@/components/featuredDiscountSection";
import TopRatedSection from "@/components/topRatedSection";
import CategoriesShowcase from "@/components/categoriesShowcase";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function LandingPage() {
  const [allProducts, setAllProducts] = useState<ProductData[]>([]);
  const [displayProducts, setDisplayProducts] = useState<ProductData[]>([]);
  const [bestSellers, setBestSellers] = useState<ProductData[]>([]);
  const [topRatedProducts, setTopRatedProducts] = useState<ProductData[]>([]);
  const [highestDiscountProduct, setHighestDiscountProduct] =
    useState<ProductData | null>(null);
  const [discountedProducts, setDiscountedProducts] = useState<ProductData[]>(
    []
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [discountedCategories, setDiscountedCategories] = useState<
    { category: Category; discountPercentage: number }[]
  >([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [categoryProducts, setCategoryProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/full-details`);
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      const data: ProductData[] = await response.json();
      setAllProducts(data);

      // Filter products in stock
      const inStockProducts = data.filter((product) => product.stock > 0);
      setDisplayProducts(inStockProducts);

      // Find and process discounted products
      processDiscountedProducts(data);

      // Find the product with the highest discount
      const highestDiscountProduct =
        findHighestDiscountProduct(inStockProducts);
      setHighestDiscountProduct(highestDiscountProduct);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBestSellers = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/products/most-purchased`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch best sellers");
      }
      const data: ProductData[] = await response.json();

      // Filter products in stock
      const inStockProducts = data.filter((product) => product.stock > 0);
      setBestSellers(inStockProducts);
    } catch (error) {
      console.error("Error fetching best sellers:", error);
    }
  };

  const fetchTopRatedProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/top-rated`);
      if (!response.ok) {
        throw new Error("Failed to fetch top rated products");
      }
      const data: ProductData[] = await response.json();

      // Filter products in stock
      const inStockProducts = data.filter((product) => product.stock > 0);
      setTopRatedProducts(inStockProducts);
    } catch (error) {
      console.error("Error fetching top rated products:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/categories`);
      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const findHighestDiscountProduct = (products: ProductData[]) => {
    const now = new Date();
    let maxDiscountProduct: ProductData | null = null;
    let maxDiscountPercentage = 0;

    products.forEach((product) => {
      let highestDiscountForProduct = 0;

      // Check product-specific discounts
      if (product.discount_product && product.discount_product.length > 0) {
        product.discount_product.forEach((discount) => {
          const startDate = new Date(discount.start_date_discount);
          const endDate = new Date(discount.end_date_discount);

          if (
            now >= startDate &&
            now <= endDate &&
            discount.percent_discount > highestDiscountForProduct
          ) {
            highestDiscountForProduct = discount.percent_discount;
          }
        });
      }

      // Check category discounts
      if (product.discount_category && product.discount_category.length > 0) {
        product.discount_category.forEach((discount) => {
          const startDate = new Date(discount.start_date_discount);
          const endDate = new Date(discount.end_date_discount);

          if (
            now >= startDate &&
            now <= endDate &&
            discount.percent_discount > highestDiscountForProduct
          ) {
            highestDiscountForProduct = discount.percent_discount;
          }
        });
      }

      // Update max discount product if this one has a higher discount
      if (
        highestDiscountForProduct > maxDiscountPercentage &&
        product.stock > 0
      ) {
        maxDiscountPercentage = highestDiscountForProduct;
        maxDiscountProduct = product;
      }
    });

    return maxDiscountProduct;
  };

  // Process products to find those with active discounts
  const processDiscountedProducts = (products: ProductData[]) => {
    const now = new Date();
    const discounted: ProductData[] = [];

    products.forEach((product) => {
      // Check product discounts
      const productDiscount = product.discount_product?.find((discount) => {
        const startDate = new Date(discount.start_date_discount);
        const endDate = new Date(discount.end_date_discount);
        return now >= startDate && now <= endDate;
      });

      // Check category discounts
      const categoryDiscount = product.discount_category?.find((discount) => {
        const startDate = new Date(discount.start_date_discount);
        const endDate = new Date(discount.end_date_discount);
        return now >= startDate && now <= endDate;
      });

      // Apply the higher discount if either exists
      if (productDiscount || categoryDiscount) {
        const productDiscountValue = productDiscount?.percent_discount || 0;
        const categoryDiscountValue = categoryDiscount?.percent_discount || 0;

        // Create a copy of the product with discount information
        const discountedProduct = {
          ...product,
          // Add calculated fields that the UI needs
          calculatedDiscountPercentage: Math.max(
            productDiscountValue,
            categoryDiscountValue
          ),
          calculatedPrice:
            product.price *
            (1 - Math.max(productDiscountValue, categoryDiscountValue) / 100),
          endDateDiscount:
            productDiscountValue >= categoryDiscountValue
              ? productDiscount?.end_date_discount
              : categoryDiscount?.end_date_discount,
        };

        discounted.push(discountedProduct);
      }
    });

    setDiscountedProducts(discounted);
  };

  // Fetch products and categories
  useEffect(() => {
    fetchProducts();
    fetchBestSellers();
    fetchTopRatedProducts();
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
            p.category_id === category.id_cat || p.category === category.name
        );

        if (!productInCategory) return;

        // Check if the product has category discounts
        if (!productInCategory.discount_category) return;

        // Find active discount
        const activeDiscount = productInCategory.discount_category.find(
          (discount) => {
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
        return (
          (product.category_id === selectedCategory ||
            product.category ===
              categories.find((c) => c.id_cat === selectedCategory)?.name) &&
          product.stock > 0
        );
      });

      setCategoryProducts(filteredProducts);
    }
  }, [selectedCategory, allProducts, categories]);

  return (
    <div className="min-h-screen bg-black">
      <NavbarBlack />

      {/* Hero Section */}
      <HeroSection />

      {/* Value Propositions Section */}
      <div className="py-8 bg-yellow-300 relative z-30">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div className="flex flex-col items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="text-black font-bold text-sm md:text-lg">
                CALIDAD PREMIUM
              </span>
            </div>

            <div className="flex flex-col items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14h-1a2 2 0 00-2-2H9a2 2 0 00-2 2H6c-.265 0-.52.105-.707.293L4 17h5"
                />
              </svg>
              <span className="text-black font-bold text-sm md:text-lg">
                ATENCIÓN PERSONALIZADA
              </span>
            </div>

            <div className="flex flex-col items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
              <span className="text-black font-bold text-sm md:text-lg">
                PAGO SEGURO
              </span>
            </div>

            <div className="flex flex-col items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 10h16M4 14h16M4 18h16"
                />
              </svg>
              <span className="text-black font-bold text-sm md:text-lg">
                EXCLUSIVIDAD EN PRENDAS
              </span>
            </div>

            <div className="flex flex-col items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m2 7H7a2 2 0 01-2-2v-5a2 2 0 012-2h5"
                />
              </svg>
              <span className="text-black font-bold text-sm md:text-lg">
                AJUSTES DISPONIBLES
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Discounts Section */}
      {highestDiscountProduct && (
        <FeaturedDiscountSection product={highestDiscountProduct} />
      )}

      {/* Best Sellers Section */}
      <BestSellersSection bestSellers={bestSellers} />

      {/* Top Rated Products Section */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100">
        <TopRatedSection topRatedProducts={topRatedProducts} />
      </div>

      {/* Products Section */}
      <ProductsSection allProducts={displayProducts} />

      {/* Categories Showcase Section */}
      <CategoriesShowcase />

      {/* Payment Methods Section */}
      <PaymentMethodsSection />

      <Footer />
    </div>
  );
}
