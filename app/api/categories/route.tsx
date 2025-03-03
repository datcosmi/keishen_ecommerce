import { NextResponse } from "next/server";

interface Categories {
  id: string;
  name: string;
}

const mockCategories: Categories[] = [
  { id: "1", name: "Camisas" },
  { id: "2", name: "Pantalones" },
  { id: "3", name: "Gorras" },
  { id: "4", name: "Joyeria" },
  { id: "5", name: "Otros" },
];

export async function GET() {
  return NextResponse.json(mockCategories);
}
