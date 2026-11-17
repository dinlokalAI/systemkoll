export type Category = "beer" | "cider" | "wine" | "other";
export type PackageType = "can33" | "can50" | "bottle" | "other";

export interface Product {
  id: string;
  name: string;
  category: Category;
  packageType: PackageType;
  volumeMl: number;
  alcoholPercent: number;
  priceCents: number;
  depositCents: number;
  imageUrl?: string;
  description: string;
}

export interface Preferences {
  categories: Category[];
  minAlcoholPercent: number;
  packageTypes: PackageType[];
}

export interface BasketLine {
  product: Product;
  quantity: number;
}

export interface Basket {
  lines: BasketLine[];
  productTotalCents: number;
  depositTotalCents: number;
  checkoutTotalCents: number;
  remainingCents: number;
  packageCount: number;
  totalVolumeMl: number;
}
