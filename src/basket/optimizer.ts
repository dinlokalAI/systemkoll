import type { Basket, BasketLine, Preferences, Product } from "../domain/types";

type State = { lines: BasketLine[]; spend: number; packages: number; volume: number };

function unitCost(product: Product): number {
  return product.priceCents + product.depositCents;
}

function toBasket(state: State, budgetCents: number): Basket {
  const productTotalCents = state.lines.reduce((sum, line) => sum + line.product.priceCents * line.quantity, 0);
  const depositTotalCents = state.lines.reduce((sum, line) => sum + line.product.depositCents * line.quantity, 0);
  const checkoutTotalCents = productTotalCents + depositTotalCents;
  return {
    lines: state.lines,
    productTotalCents,
    depositTotalCents,
    checkoutTotalCents,
    remainingCents: budgetCents - checkoutTotalCents,
    packageCount: state.packages,
    totalVolumeMl: state.volume
  };
}

function betterCount(a: State, b: State): boolean {
  return a.packages > b.packages || (a.packages === b.packages && a.volume > b.volume);
}

function betterVolume(a: State, b: State): boolean {
  return a.volume > b.volume || (a.volume === b.volume && a.packages > b.packages);
}

/**
 * Deterministic unbounded basket calculation.
 * Deposit is included in the budget; product price and deposit remain separately visible.
 */
export function calculateBaskets(
  products: Product[],
  budgetCents: number,
  preferences: Preferences
): { mostPackages?: Basket; mostVolume?: Basket; lowestCheckout?: Basket } {
  if (!Number.isSafeInteger(budgetCents) || budgetCents < 0) {
    throw new Error("Budget must be a non-negative integer number of cents.");
  }

  const eligible = products.filter((product) =>
    preferences.categories.includes(product.category) &&
    preferences.packageTypes.includes(product.packageType) &&
    product.alcoholPercent >= preferences.minAlcoholPercent &&
    unitCost(product) > 0
  );

  const byCount = new Map<number, State>([[0, { lines: [], spend: 0, packages: 0, volume: 0 }]]);
  const byVolume = new Map<number, State>([[0, { lines: [], spend: 0, packages: 0, volume: 0 }]]);

  for (const product of eligible) {
    const cost = unitCost(product);
    const countSnapshot = [...byCount.values()];
    const volumeSnapshot = [...byVolume.values()];

    for (const state of countSnapshot) {
      const maxQuantity = Math.floor((budgetCents - state.spend) / cost);
      for (let quantity = 1; quantity <= maxQuantity; quantity += 1) {
        const spend = state.spend + cost * quantity;
        const candidate: State = {
          lines: [...state.lines, { product, quantity }],
          spend,
          packages: state.packages + quantity,
          volume: state.volume + product.volumeMl * quantity
        };
        const existing = byCount.get(spend);
        if (!existing || betterCount(candidate, existing)) byCount.set(spend, candidate);
      }
    }

    for (const state of volumeSnapshot) {
      const maxQuantity = Math.floor((budgetCents - state.spend) / cost);
      for (let quantity = 1; quantity <= maxQuantity; quantity += 1) {
        const spend = state.spend + cost * quantity;
        const candidate: State = {
          lines: [...state.lines, { product, quantity }],
          spend,
          packages: state.packages + quantity,
          volume: state.volume + product.volumeMl * quantity
        };
        const existing = byVolume.get(spend);
        if (!existing || betterVolume(candidate, existing)) byVolume.set(spend, candidate);
      }
    }
  }

  const nonEmptyCount = [...byCount.values()].filter((state) => state.packages > 0);
  const nonEmptyVolume = [...byVolume.values()].filter((state) => state.packages > 0);
  const mostPackages = nonEmptyCount.sort((a, b) =>
    b.packages - a.packages || b.volume - a.volume || a.spend - b.spend
  )[0];
  const mostVolume = nonEmptyVolume.sort((a, b) =>
    b.volume - a.volume || b.packages - a.packages || a.spend - b.spend
  )[0];
  const lowestCheckout = [...byCount.values()]
    .filter((state) => state.packages > 0)
    .sort((a, b) => a.spend - b.spend || b.packages - a.packages)[0];

  return {
    mostPackages: mostPackages ? toBasket(mostPackages, budgetCents) : undefined,
    mostVolume: mostVolume ? toBasket(mostVolume, budgetCents) : undefined,
    lowestCheckout: lowestCheckout ? toBasket(lowestCheckout, budgetCents) : undefined
  };
}
