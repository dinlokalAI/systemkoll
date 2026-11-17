import { describe, expect, it } from "vitest";
import { parseProductCsv } from "../src/catalog/catalogCsv";

describe("parseProductCsv", () => {
  it("imports semicolon-separated Swedish decimals and pant", () => {
    const result = parseProductCsv(
      "\uFEFFid;name;category;packageType;volumeMl;alcoholPercent;priceSek;depositSek\n" +
      "123;Testöl;öl;50 cl;500;5,2;19,90;1,00"
    );
    expect(result.products).toHaveLength(1);
    expect(result.products[0]).toMatchObject({
      id: "123",
      category: "beer",
      packageType: "can50",
      volumeMl: 500,
      alcoholPercent: 5.2,
      priceCents: 1990,
      depositCents: 100
    });
  });

  it("requires an explicit deposit value rather than assuming zero", () => {
    expect(() => parseProductCsv(
      "id;name;category;volumeMl;alcoholPercent;priceSek\n123;Testöl;beer;500;5;19"
    )).toThrow(/depositSek/);
  });

  it("handles quoted semicolons in descriptions", () => {
    const result = parseProductCsv(
      "id;name;category;volumeMl;alcoholPercent;priceSek;depositSek;description\\n" +
      "123;Testöl;beer;500;5;19;1;\\"Malt; citrus\\""
    );
    expect(result.products[0].description).toBe("Malt; citrus");
  });

  it("rejects duplicate article identifiers", () => {
    expect(() => parseProductCsv(
      "id;name;category;volumeMl;alcoholPercent;priceSek;depositSek\n" +
      "123;A;beer;500;5;19;1\n123;B;beer;500;5;20;1"
    )).toThrow(/dubbelt artikelnummer/);
  });
});
