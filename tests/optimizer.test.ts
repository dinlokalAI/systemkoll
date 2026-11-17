import { describe, expect, it } from "vitest";
import { calculateBaskets } from "../src/basket/optimizer";
import { demoProducts } from "../src/catalog/demoProducts";
import type { Preferences } from "../src/domain/types";

const preferences: Preferences = {
  categories: ["beer", "cider"],
  minAlcoholPercent: 0,
  packageTypes: ["can33", "can50"]
};

describe("calculateBaskets", () => {
  it("includes deposit in the budget and reports it separately", () => {
    const result = calculateBaskets(demoProducts, 5000, preferences);
    expect(result.mostPackages).toBeDefined();
    expect(result.mostPackages!.checkoutTotalCents).toBeLessThanOrEqual(5000);
    expect(
      result.mostPackages!.productTotalCents + result.mostPackages!.depositTotalCents
    ).toBe(result.mostPackages!.checkoutTotalCents);
  });

  it("applies category, package and minimum alcohol filters", () => {
    const result = calculateBaskets(demoProducts, 10000, {
      categories: ["cider"],
      minAlcoholPercent: 7,
      packageTypes: ["can50"]
    });
    expect(result.mostPackages).toBeDefined();
    expect(result.mostPackages!.lines.every((line) =>
      line.product.category === "cider" &&
      line.product.packageType === "can50" &&
      line.product.alcoholPercent >= 7
    )).toBe(true);
  });

  it("returns no basket when nothing matches", () => {
    const result = calculateBaskets(demoProducts, 100, {
      categories: ["wine"],
      minAlcoholPercent: 0,
      packageTypes: ["bottle"]
    });
    expect(result.mostPackages).toBeUndefined();
  });
});
