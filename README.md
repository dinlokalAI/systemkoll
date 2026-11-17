# Systemkoll

**Vad får jag för mina slantar på bolaget?**

Systemkoll ska göra det enkelt att ange en budget, välja kategorier och preferenser och få begripliga inköpsförslag där pant räknas in.

## Första prototypen

Den första MVP:n innehåller:

- budget i kronor
- val av produktkategori
- val av förpackningsstorlek
- valfritt filter för minsta alkoholhalt
- tre separata inköpsförslag: flest förpackningar, mest dryck i volym och billigaste möjliga köp
- separat redovisning av varupriser, pant, totalsumma och pengar kvar
- deterministisk beräkningsmotor med tester

**Viktigt:** katalogen består just nu av syntetiska testprodukter och påhittade priser. Den är inte Systembolagets sortiment och ska inte användas som pris- eller lagerinformation.

## Kör lokalt

Kräver Node.js 20 eller senare.

```bash
npm install
npm run dev
```

Tester och produktionsbygge:

```bash
npm test
npm run build
```

## Struktur

- `src/domain/` – gemensamma datatyper
- `src/catalog/` – produktkatalog och källadaptergränssnitt
- `src/basket/` – fristående, deterministisk varukorgsberäkning
- `src/App.tsx` – användargränssnitt
- `tests/` – tester av beräkningsmotorn

## Datakällor och nästa tekniska grind

Ingen livekoppling till Systembolaget är aktiverad. Innan en sådan byggs ska källa, villkor, uppdateringsfrekvens, bildrättigheter, prisernas aktualitet och eventuell butiksspecifik lagerstatus granskas. Appen ska visa när katalogen senast uppdaterades och aldrig presentera exempeldata som riktiga priser.

## Licens

Se [LICENSE](./LICENSE). Icke-kommersiell användning omfattas av speciallicensen. Kommersiell användning kräver separat skriftligt avtal.
