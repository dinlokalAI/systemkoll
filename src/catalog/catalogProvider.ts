import type { Product } from "../domain/types";

/**
 * A provider supplies normalized product data to the app.
 * Live providers must document source, retrieval time, terms and data freshness.
 * The first MVP deliberately uses demoProducts instead of pretending to have live data.
 */
export interface CatalogProvider {
  readonly id: string;
  readonly label: string;
  loadProducts(): Promise<Product[]>;
}
