# Systemkoll – datakällor och verifiering

Uppdaterad: 2026-11-17.

## Beslut

Systemkoll ska inte automatiskt hämta eller spegla Systembolagets produkt-, bild-, lager- eller butikstider från deras webbplats eller app utan uttryckligt tillstånd/licens.

Systembolagets publicerade allmänna användarvillkor förbjuder automatiska verktyg för insamling eller reproduktion av information från webbplatsen och appen när syftet är att erbjuda funktioner eller tjänster relaterade till marknadsföring av eller information om alkoholdrycker. Det är direkt relevant för Systemkolls planerade användning. Se:
- https://www.systembolaget.se/allmanna-anvandarvillkor/

Att en endpoint, nyckel eller datamängd går att nå tekniskt innebär inte att Systemkoll har rätt att samla in, lagra, återpublicera eller kommersiellt använda informationen.

## Undersökta kandidater

| Källa | Tekniskt innehåll | Status för Systemkoll |
|---|---|---|
| Systembolagets webbplats/app | Produktinformation, bilder, butik, öppettider och lager | Ingen automatisk insamling utan skriftligt tillstånd |
| systembolaget.wwn.se / wwn.workers.dev | Read-only produkt-API, cache 24 h, dokumenterad paginering och filtrering | Tredjepartsspegel; källkedja går via susbolaget.emrik.org. Inte godkänd som produktionskälla utan rättighetsklarering |
| C4illin/systembolaget-data / susbolaget.emrik.org | Daglig spegling av produktdata | Tekniskt intressant men bygger på automatiserad hämtning; inte produktionskälla utan klarering |
| AlexGustafsson/systembolaget-api | Go-klient för öppna/stängda API:er, sortiment, butiker och lagerstatus | Reverse-engineerad åtkomst. Inte officiell produkt-API-licens |
| LuMa2003/systembolaget-mcp | Dokumenterar webb- och mobil-API, produkt-, butik- och lagerendpoints | Reverse engineering; nycklar och endpoints kan roteras. Inte produktionskälla utan klarering |
| dcronqvist/systembolaget-api | Tredjeparts-REST för produkter och butikslager | Projektets README säger att tjänsten är pausad medan villkorsfrågan diskuteras |

Tekniska referenser:
- https://systembolaget.wwn.se/api
- https://github.com/C4illin/systembolaget-data
- https://github.com/AlexGustafsson/systembolaget-api
- https://github.com/LuMa2003/systembolaget-mcp
- https://github.com/dcronqvist/systembolaget-api

## Vad som faktiskt är verifierat

- wwn:s API-dokumentation beskriver ett read-only JSON-API, 24 timmars cache och daglig kataloguppdatering.
- C4illin beskriver sin tjänst som en workaround och säger att datan uppdateras dagligen.
- AlexGustafssons klient hämtar sortiment, butiker och produktstatus/lager via öppna och stängda API:er.
- LuMa2003:s dokumentation beskriver reverse-engineerade web- och mobil-API:er. Det är en communitydokumentation, inte Systembolagets officiella API-kontrakt.
- dcronqvist-projektet uppger uttryckligen att dess API inte är tillgängligt medan villkorsfrågan diskuteras.

Dessa uppgifter verifierar att tekniska gränssnitt finns eller har funnits. De verifierar inte att Systemkoll har tillstånd att använda dem.

## Nuvarande importväg

MVP:n stöder användarinitierad import av en CSV-fil. Användaren måste själv ha rätt att använda uppgifterna i filen. Importen:
- kräver explicit pris och pant; saknade värden antas inte vara noll
- validerar artikelnummer, kategori, volym, alkoholhalt, pris och pant
- behåller värdena som importerades och visar inte filen som live-data
- hämtar inte automatiskt bilder eller lagerstatus

Importmallen finns i `public/systemkoll-importmall.csv`.

## Datakvalitetsregler

1. Varje datapost ska bära källa och hämtningstid/importtid.
2. Pris, pant, alkoholhalt, volym och lager ska vara separata fält.
3. Okänt värde ska förbli okänt – aldrig ersättas med ett gissat standardvärde.
4. Lagerstatus ska ha egen tidsstämpel och får inte härledas från att en produkt finns i sortimentet.
5. Butikens öppettider ska ha egen källa och uppdateringstid.
6. Produktbilder får bara användas när rättigheterna är klarerade.
7. En källa som slutar svara ska ge ett tydligt fel eller senast uppdaterade cache med åldersvarning, inte falskt färska uppgifter.

## Nästa steg för officiell integration

Begär skriftligt besked från Systembolaget om:
- tillåten produktdataåtkomst för en personlig app/prototyp
- rätt att visa produktnamn, pris, pant, alkoholhalt, volym och produktbilder
- rätt att visa butiksspecifik lagerstatus och hyllplats
- uppdateringsfrekvens, cache, attribution och kommersiella villkor
- om det finns en partner-/licensierad API-väg

Kontaktväg och besked ska sparas i projektets dokumentation innan en automatisk integration aktiveras.
