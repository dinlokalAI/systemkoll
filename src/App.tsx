import { useMemo, useState } from "react";
import { ArrowDownRight, Beer, Calculator, Check, CircleHelp, FileSpreadsheet, RotateCcw, ShoppingBasket, Upload, Wine } from "lucide-react";
import { demoProducts } from "./catalog/demoProducts";
import { parseProductCsv } from "./catalog/catalogCsv";
import { calculateBaskets } from "./basket/optimizer";
import type { Basket, Category, PackageType, Preferences, Product } from "./domain/types";

const categoryOptions: { id: Category; label: string }[] = [
  { id: "beer", label: "Öl" },
  { id: "cider", label: "Cider" },
  { id: "wine", label: "Vin" },
  { id: "other", label: "Annat" }
];

const packageOptions: { id: PackageType; label: string }[] = [
  { id: "can33", label: "33 cl" },
  { id: "can50", label: "50 cl" },
  { id: "bottle", label: "Flaska" },
  { id: "other", label: "Annat" }
];

const money = (cents: number) =>
  new Intl.NumberFormat("sv-SE", { style: "currency", currency: "SEK", maximumFractionDigits: 2 }).format(cents / 100);

function BasketResult({ title, hint, basket }: { title: string; hint: string; basket?: Basket }) {
  if (!basket) {
    return (
      <article className="result-card empty-result">
        <p className="eyebrow">{title}</p>
        <h3>Inget förslag hittades</h3>
        <p>Prova att höja budgeten eller lätta på något filter.</p>
      </article>
    );
  }

  return (
    <article className="result-card">
      <div className="result-heading">
        <div>
          <p className="eyebrow">{title}</p>
          <h3>{basket.packageCount} {basket.packageCount === 1 ? "förpackning" : "förpackningar"}</h3>
          <p className="result-hint">{hint}</p>
        </div>
        <div className="result-price">{money(basket.checkoutTotalCents)}</div>
      </div>
      <div className="basket-lines">
        {basket.lines.map(({ product, quantity }) => (
          <div className="basket-line" key={product.id}>
            <span className="line-quantity">{quantity} ×</span>
            <span className="line-name">{product.name}</span>
            <span className="line-price">{money((product.priceCents + product.depositCents) * quantity)}</span>
          </div>
        ))}
      </div>
      <div className="result-stats">
        <div><span>Dryck</span><strong>{(basket.totalVolumeMl / 1000).toLocaleString("sv-SE", { maximumFractionDigits: 2 })} liter</strong></div>
        <div><span>Varor</span><strong>{money(basket.productTotalCents)}</strong></div>
        <div><span>Pant</span><strong>{money(basket.depositTotalCents)}</strong></div>
        <div><span>Kvar</span><strong className="remaining">{money(basket.remainingCents)}</strong></div>
      </div>
    </article>
  );
}

