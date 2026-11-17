import type { Category, PackageType, Product } from "../domain/types";

export interface CsvImportResult {
  products: Product[];
  warnings: string[];
}

function parseRows(input: string): string[][] {
  const firstLine = input.replace(/^\uFEFF/, "").split(/\r?\n/, 1)[0] ?? "";
  const delimiter = (firstLine.match(/;/g)?.length ?? 0) >= (firstLine.match(/,/g)?.length ?? 0) ? ";" : ",";
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    if (char === '"') {
      if (quoted && input[i + 1] === '"') {
        cell += '"';
        i += 1;
      } else {
        quoted = !quoted;
      }
    } else if (!quoted && char === delimiter) {
      row.push(cell.trim());
      cell = "";
    } else if (!quoted && (char === "\n" || char === "\r")) {
      if (char === "\r" && input[i + 1] === "\n") i += 1;
      row.push(cell.trim());
      if (row.some((value) => value.length > 0)) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  row.push(cell.trim());
  if (row.some((value) => value.length > 0)) rows.push(row);
  if (quoted) throw new Error("CSV-filen innehåller ett citattecken som aldrig avslutas.");
  return rows;
}

function numberValue(value: string | undefined, label: string, rowNumber: number): number {
  if (value === undefined || value.trim() === "") {
    throw new Error(`Rad ${rowNumber}: saknar ${label}.`);
  }
  const normalized = value.trim().replace(/\s/g, "").replace(",", ".");
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) throw new Error(`Rad ${rowNumber}: ${label} är inte ett giltigt tal.`);
  return parsed;
}

function categoryValue(value: string, rowNumber: number): Category {
  const normalized = value.trim().toLocaleLowerCase("sv-SE");
  if (["beer", "öl", "ol", "öl och cider"].includes(normalized)) return "beer";
  if (["cider", "cider och blanddryck", "blanddryck"].includes(normalized)) return "cider";
  if (["wine", "vin"].includes(normalized)) return "wine";
  if (["other", "annat", "sprit", "alkoholfritt"].includes(normalized)) return "other";
  throw new Error(`Rad ${rowNumber}: okänd kategori "${value}". Använd beer, cider, wine eller other.`);
}

function packageValue(value: string, volumeMl: number, rowNumber: number): PackageType {
  const normalized = value.trim().toLocaleLowerCase("sv-SE");
  if (["can33", "33 cl", "burk 33 cl", "burk 330 ml"].includes(normalized)) return "can33";
  if (["can50", "50 cl", "burk 50 cl", "burk 500 ml"].includes(normalized)) return "can50";
  if (["bottle", "flaska"].includes(normalized)) return "bottle";
  if (["other", "annat"].includes(normalized)) return "other";
  if (!normalized) {
    if (volumeMl === 330) return "can33";
    if (volumeMl === 500) return "can50";
    return "other";
  }
  throw new Error(`Rad ${rowNumber}: okänd packageType "${value}".`);
}

export function parseProductCsv(input: string): CsvImportResult {
  const rows = parseRows(input);
  if (rows.length < 2) throw new Error("CSV-filen behöver en rubrikrad och minst en produktrad.");

  const headers = rows[0].map((header) => header.trim().toLocaleLowerCase("sv-SE"));
  const index = (names: string[]) => headers.findIndex((header) => names.includes(header));
  const columns = {
    id: index(["id", "productid", "artikelnummer", "productnumber"]),
    name: index(["name", "namn", "productname"]),
    category: index(["category", "kategori"]),
    packageType: index(["packagetype", "förpackning", "forpackning"]),
    volumeMl: index(["volumeml", "volymml", "volym (ml)"]),
    alcoholPercent: index(["alcoholpercent", "alkoholhalt", "alkoholhalt (%)", "alkoholprocent"]),
    priceSek: index(["pricesek", "pris", "pris (kr)"]),
    depositSek: index(["depositsek", "pant", "pant (kr)"]),
    description: index(["description", "beskrivning"])
  };

  const required = ["id", "name", "category", "volumeMl", "alcoholPercent", "priceSek", "depositSek"] as const;
  const missing = required.filter((key) => columns[key] < 0);
  if (missing.length) {
    throw new Error(`CSV saknar obligatoriska kolumner: ${missing.join(", ")}. Hämta importmallen och följ rubrikerna.`);
  }

  const seen = new Set<string>();
  const products: Product[] = [];
  for (let i = 1; i < rows.length; i += 1) {
    const row = rows[i];
    const rowNumber = i + 1;
    const get = (key: keyof typeof columns) => columns[key] < 0 ? "" : (row[columns[key]] ?? "");
    const id = get("id").trim();
    const name = get("name").trim();
    if (!id || !name) throw new Error(`Rad ${rowNumber}: artikelnummer och namn måste finnas.`);
    if (seen.has(id)) throw new Error(`Rad ${rowNumber}: dubbelt artikelnummer "${id}".`);
    seen.add(id);

    const volumeMl = numberValue(get("volumeMl"), "volymMl", rowNumber);
    const alcoholPercent = numberValue(get("alcoholPercent"), "alkoholhalt", rowNumber);
    const priceSek = numberValue(get("priceSek"), "pris", rowNumber);
    const depositSek = numberValue(get("depositSek"), "pant", rowNumber);
    if (!Number.isSafeInteger(volumeMl) || volumeMl <= 0) throw new Error(`Rad ${rowNumber}: volym måste vara positiva heltal i ml.`);
    if (alcoholPercent < 0 || alcoholPercent > 100) throw new Error(`Rad ${rowNumber}: alkoholhalt måste vara mellan 0 och 100 procent.`);
    if (priceSek < 0 || depositSek < 0) throw new Error(`Rad ${rowNumber}: pris och pant får inte vara negativa.`);

    products.push({
      id,
      name,
      category: categoryValue(get("category"), rowNumber),
      packageType: packageValue(get("packageType"), volumeMl, rowNumber),
      volumeMl,
      alcoholPercent,
      priceCents: Math.round(priceSek * 100),
      depositCents: Math.round(depositSek * 100),
      description: get("description")
    });
  }

  if (!products.length) throw new Error("CSV-filen innehåller inga produkter.");
  return { products, warnings: [] };
}
