import { NextResponse } from "next/server";

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

const mockProductDiscounts: ProductDiscount[] = [
  {
    id: "1",
    productId: "1",
    discountPercentage: 15,
    startDate: "2025-03-01",
    endDate: "2025-03-8",
  },
  {
    id: "2",
    productId: "5",
    discountPercentage: 10,
    startDate: "2025-03-05",
    endDate: "2025-03-23",
  },
];

const mockCategoryDiscounts: CategoryDiscount[] = [
  {
    id: "1",
    categoryId: "1",
    discountPercentage: 20,
    startDate: "2025-03-01",
    endDate: "2025-03-31",
  },
  {
    id: "2",
    categoryId: "4",
    discountPercentage: 25,
    startDate: "2025-03-01",
    endDate: "2025-03-8",
  },
];

export async function GET() {
  return NextResponse.json({
    categories: mockCategoryDiscounts,
    products: mockProductDiscounts,
  });
}