export default function App() {
  const [budget, setBudget] = useState("87");
  const [categories, setCategories] = useState<Category[]>(["beer", "cider"]);
  const [packageTypes, setPackageTypes] = useState<PackageType[]>(["can33", "can50"]);
  const [minAlcohol, setMinAlcohol] = useState("0");
  const [catalogProducts, setCatalogProducts] = useState<Product[]>(demoProducts);
  const [catalogSource, setCatalogSource] = useState("Syntetisk testdata");
  const [catalogUpdatedAt, setCatalogUpdatedAt] = useState<string | null>(null);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  const preferences: Preferences = {
    categories,
    packageTypes,
    minAlcoholPercent: Math.max(0, Number(minAlcohol) || 0)
  };

  const budgetCents = Math.max(0, Math.round((Number(budget) || 0) * 100));
  const results = useMemo(
    () => calculateBaskets(catalogProducts, budgetCents, preferences),
    [catalogProducts, budgetCents, categories, packageTypes, minAlcohol]
  );

  const importCsv = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const parsed = parseProductCsv(await file.text());
      setCatalogProducts(parsed.products);
      setCatalogSource(`Importerad fil: ${file.name}`);
      setCatalogUpdatedAt(new Date().toLocaleString("sv-SE"));
      setCatalogError(null);
    } catch (error) {
      setCatalogError(error instanceof Error ? error.message : "Kunde inte läsa CSV-filen.");
    } finally {
      event.target.value = "";
    }
  };

  const useDemoData = () => {
    setCatalogProducts(demoProducts);
    setCatalogSource("Syntetisk testdata");
    setCatalogUpdatedAt(null);
    setCatalogError(null);
  };

  const toggleCategory = (category: Category) => {
    setCategories((current) =>
      current.includes(category) ? current.filter((item) => item !== category) : [...current, category]
    );
  };

  const togglePackage = (type: PackageType) => {
    setPackageTypes((current) =>
      current.includes(type) ? current.filter((item) => item !== type) : [...current, type]
    );
  };

  const reset = () => {
    setBudget("87");
    setCategories(["beer", "cider"]);
    setPackageTypes(["can33", "can50"]);
    setMinAlcohol("0");
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Systemkoll startsida">
          <span className="brand-mark"><ShoppingBasket size={21} /></span>
          <span>system<span>koll</span></span>
        </a>
        <span className="top-note">DIN PENG · DINA VAL</span>
      </header>

      <section className="intro">
        <div className="intro-copy">
          <p className="eyebrow">SMARTARE INKÖPSLISTA</p>
          <h1>Vad får jag för<br /><em>mina slantar?</em></h1>
          <p className="intro-text">Skriv vad du har. Välj vad du är ute efter. Få färdiga förslag – med pant inräknad.</p>
        </div>
        <div className="intro-stamp"><Calculator size={27} /><span>Räkna<br />åt mig</span></div>
      </section>

      <section className="workspace">
        <aside className="controls-panel">
          <div className="section-title"><span className="step-number">1</span><div><p className="eyebrow">DIN BUDGET</p><h2>Hur mycket har du?</h2></div></div>
          <label className="budget-field">
            <span className="sr-only">Budget i kronor</span>
            <input inputMode="decimal" type="number" min="0" step="1" value={budget} onChange={(event) => setBudget(event.target.value)} />
            <strong>kr</strong>
          </label>
          <p className="field-help">Vi räknar med pant i totalsumman.</p>

          <div className="control-divider" />
          <div className="section-title"><span className="step-number">2</span><div><p className="eyebrow">VAD ÄR DU SUGEN PÅ?</p><h2>Välj kategori</h2></div></div>
          <div className="choice-grid">
            {categoryOptions.map((option) => (
              <button key={option.id} type="button" className={categories.includes(option.id) ? "choice selected" : "choice"} onClick={() => toggleCategory(option.id)} aria-pressed={categories.includes(option.id)}>
                {option.id === "beer" ? <Beer size={17} /> : option.id === "wine" ? <Wine size={17} /> : <span className="choice-dot" />}
                {option.label}{categories.includes(option.id) && <Check className="choice-check" size={15} />}
              </button>
            ))}
          </div>

          <div className="control-divider" />
          <div className="section-title"><span className="step-number">3</span><div><p className="eyebrow">FÖRPACKNING</p><h2>Vad föredrar du?</h2></div></div>
          <div className="choice-grid compact">
            {packageOptions.map((option) => (
              <button key={option.id} type="button" className={packageTypes.includes(option.id) ? "choice selected" : "choice"} onClick={() => togglePackage(option.id)} aria-pressed={packageTypes.includes(option.id)}>
                {option.label}{packageTypes.includes(option.id) && <Check className="choice-check" size={15} />}
              </button>
            ))}
          </div>

          <div className="control-divider" />
          <div className="section-title"><span className="step-number">4</span><div><p className="eyebrow">VALFRITT FILTER</p><h2>Minsta alkoholhalt</h2></div></div>
          <label className="percent-field">
            <input type="number" min="0" max="100" step="0.1" value={minAlcohol} onChange={(event) => setMinAlcohol(event.target.value)} />
            <strong>%</strong>
          </label>
          <p className="field-help">Lämna på 0 om du inte vill filtrera.</p>

          <button className="reset-button" type="button" onClick={reset}><RotateCcw size={15} /> Återställ val</button>
        </aside>

        <section className="results-panel">
          <div className="results-header">
            <div><p className="eyebrow">DINA INKÖPSFÖRSLAG</p><h2>Det här ryms i budgeten</h2></div>
            <span className="budget-pill">{money(budgetCents)} att handla för</span>
          </div>
          <div className="catalog-import">
            <div className="catalog-source">
              <FileSpreadsheet size={17} />
              <div><strong>{catalogSource}</strong><span>{catalogUpdatedAt ? `Importerad ${catalogUpdatedAt} · endast lokalt i denna flik` : "Ingen verifierad livekälla ansluten"}</span></div>
            </div>
            <label className="import-button">
              <Upload size={15} /> Importera CSV
              <input type="file" accept=".csv,text/csv" onChange={importCsv} />
            </label>
            {catalogUpdatedAt && <button className="demo-switch" type="button" onClick={useDemoData}>Återgå till testdata</button>}
            <a className="template-link" href="/systemkoll-importmall.csv" download><FileSpreadsheet size={13} /> Importmall</a>
          </div>
          {catalogError && <div className="catalog-error" role="alert">{catalogError}</div>}
          <div className="demo-warning"><CircleHelp size={17} /><span><strong>Datakälla:</strong> {catalogUpdatedAt ? "Uppgifterna kommer från din importerade fil. Vi har inte verifierat filens ursprung eller aktualitet." : "Priser och produkter är påhittad testdata. Inte Systembolagets aktuella sortiment."} Kontrollera alltid pris och lager med butiken innan du åker.</span></div>
          <div className="results-list">
            <BasketResult title="Flest förpackningar" hint="Räknar antal – pant ingår." basket={results.mostPackages} />
            <BasketResult title="Mest dryck i volym" hint="Jämför total mängd dryck." basket={results.mostVolume} />
            <BasketResult title="Billigaste möjliga köp" hint="Lägsta totalsumma för minst en produkt." basket={results.lowestCheckout} />
          </div>
          <div className="next-step-note"><ArrowDownRight size={18} /><p><strong>Datakvalitet först:</strong> automatisk Systembolaget-koppling kräver klarerat tillstånd. Importerade uppgifter märks som importerade och blir inte live-data av sig själva.</p></div>
        </section>
      </section>

      <footer className="footer"><span>systemkoll · tidig prototyp</span><span>Räkna rätt. Välj själv.</span></footer>
    </main>
  );
}
